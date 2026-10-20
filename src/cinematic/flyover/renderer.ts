/**
 * محرك WebGL2 لمشهد Flyover
 * - إنشاء سياق WebGL2 مع fallback إلى Canvas2D/CSS3D
 * - تجميع الشيدرات وتهيئة المخازن
 * - تحميل القوام (textures) من لقطات Playwright أو توليدها إجرائياً
 * - رسم طبقات بعمق مختلف مع DOF وإضاءة وظلال ناعمة
 */

import { fragmentShaderSourceSimple, vertexShaderSource } from './shaders';
import type { SceneLayer } from './layers';
import { evaluateCamera, lookAt, perspective, multiply } from './camera';
import type { FlyoverConfig } from './legacy-types';

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`فشل تجميع الشيدر: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`فشل ربط البرنامج: ${log}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

export class FlyoverRenderer {
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private vbo: WebGLBuffer | null = null;
  private textures = new Map<string, WebGLTexture>();
  private fallbackTextures = new Map<string, HTMLCanvasElement>();
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private canvas: HTMLCanvasElement;
  private config: FlyoverConfig;
  private layers: SceneLayer[] = [];
  private rafId = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement, config: FlyoverConfig, layers: SceneLayer[]) {
    this.canvas = canvas;
    this.config = config;
    this.layers = layers;
  }

  async init(): Promise<boolean> {
    const gl = this.canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false }) as WebGL2RenderingContext | null;
    if (!gl) return false;

    this.gl = gl;
    try {
      this.program = createProgram(gl, vertexShaderSource, fragmentShaderSourceSimple);
    } catch (e) {
      console.warn('[Flyover] فشل إنشاء الشيدرات، fallback إلى Canvas2D', e);
      return false;
    }

    gl.useProgram(this.program);

    // جمع مواقع الـ uniforms
    const uniNames = ['uMVP', 'uModel', 'uTime', 'uDepthIntensity', 'uParallaxStrength', 'uTexture', 'uFocusDistance', 'uAperture', 'uLightDir', 'uLightColor', 'uAmbient', 'uShadowStrength'];
    for (const n of uniNames) {
      this.uniforms[n] = gl.getUniformLocation(this.program, n);
    }

    // VAO + VBO: رباعي واحد يُعاد استعماله لكل طبقة (مع instance data)
    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    // إعداد الـ attributes (سنملأها لكل طبقة)
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);

    gl.bindVertexArray(null);

    // تفعيل الشفافية والعمق
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // توليد قوام إجرائية للطبقات التجريبية
    this.generateProceduralTextures();

    // تحميل الصور الخارجية إن وجدت
    await this.loadExternalTextures();

    return true;
  }

  private generateProceduralTextures() {
    const makeCard = (w: number, h: number, bg: string, accent: string, title: string, subtitle: string) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      // خلفية بتدرج
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, bg);
      g.addColorStop(1, shadeColor(bg, -18));
      ctx.fillStyle = g;
      roundRect(ctx, 0, 0, w, h, 24);
      ctx.fill();

      // حد خفيف
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 2;
      roundRect(ctx, 1, 1, w - 2, h - 2, 24);
      ctx.stroke();

      // عنوان
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${Math.round(h * 0.12)}px Cairo, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(title, w - 28, h * 0.28);

      ctx.fillStyle = 'rgba(248,250,252,0.7)';
      ctx.font = `${Math.round(h * 0.06)}px Cairo, sans-serif`;
      ctx.fillText(subtitle, w - 28, h * 0.42);

      // شريط accent
      ctx.fillStyle = accent;
      roundRect(ctx, 28, h - 38, w - 56, 8, 4);
      ctx.fill();

      // نقاط زخرفية
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.12 - i * 0.03})`;
        ctx.beginPath();
        ctx.arc(w - 36 - i * 16, 32, 6 - i, 0, Math.PI * 2);
        ctx.fill();
      }

      return c;
    };

    const makeImage = (w: number, h: number, bg: string) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, bg);
      g.addColorStop(0.5, shadeColor(bg, 12));
      g.addColorStop(1, bg);
      ctx.fillStyle = g;
      roundRect(ctx, 0, 0, w, h, 20);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `bold ${Math.round(h * 0.18)}px Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('صورة / واجهة', w / 2, h / 2 + 6);
      return c;
    };

    const makeLogos = (w: number, h: number) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, 0, 0, w, h, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 1, 1, w - 2, h - 2, 20);
      ctx.stroke();
      const logos = ['◈', '⬢', '⬣', '⬔'];
      const cols = 4;
      const cw = w / cols;
      logos.forEach((lg, i) => {
        const x = cw * i + cw / 2;
        ctx.fillStyle = `hsl(${40 + i * 28} 90% 62%)`;
        ctx.font = `bold ${Math.round(h * 0.32)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lg, x, h / 2 - 6);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${Math.round(h * 0.08)}px Cairo, sans-serif`;
        ctx.fillText(`شريك ${i + 1}`, x, h / 2 + h * 0.22);
      });
      return c;
    };

    const makeHero = (w: number, h: number) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1e293b');
      g.addColorStop(1, '#020617');
      ctx.fillStyle = g;
      roundRect(ctx, 0, 0, w, h, 28);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = `900 ${Math.round(h * 0.22)}px Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('قالب العرض التقديمي', w / 2, h * 0.38);
      ctx.fillStyle = 'rgba(248,250,252,0.8)';
      ctx.font = `${Math.round(h * 0.09)}px Cairo, sans-serif`;
      ctx.fillText('حكاية تُروى بحركةٍ سينمائية — من الصفحة إلى المشهد ثلاثي الأبعاد', w / 2, h * 0.58);
      // خط ذهبي
      ctx.fillStyle = '#fbbf24';
      roundRect(ctx, w / 2 - 80, h * 0.68, 160, 3, 2);
      ctx.fill();
      return c;
    };

    const makeBg = (w: number, h: number) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(w / 2, h * 0.2, 0, w / 2, h * 0.5, w * 0.9);
      g.addColorStop(0, '#1e293b');
      g.addColorStop(0.5, '#0f172a');
      g.addColorStop(1, '#020617');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // شبكة خفيفة
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      return c;
    };

    // مقاسات منطقية لكل نوع
    this.fallbackTextures.set('__gradient_bg__', makeBg(1920, 1080));
    this.fallbackTextures.set('__card_hero__', makeHero(1280, 320));
    this.fallbackTextures.set('__card_1__', makeCard(520, 280, '#0ea5e9', '#38bdf8', 'الدراسة التمهيدية', 'تعريف المؤسسة ونقد النظام القائم'));
    this.fallbackTextures.set('__card_2__', makeCard(520, 280, '#7c3aed', '#a78bfa', 'التصميم المفاهيمي', 'نماذج البيانات وقواعد التسيير'));
    this.fallbackTextures.set('__card_3__', makeCard(520, 280, '#059669', '#34d399', 'التنفيذ التقني', 'الواجهات والحماية والاختبار'));
    this.fallbackTextures.set('__image_1__', makeImage(760, 180, '#e11d48'));
    this.fallbackTextures.set('__logos__', makeLogos(720, 180));
  }

  private async loadExternalTextures() {
    if (!this.gl || typeof Image === 'undefined') return;
    const gl = this.gl;

    for (const layer of this.layers) {
      if (layer.textureKey.startsWith('__')) continue;
      // حاول تحميل الصورة من src
      try {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.textureKey;
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('load failed'));
          // مهلة 2 ثانية
          setTimeout(() => rej(new Error('timeout')), 2000);
        });
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.textures.set(layer.textureKey, tex);
      } catch {
        // استعمل fallback
      }
    }

    // حمّل fallback textures إلى WebGL
    for (const [key, canvas] of this.fallbackTextures) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.textures.set(key, tex);
    }
  }

  updateConfig(config: FlyoverConfig) {
    this.config = config;
  }

  updateLayers(layers: SceneLayer[]) {
    this.layers = layers;
  }

  private getTextureForLayer(key: string): WebGLTexture | null {
    if (this.textures.has(key)) return this.textures.get(key)!;
    // خذ أول fallback
    const fallbackKey = this.fallbackTextures.keys().next().value;
    if (fallbackKey) return this.textures.get(fallbackKey) ?? null;
    return null;
  }

  render(timeSec: number) {
    if (!this.gl || !this.program || !this.vao) return;
    const gl = this.gl;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const w = this.canvas.clientWidth * dpr;
    const h = this.canvas.clientHeight * dpr;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const cam = evaluateCamera(this.config, timeSec);
    const aspect = w / Math.max(h, 1);
    const proj = perspective(cam.fov, aspect, 0.1, 100);
    const view = lookAt(cam.position, cam.target);
    const vp = multiply(proj, view);

    gl.clearColor(0.02, 0.04, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // uniforms عامة
    gl.uniform1f(this.uniforms['uTime'], timeSec);
    gl.uniform1f(this.uniforms['uDepthIntensity'], this.config.depthIntensity);
    gl.uniform1f(this.uniforms['uParallaxStrength'], this.config.depthIntensity * 0.9);
    gl.uniform1f(this.uniforms['uFocusDistance'], this.config.focusDistance);
    gl.uniform1f(this.uniforms['uAperture'], this.config.aperture);
    gl.uniform3f(this.uniforms['uLightDir'], -0.5, 0.8, 0.6);
    gl.uniform3f(this.uniforms['uLightColor'], 1, 0.96, 0.88);
    gl.uniform3f(this.uniforms['uAmbient'], 0.28, 0.30, 0.38);
    gl.uniform1f(this.uniforms['uShadowStrength'], this.config.softShadows ? 1 : 0);

    // ارسم الطبقات من الأبعد إلى الأقرب (ترتيب العمق)
    const sorted = [...this.layers].sort((a, b) => a.depth - b.depth);

    for (const layer of sorted) {
      const tex = this.getTextureForLayer(layer.textureKey);
      if (!tex) continue;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(this.uniforms['uTexture'], 0);

      // مصفوفة النموذج: ترجمة + تدوير + مقياس
      const model = buildModelMatrix(layer, timeSec);
      const mvp = multiply(vp, model);
      gl.uniformMatrix4fv(this.uniforms['uMVP'], false, mvp);
      gl.uniformMatrix4fv(this.uniforms['uModel'], false, model);

      // بيانات الرؤوس: رباعي بمقياس layer.scale
      const data = buildQuadData(layer);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

      const stride = 7 * 4; // 3 pos + 2 uv + 1 depth + 1 elev
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 3 * 4);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 5 * 4);
      gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 6 * 4);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    gl.bindVertexArray(null);
  }

  start(onFrame?: (t: number) => void) {
    if (this.running) return;
    this.running = true;
    let start = performance.now();
    const loop = () => {
      if (!this.running) return;
      const now = performance.now();
      const elapsed = (now - start) / 1000;
      // حلقة تكرارية
      const t = elapsed * this.config.speed % (this.config.duration + 0.001);
      this.render(t);
      onFrame?.(t);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  /** معاينة إطار عند نقطة زمنية محددة */
  previewAt(timeSec: number) {
    this.render(timeSec);
  }

  /** تصدير الإطار الحالي كصورة */
  exportFrame(): string {
    return this.canvas.toDataURL('image/png');
  }

  dispose() {
    this.stop();
    if (!this.gl) return;
    const gl = this.gl;
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.vbo) gl.deleteBuffer(this.vbo);
    if (this.program) gl.deleteProgram(this.program);
    for (const tex of this.textures.values()) gl.deleteTexture(tex);
    this.textures.clear();
  }
}

function buildModelMatrix(layer: SceneLayer, time: number): Float32Array {
  const { position, scale, rotation } = layer;
  const elev = layer.elevation;
  // اهتزاز طفيف للبطاقات المرفوعة
  const breathe = elev > 0 ? Math.sin(time * 0.9 + position[0] * 2) * 0.015 : 0;
  const yOff = breathe;

  const c = Math.cos((rotation * Math.PI) / 180);
  const s = Math.sin((rotation * Math.PI) / 180);
  const sx = scale[0];
  const sy = scale[1];

  // مصفوفة ترجمة * دوران Z * مقياس (عمود-رئيسي)
  return new Float32Array([
    c * sx, s * sx, 0, 0,
    -s * sy, c * sy, 0, 0,
    0, 0, 1, 0,
    position[0], position[1] + yOff, position[2], 1,
  ]);
}

function buildQuadData(layer: SceneLayer): Float32Array {
  // رباعي مركزي 1×1 سيُقاس عبر model matrix
  // كل رأس: pos(3) + uv(2) + depth(1) + elevation(1) = 7 floats
  const d = layer.depth;
  const e = layer.elevation;
  return new Float32Array([
    // x, y, z, u, v, depth, elevation
    -0.5, 0.5, 0, 0, 0, d, e,
    -0.5, -0.5, 0, 0, 1, d, e,
    0.5, 0.5, 0, 1, 0, d, e,
    0.5, -0.5, 0, 1, 1, d, e,
  ]);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shadeColor(hex: string, amt: number): string {
  try {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  } catch {
    return hex;
  }
}
