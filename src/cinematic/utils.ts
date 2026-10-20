/**
 * أدوات عامة — رياضيات المصفوفات، تحميل الصور، أبعاد الصفحة المثبتة
 */

// ─── مصفوفات 4×4 (column-major) ───────────────────────────────
export type Mat4 = Float32Array; // 16 عنصر
export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export function mat4Identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function mat4Perspective(fovDeg: number, aspect: number, near: number, far: number): Mat4 {
  const fovRad = (fovDeg * Math.PI) / 180;
  const f = 1 / Math.tan(fovRad / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  // m[15] = 0 (افتراضي)
  return m;
}

export function mat4LookAt(eye: Vec3, target: Vec3, up: Vec3 = [0, 1, 0]): Mat4 {
  const zAxis: Vec3 = normalize(sub(eye, target));
  const xAxis: Vec3 = normalize(cross(up, zAxis));
  const yAxis: Vec3 = cross(zAxis, xAxis);

  const m = new Float32Array(16);
  m[0] = xAxis[0];
  m[1] = yAxis[0];
  m[2] = zAxis[0];
  m[3] = 0;
  m[4] = xAxis[1];
  m[5] = yAxis[1];
  m[6] = zAxis[1];
  m[7] = 0;
  m[8] = xAxis[2];
  m[9] = yAxis[2];
  m[10] = zAxis[2];
  m[11] = 0;
  m[12] = -dot(xAxis, eye);
  m[13] = -dot(yAxis, eye);
  m[14] = -dot(zAxis, eye);
  m[15] = 1;
  return m;
}

export function mat4Translate(m: Mat4, v: Vec3): Mat4 {
  const out = new Float32Array(m);
  out[12] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
  out[13] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
  out[14] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
  out[15] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15];
  return out;
}

export function mat4Scale(m: Mat4, v: Vec3): Mat4 {
  const out = new Float32Array(m);
  out[0] *= v[0];
  out[1] *= v[0];
  out[2] *= v[0];
  out[3] *= v[0];
  out[4] *= v[1];
  out[5] *= v[1];
  out[6] *= v[1];
  out[7] *= v[1];
  out[8] *= v[2];
  out[9] *= v[2];
  out[10] *= v[2];
  out[11] *= v[2];
  return out;
}

// ─── متجهات ───────────────────────────────────────────────────
export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
export function length3(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}
export function normalize(v: Vec3): Vec3 {
  const l = length3(v);
  if (l < 1e-6) return [0, 0, 0];
  return [v[0] / l, v[1] / l, v[2] / l];
}

// ─── تحميل صورة إلى texture ───────────────────────────────────
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // نحتاج CORS للـ canvas.toDataURL لاحقاً
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`فشل تحميل الصورة: ${src.slice(0, 80)}`));
    img.src = src;
  });
}

/**
 * ينشئ texture من HTMLImageElement
 */
export function createTextureFromImage(
  gl: WebGL2RenderingContext,
  img: HTMLImageElement,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error('تعذر إنشاء النسيج');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // قلب الصورة: WebGL يضع الأصل أسفل اليسار والصور أعلاه، فتُقلب عند الرفع
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

/**
 * نسيج 1×1 بلون ثابت (fallback)
 */
export function createSolidTexture(
  gl: WebGL2RenderingContext,
  color: [number, number, number, number] = [1, 1, 1, 1],
): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  const data = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

// ─── تثبيت الأبعاد — حساب letterbox والـ viewport ──────────────
export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** نسبة العرض إلى الارتفاع المحسوبة */
  aspect: number;
}

/**
 * يحسب مستطيل العرض مع تثبيت النسبة (letterbox).
 * يضمن سلاسة الحركة عبر منع تغيير الأبعاد أثناء الطيران.
 */
export function computeLetterbox(
  containerWidth: number,
  containerHeight: number,
  pageWidth: number,
  pageHeight: number,
): ViewportRect {
  const pageAspect = pageWidth / pageHeight;
  const containerAspect = containerWidth / containerHeight;

  let w: number, h: number, x: number, y: number;
  if (containerAspect > pageAspect) {
    // الحاوية أعرض — نثبت الارتفاع
    h = containerHeight;
    w = h * pageAspect;
    x = (containerWidth - w) / 2;
    y = 0;
  } else {
    w = containerWidth;
    h = w / pageAspect;
    x = 0;
    y = (containerHeight - h) / 2;
  }
  return { x, y, width: w, height: h, aspect: pageAspect };
}

/**
 * يحول إحداثيات الصفحة (bounds) إلى إحداثيات مشهد ثلاثي الأبعاد
 * المجال: x ∈ [-aspect, aspect], y ∈ [-1, 1] (مركز الصفحة = 0)
 */
export function boundsToScene(
  bounds: { x: number; y: number; width: number; height: number },
  pageWidth: number,
  pageHeight: number,
): { x: number; y: number; w: number; h: number } {
  const aspect = pageWidth / pageHeight;
  // نحول البكسل إلى وحدات المشهد (ارتفاع المشهد = 2، من -1 إلى 1)
  const sceneH = 2;
  const pxToScene = sceneH / pageHeight;

  const cx = (bounds.x + bounds.width / 2 - pageWidth / 2) * pxToScene;
  // نقلب Y (في الصفحة Y لأسفل، في المشهد Y لأعلى)
  const cy = -(bounds.y + bounds.height / 2 - pageHeight / 2) * pxToScene;
  const w = bounds.width * pxToScene;
  const h = bounds.height * pxToScene;

  // صحح نسبة العرض
  void aspect;
  return { x: cx, y: cy, w, h };
}

// ─── تحويل لون hex إلى rgb ───────────────────────────────────
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const v = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(v)) return [1, 1, 1];
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

// ─── تقليل الحركة ─────────────────────────────────────────────
export function shouldReduceMotion(respect: boolean): boolean {
  if (!respect) return false;
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// ─── دوال زمنية ───────────────────────────────────────────────
export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}.${ms}`;
  return `${s}.${ms}s`;
}

// ─── عمليات مصفوفات إضافية (للميل والرفع) ────────────────────
export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

export function mat4RotateX(m: Mat4, rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  const r = new Float32Array([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ]);
  return mat4Multiply(m, r);
}

export function mat4RotateY(m: Mat4, rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  const r = new Float32Array([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ]);
  return mat4Multiply(m, r);
}

export function mat4RotateZ(m: Mat4, rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  const r = new Float32Array([
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
  return mat4Multiply(m, r);
}

/** اتجاه الظل/الإضاءة بعد الميل — تقريب كافٍ للإضاءة الناعمة */
export function rotatedNormal(rx: number, ry: number): Vec3 {
  // المتجه الأصلي (0,0,1) بعد دوران X ثم Y
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const x = sy * cx;
  const y = -sx;
  const z = cy * cx;
  return normalize([x, y, z]);
}
