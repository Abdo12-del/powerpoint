/**
 * FlyoverRenderer — مصيّر WebGL2 كامل للعرض السينمائي
 * يعزل كل حالة WebGL عن React: تهيئة، أقنعة، ظلال، جزيئات، معالجة لاحقة.
 */

import type { CaptureLayer, FlyoverConfig } from './types';
import { DEFAULT_PAGE_DIMENSIONS, DEFAULT_FLYOVER_CONFIG } from './types';
import { evaluateCamera, resolvePhase } from './camera';
import {
  SCENE_VERTEX,
  SCENE_FRAGMENT,
  SHADOW_VERTEX,
  SHADOW_FRAGMENT,
  PARTICLE_VERTEX,
  PARTICLE_FRAGMENT,
  POST_VERTEX,
  POST_FRAGMENT,
  FINAL_CARD_VERTEX,
  FINAL_CARD_FRAGMENT,
  createProgram,
} from './shaders';
import {
  mat4Perspective,
  mat4LookAt,
  mat4Translate,
  mat4Scale,
  mat4RotateX,
  mat4RotateY,
  mat4RotateZ,
  mat4Multiply,
  mat4Identity,
  boundsToScene,
  computeLetterbox,
  hexToRgb,
  loadImage,
  createTextureFromImage,
  createSolidTexture,
  clamp01,
  type Mat4,
} from './utils';

const QUAD = new Float32Array([
  -1, -1, 1, -1, 1, 1,
  -1, -1, 1, 1, -1, 1,
]);
const QUAD_UV = new Float32Array([
  0, 0, 1, 0, 1, 1,
  0, 0, 1, 1, 0, 1,
]);

interface SceneResources {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  vao: WebGLVertexArrayObject;
}

interface ShadowResources {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

interface ParticleResources {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  vao: WebGLVertexArrayObject;
  count: number;
}

interface PostResources {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  vao: WebGLVertexArrayObject;
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

interface FinalResources {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  vao: WebGLVertexArrayObject;
}

function names(gl: WebGL2RenderingContext, program: WebGLProgram, list: string[]) {
  const out: Record<string, WebGLUniformLocation | null> = {};
  for (const n of list) out[n] = gl.getUniformLocation(program, n);
  return out;
}

export class FlyoverRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  private config: FlyoverConfig;
  private layers: CaptureLayer[] = [];
  private textures = new Map<string, WebGLTexture>();
  private fallbackTexture: WebGLTexture;
  private scene: SceneResources;
  private shadow: ShadowResources;
  private particles: ParticleResources;
  private post: PostResources;
  private final: FinalResources;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private disposed = false;
  /** نسبة الـ letterbox الفعلية داخل الـ canvas */
  letterbox = { x: 0, y: 0, width: 1, height: 1, aspect: 16 / 10 };

  constructor(canvas: HTMLCanvasElement, config: FlyoverConfig) {
    this.canvas = canvas;
    this.config = config;
    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: false,
      depth: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 غير مدعوم في هذا المتصفح');
    this.gl = gl;

    // Scene
    const sceneProgram = createProgram(gl, SCENE_VERTEX, SCENE_FRAGMENT);
    this.scene = {
      program: sceneProgram,
      uniforms: names(gl, sceneProgram, [
        'uProjection', 'uView', 'uModel', 'uParallax', 'uDepth', 'uCameraOffset',
        'uTexture', 'uHasTexture', 'uTint', 'uOpacity', 'uTime', 'uLift', 'uRound', 'uShadowAmount',
        'uDofEnabled', 'uFocusDistance', 'uFocusRange', 'uDofIntensity', 'uMaxBlur',
        'uAmbientColor', 'uAmbientIntensity', 'uDirColor', 'uDirIntensity', 'uDirDirection',
        'uFillColor', 'uFillIntensity', 'uShadowDarkness',
      ]),
      vao: this.createQuadVao(),
    };

    // Shadow
    const shadowProgram = createProgram(gl, SHADOW_VERTEX, SHADOW_FRAGMENT);
    this.shadow = {
      program: shadowProgram,
      uniforms: names(gl, shadowProgram, ['uProjection', 'uView', 'uModel', 'uDarkness', 'uSoftness']),
    };

    // Particles
    const particleProgram = createProgram(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
    this.particles = {
      program: particleProgram,
      uniforms: names(gl, particleProgram, ['uProjection', 'uView', 'uTime', 'uPixelRatio']),
      vao: this.createParticleVao(160),
      count: 160,
    };

    // Post
    const postProgram = createProgram(gl, POST_VERTEX, POST_FRAGMENT);
    const postVao = gl.createVertexArray();
    if (!postVao) throw new Error('تعذر إنشاء VAO للمعالجة اللاحقة');
    gl.bindVertexArray(postVao);
    const pbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const fbo = gl.createFramebuffer();
    const sceneTex = gl.createTexture();
    if (!fbo || !sceneTex) throw new Error('تعذر إنشاء إطار المعالجة');
    this.post = {
      program: postProgram,
      uniforms: names(gl, postProgram, [
        'uScene', 'uResolution', 'uTime', 'uVignette', 'uGrain', 'uChromatic', 'uFade', 'uFadeColor',
      ]),
      vao: postVao,
      fbo,
      texture: sceneTex,
      width: 0,
      height: 0,
    };

    // Final card
    const finalProgram = createProgram(gl, FINAL_CARD_VERTEX, FINAL_CARD_FRAGMENT);
    this.final = {
      program: finalProgram,
      uniforms: names(gl, finalProgram, ['uProgress', 'uTime', 'uBrandColor', 'uBgTop', 'uBgBottom']),
      vao: this.createQuadVao(),
    };

    this.fallbackTexture = createSolidTexture(gl, [1, 1, 1, 1]);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.02, 0.03, 0.07, 1);
  }

  // ─── إنشاء VAO ────────────────────────────────────────────
  private createQuadVao(): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('تعذر إنشاء VAO');
    gl.bindVertexArray(vao);
    const pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uv = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uv);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_UV, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }

  private createParticleVao(count: number): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error('تعذر إنشاء VAO للجسيمات');
    gl.bindVertexArray(vao);
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      data[i * 4 + 0] = Math.random() * 2 - 1;
      data[i * 4 + 1] = Math.random() * 2 - 1;
      data[i * 4 + 2] = Math.random();
      data[i * 4 + 3] = Math.random();
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }

  // ─── الطبقات والنُسج ─────────────────────────────────────
  async setLayers(layers: CaptureLayer[]): Promise<void> {
    this.layers = layers;
    const gl = this.gl;
    // احذف القديم
    this.textures.forEach((t) => gl.deleteTexture(t));
    this.textures.clear();

    await Promise.all(
      layers.map(async (layer) => {
        if (!layer.src) return;
        try {
          const img = await loadImage(layer.src);
          if (this.disposed) return;
          const tex = createTextureFromImage(gl, img);
          this.textures.set(layer.id, tex);
        } catch {
          /* يستخدم اللون الاحتياطي */
        }
      }),
    );
  }

  setConfig(config: FlyoverConfig): void {
    this.config = config;
  }

  resize(cssWidth: number, cssHeight: number): void {
    // دقة عرض فائقة (supersampling) حتى على شاشات 1×: الطبقات تُلتقط بـ 1440px
    // فنصيرها عند 1.6× على الأقل يمنع ضبابية النص العربي عند التصغير.
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1.6), 2);
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (w === this.width && h === this.height && dpr === this.dpr) return;
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.resizePost(w, h);
  }

  private resizePost(w: number, h: number): void {
    const gl = this.gl;
    if (this.post.width === w && this.post.height === h) return;
    this.post.width = w;
    this.post.height = h;
    gl.bindTexture(gl.TEXTURE_2D, this.post.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.post.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.post.texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ─── الرسم ────────────────────────────────────────────────
  /**
   * يرسم إطاراً عند زمن معيّر t ∈ [0,1].
   * @param t الزمن المعيّر
   * @param seconds الزمن بالثواني (للجزيئات والتذبذب)
   */
  render(t: number, seconds: number): void {
    if (this.disposed) return;
    const gl = this.gl;
    const config = this.config;
    // ضمان وجود إطار معالجة مُهيّأً حتى لو تأخّر أول resize
    if (this.post.width === 0 || this.post.height === 0) {
      this.resizePost(Math.max(1, this.width), Math.max(1, this.height));
    }
    const tn = clamp01(t);
    const phase = resolvePhase(tn);
    const transition = tn >= 0.84 ? clamp01((tn - 0.84) / 0.16) : 0;
    const reduce = this.reduceMotion;

    // 1) ارسم المشهد في FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.post.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.017, 0.028, 0.06, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = this.width / Math.max(1, this.height);
    const cam = evaluateCamera(config.camera, tn);
    const proj = mat4Perspective(cam.fov, aspect, 0.05, 120);
    const view0 = mat4LookAt(cam.position, cam.target, [0, 1, 0]);
    const view = cam.roll ? mat4Multiply(mat4Identity(), mat4Multiply(view0, mat4RotateZ(mat4Identity(), (cam.roll * Math.PI) / 180))) : view0;

    // توهج خلفي (sky)
    this.drawBackdrop(tn);

    // الطبقات
    this.drawSceneLayers(tn, seconds, proj, view, reduce);

    // جزيئات
    this.drawParticles(seconds, proj, view);

    // ظلال البطاقات (تُرسم قبل الطبقات؟ نرسمها الآن فوق الخلفية بقليل — مقبول لأنها ظل ناعم)
    // (تُدمج فعلياً في drawSceneLayers عبر تمرير الظل)

    // الانتقال + البطاقة الختامية
    if (phase === 'transition' || phase === 'final') {
      this.drawFinal(tn, transition, seconds);
    }

    // 2) المعالجة اللاحقة إلى الشاشة
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.post.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.post.texture);
    gl.uniform1i(this.post.uniforms.uScene, 0);
    gl.uniform2f(this.post.uniforms.uResolution, this.width, this.height);
    gl.uniform1f(this.post.uniforms.uTime, seconds);
    gl.uniform1f(this.post.uniforms.uVignette, reduce ? 0.3 : 0.6);
    gl.uniform1f(this.post.uniforms.uGrain, reduce ? 0 : 0.02);
    gl.uniform1f(this.post.uniforms.uChromatic, reduce ? 0 : 0.006);
    gl.uniform1f(this.post.uniforms.uFade, phase === 'final' ? 0 : transition * 0.25);
    const fadeColor = hexToRgb('#070b14');
    gl.uniform3f(this.post.uniforms.uFadeColor, ...fadeColor);
    gl.bindVertexArray(this.post.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }

  private get reduceMotion(): boolean {
    if (!this.config.respectReducedMotion) return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }

  private drawBackdrop(t: number): void {
    const gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.final.program);
    gl.uniform1f(this.final.uniforms.uProgress, 1);
    gl.uniform1f(this.final.uniforms.uTime, t * 8);
    const warm = hexToRgb('#f59e0b');
    const top = hexToRgb('#0b1224');
    const bottom = hexToRgb('#070b14');
    gl.uniform3f(this.final.uniforms.uBrandColor, warm[0] * 0.5, warm[1] * 0.5, warm[2] * 0.5);
    gl.uniform3f(this.final.uniforms.uBgTop, ...top);
    gl.uniform3f(this.final.uniforms.uBgBottom, ...bottom);
    gl.bindVertexArray(this.final.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }

  private drawSceneLayers(
    tn: number,
    seconds: number,
    proj: Mat4,
    view: Mat4,
    reduce: boolean,
  ): void {
    const gl = this.gl;
    const config = this.config;
    const dims = config.dimensions ?? DEFAULT_PAGE_DIMENSIONS;
    const scene = this.scene;
    this.currentProj = proj;
    this.currentView = view;
    gl.useProgram(scene.program);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = scene.uniforms;
    gl.uniformMatrix4fv(u.uProjection, false, proj);
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniform1f(u.uTime, seconds);

    // DoF: التركيز يتحرك مع الكاميرا — يركز على العمق الذي تنظر إليه
    const focus = clamp01(config.dof.focusDistance + (tn - 0.5) * 0.22);
    gl.uniform1f(u.uDofEnabled, config.dof.enabled && !reduce ? 1 : 0);
    gl.uniform1f(u.uFocusDistance, focus);
    gl.uniform1f(u.uFocusRange, config.dof.focusRange);
    gl.uniform1f(u.uDofIntensity, config.dof.intensity);
    gl.uniform1f(u.uMaxBlur, config.dof.maxBlur * this.dpr * 0.55);

    const L = config.lighting;
    gl.uniform3f(u.uAmbientColor, ...hexToRgb(L.ambient.color));
    gl.uniform1f(u.uAmbientIntensity, L.ambient.intensity);
    gl.uniform3f(u.uDirColor, ...hexToRgb(L.directional.color));
    gl.uniform1f(u.uDirIntensity, L.directional.intensity);
    const dl = Math.hypot(...L.directional.direction) || 1;
    gl.uniform3f(
      u.uDirDirection,
      L.directional.direction[0] / dl,
      L.directional.direction[1] / dl,
      L.directional.direction[2] / dl,
    );
    gl.uniform3f(u.uFillColor, ...hexToRgb(L.fill.color));
    gl.uniform1f(u.uFillIntensity, L.fill.intensity);
    gl.uniform1f(u.uShadowDarkness, L.softShadows ? L.shadowDarkness : 0);

    const camOffset: [number, number] = [
      Math.sin(tn * Math.PI * 1.35) * 0.55,
      Math.cos(tn * Math.PI * 0.9) * 0.32,
    ];
    gl.uniform2f(u.uCameraOffset, camOffset[0], camOffset[1]);

    // ترتيب: الخلفية أولاً (اقرأ العمق تصاعدياً)
    const sorted = [...this.layers].sort((a, b) => a.depth - b.depth);

    // رفع البطاقات: تقدّم مستقل لكل طبقة
    const liftPhase = clamp01((tn - 0.14) / 0.62);

    for (let i = 0; i < sorted.length; i++) {
      const layer = sorted[i];
      const s = boundsToScene(layer.bounds, dims.width, dims.height);
      if (s.w < 0.0005 || s.h < 0.0005) continue;

      const depthRange = config.depth.range;
      const z = (layer.depth - 0.5) * depthRange * 1.2;
      const pShift = (layer.depth - 0.5) * config.depth.parallaxStrength;
      // تعويض المنظور: الطبقات تبقى متحاذية كصفحة واحدة عند بداية التحليق،
      // ثم يظهر العمق تدريجياً مع تقدّم الكاميرا (parallax طبيعي).
      const refDistance = 4.1;
      const perspectiveComp = Math.max(0.55, (refDistance - z) / refDistance);

      // رفع + ميل
      const delay = (i % 9) * config.depth.cardStagger;
      const raw = clamp01((liftPhase - delay) / 0.5);
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      // رفع متناسب مع حجم الطبقة: الشعارات الصغيرة لا ترتفع أكثر من البطاقات
      const liftScale = Math.min(1, Math.max(0.35, layer.bounds.height / 220));
      const lift = layer.liftable && !reduce ? eased * config.depth.cardLift * liftScale : 0;
      const tiltAmt = layer.liftable ? (eased * config.depth.cardTilt + Math.sin(seconds * 0.55 + i) * 0.6) : 0;
      const rx = ((layer.tilt?.rx ?? 0) * Math.PI) / 180 - (tiltAmt * Math.PI) / 180;
      const ry = ((layer.tilt?.ry ?? 0) * Math.PI) / 180 + (tiltAmt * 0.6 * Math.PI) / 180;

      // model = T * Rx * Ry * S
      let model = mat4Identity();
      model = mat4Translate(model, [
        s.x + camOffset[0] * pShift * 0.035,
        s.y + camOffset[1] * pShift * 0.03 - lift * 0.0004 - eased * 0.02,
        z + lift * 0.012,
      ]);
      model = mat4RotateX(model, rx);
      model = mat4RotateY(model, ry);
      model = mat4Scale(model, [(s.w / 2) * perspectiveComp, (s.h / 2) * perspectiveComp, 1]);

      // ظل ناعم تحت البطاقة المرفوعة
      if (layer.liftable && lift > 0.5) {
        this.drawShadow(s, z, lift, seconds);
      }

      gl.useProgram(scene.program);
      gl.uniformMatrix4fv(u.uModel, false, model);
      gl.uniform1f(u.uParallax, config.depth.parallaxStrength);
      gl.uniform1f(u.uDepth, layer.depth);
      gl.uniform1f(u.uOpacity, layer.opacity ?? 1);
      gl.uniform1f(u.uLift, lift);
      gl.uniform1f(u.uShadowAmount, Math.min(1, lift / Math.max(1, config.depth.cardLift)));
      gl.uniform1f(u.uRound, layer.kind === 'logo' ? 1 : layer.kind === 'card' ? 0.16 : layer.kind === 'image' ? 0.1 : 0);
      gl.uniform4f(u.uTint, 0.10, 0.14, 0.22, 1);

      const tex = this.textures.get(layer.id);
      if (tex) {
        gl.uniform1f(u.uHasTexture, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(u.uTexture, 0);
      } else {
        gl.uniform1f(u.uHasTexture, 0);
        const tints: Record<string, [number, number, number, number]> = {
          background: [0.04, 0.06, 0.12, 1],
          hero: [0.08, 0.14, 0.24, 1],
          card: [0.12, 0.16, 0.26, 1],
          image: [0.14, 0.16, 0.24, 1],
          logo: [0.18, 0.2, 0.3, 1],
          page: [0.06, 0.1, 0.2, 1],
        };
        const tint = tints[layer.kind] ?? [0.1, 0.14, 0.22, 1];
        gl.uniform4f(u.uTint, ...tint);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fallbackTexture);
        gl.uniform1i(u.uTexture, 0);
      }

      gl.bindVertexArray(scene.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    }
  }

  private drawShadow(s: { x: number; y: number; w: number; h: number }, z: number, lift: number, seconds: number): void {
    const gl = this.gl;
    const sh = this.shadow;
    gl.useProgram(sh.program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    // الظل أسفل الطبقة وبعمق أبعد
    let m = mat4Identity();
    const off = 0.006 + lift * 0.00035;
    m = mat4Translate(m, [s.x + off * 0.4, s.y - off - 0.006, z - 0.06]);
    m = mat4Scale(m, [s.w * 0.46, s.h * 0.36, 1]);

    gl.uniformMatrix4fv(sh.uniforms.uProjection, false, this.currentProj);
    gl.uniformMatrix4fv(sh.uniforms.uView, false, this.currentView);
    gl.uniformMatrix4fv(sh.uniforms.uModel, false, m);
    gl.uniform1f(sh.uniforms.uDarkness, Math.min(0.55, 0.12 + lift / Math.max(1, this.config.depth.cardLift) * 0.3));
    gl.uniform1f(sh.uniforms.uSoftness, 1.1 + Math.sin(seconds * 0.4) * 0.05);

    gl.bindVertexArray(this.scene.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }

  private currentProj: Mat4 = mat4Identity();
  private currentView: Mat4 = mat4Identity();

  private drawParticles(seconds: number, proj: Mat4, view: Mat4): void {
    const gl = this.gl;
    const p = this.particles;
    gl.useProgram(p.program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniformMatrix4fv(p.uniforms.uProjection, false, proj);
    gl.uniformMatrix4fv(p.uniforms.uView, false, view);
    gl.uniform1f(p.uniforms.uTime, seconds);
    gl.uniform1f(p.uniforms.uPixelRatio, this.dpr);
    gl.bindVertexArray(p.vao);
    gl.drawArrays(gl.POINTS, 0, p.count);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }

  private drawFinal(tn: number, transition: number, seconds: number): void {
    const gl = this.gl;
    const f = this.final;
    const p = tn >= 1 ? 1 : Math.pow(transition, 1.6);
    gl.useProgram(f.program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const brand = hexToRgb('#fbbf24');
    const top = hexToRgb('#111a30');
    const bottom = hexToRgb('#060911');
    gl.uniform1f(f.uniforms.uProgress, p);
    gl.uniform1f(f.uniforms.uTime, seconds);
    gl.uniform3f(f.uniforms.uBrandColor, ...brand);
    gl.uniform3f(f.uniforms.uBgTop, ...top);
    gl.uniform3f(f.uniforms.uBgBottom, ...bottom);

    gl.bindVertexArray(f.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }

  // ─── التقاط إطار ─────────────────────────────────────────
  capture(): string {
    return this.canvas.toDataURL('image/png');
  }

  dispose(): void {
    this.disposed = true;
    const gl = this.gl;
    this.textures.forEach((t) => gl.deleteTexture(t));
    this.textures.clear();
    gl.deleteTexture(this.fallbackTexture);
    gl.deleteTexture(this.post.texture);
    gl.deleteFramebuffer(this.post.fbo);
    [this.scene.program, this.shadow.program, this.particles.program, this.post.program, this.final.program].forEach((p) =>
      gl.deleteProgram(p),
    );
  }
}

/** نسبة الأبعاد المثبتة للصفحة — تُستخدم لتثبيت الحاوية */
export function fixedAspectStyle(config: FlyoverConfig): { aspectRatio: string } {
  const d = config.dimensions ?? DEFAULT_PAGE_DIMENSIONS;
  return { aspectRatio: `${d.width} / ${d.height}` };
}

export { computeLetterbox, DEFAULT_FLYOVER_CONFIG };
