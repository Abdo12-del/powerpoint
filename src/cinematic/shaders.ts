/**
 * مظللات WebGL2 للعرض السينمائي
 *  1) scene     — طبقات الصفحة في مساحة ثلاثية الأبعاد مع DoF وإضاءة وظلال
 *  2) shadow    — ظل ناعم تحت البطاقات المرفوعة
 *  3) particles — غبار سينمائي خفيف
 *  4) post      — لمسة نهائية: vignette + grain + انحراف لوني خفيف + bloom
 *  5) finalCard — خلفية البطاقة الختامية
 */

// ─────────────────────────────────────────────────────────────
// 1) Scene
// ─────────────────────────────────────────────────────────────
export const SCENE_VERTEX = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform float uParallax;
uniform float uDepth;
uniform vec2 uCameraOffset;

out vec2 vUv;
out float vDepth;
out vec3 vWorld;

void main() {
  vUv = aUv;
  vDepth = uDepth;

  // Parallax: الطبقات القريبة تنزاح أكثر مع حركة الكاميرا
  vec2 p = aPosition + uCameraOffset * uParallax * (uDepth - 0.5) * 0.10;
  vec4 world = uModel * vec4(p, 0.0, 1.0);
  vWorld = world.xyz;

  gl_Position = uProjection * uView * world;
}
`;

export const SCENE_FRAGMENT = `#version 300 es
precision highp float;

in vec2 vUv;
in float vDepth;
in vec3 vWorld;

uniform sampler2D uTexture;
uniform float uHasTexture;
uniform vec4  uTint;
uniform float uOpacity;
uniform float uTime;
uniform float uLift;
uniform float uRound;
uniform float uShadowAmount;

// Depth of field
uniform float uDofEnabled;    // 0/1
uniform float uFocusDistance; // 0..1 (عمق الطبقة في التركيز)
uniform float uFocusRange;    // 0..1
uniform float uDofIntensity;  // 0..1
uniform float uMaxBlur;       // بكسل

// إضاءة
uniform vec3  uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3  uDirColor;
uniform float uDirIntensity;
uniform vec3  uDirDirection;
uniform vec3  uFillColor;
uniform float uFillIntensity;
uniform float uShadowDarkness;

out vec4 fragColor;

float coc(float depth) {
  float d = abs(depth - uFocusDistance);
  float blur = smoothstep(uFocusRange * 0.45, uFocusRange, d);
  return blur * uDofIntensity * uMaxBlur;
}

vec4 blurred(sampler2D tex, vec2 uv, float radius, vec2 texel) {
  if (radius < 0.35) return texture(tex, uv);
  // 12 عينة على حلقتين (bokeh تقريبي)
  vec4 sum = texture(tex, uv);
  float w = 1.0;
  const int N = 6;
  for (int i = 0; i < N; i++) {
    float a = float(i) * 1.0471975512;
    vec2 dir = vec2(cos(a), sin(a));
    sum += texture(tex, uv + dir * texel * radius) * 0.85;
    sum += texture(tex, uv + dir * texel * radius * 1.9) * 0.55;
    w += 1.4;
  }
  return sum / w;
}

void main() {
  vec2 uv = vUv;
  vec2 texel = vec2(1.0) / vec2(textureSize(uTexture, 0));

  vec4 base;
  if (uHasTexture > 0.5) {
    float r = uDofEnabled > 0.5 ? coc(vDepth) : 0.0;
    base = blurred(uTexture, uv, r, texel);
  } else {
    base = uTint;
  }

  // حواف دائرية ناعمة (بطاقات/شعارات)
  vec2 q = abs(uv - 0.5) * 2.0;
  vec2 d = max(q - (1.0 - uRound), 0.0) / max(uRound, 0.0001);
  float corner = 1.0 - smoothstep(0.0, 1.0, length(d));
  if (uRound > 0.0) base.a *= corner;

  // إضاءة ناعمة
  vec3 n = normalize(vec3(0.0, 0.0, 1.0));
  vec3 dir = normalize(uDirDirection);
  float ndl = max(dot(n, dir), 0.0);
  float wrapped = pow((ndl + 0.5) / 1.5, 0.9);

  vec3 ambient = uAmbientColor * uAmbientIntensity;
  vec3 key = uDirColor * uDirIntensity * wrapped;
  vec3 fill = uFillColor * uFillIntensity * (1.0 - wrapped) * 0.6;

  // ظل ذاتي ناعم على حواف البطاقة المرفوعة
  float edgeShade = 1.0;
  if (uLift > 0.5) {
    edgeShade = 1.0 - (1.0 - uv.y) * 0.10 - q.x * 0.03;
    edgeShade -= uShadowAmount * 0.08;
  }

  vec3 lit = base.rgb * (ambient + key + fill) * edgeShade;
  // مزج لطيف يحافظ على ألوان الواجهة الأصلية
  lit = mix(base.rgb, lit, 0.55);

  // ضباب مسافة بسيط (الخلفية تميل للزرقة)
  float fog = smoothstep(0.0, 0.55, 0.55 - vDepth) * 0.10;
  lit = mix(lit, vec3(0.06, 0.09, 0.16), fog);

  float alpha = base.a * uOpacity;
  fragColor = vec4(lit * alpha, alpha); // premultiplied
}
`;

// ─────────────────────────────────────────────────────────────
// 2) Shadow — ظل ناعم تحت الطبقة
// ─────────────────────────────────────────────────────────────
export const SHADOW_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 0.0, 1.0);
}
`;

export const SHADOW_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uDarkness;
uniform float uSoftness;
out vec4 fragColor;
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float d = length(p * vec2(1.0, 1.25));
  float a = (1.0 - smoothstep(0.0, 1.0, d)) * uDarkness;
  a = pow(a, 1.4 + uSoftness);
  fragColor = vec4(0.0, 0.0, 0.0, a);
}
`;

// ─────────────────────────────────────────────────────────────
// 3) Particles — غبار سينمائي
// ─────────────────────────────────────────────────────────────
export const PARTICLE_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aSeed; // x, y, z, scale
uniform mat4 uProjection;
uniform mat4 uView;
uniform float uTime;
uniform float uPixelRatio;
out float vAlpha;
void main() {
  float z = aSeed.z;
  vec3 pos = vec3(
    aSeed.x * 7.0 + sin(uTime * 0.18 + aSeed.y * 6.28) * 0.35,
    aSeed.y * 4.0 + cos(uTime * 0.14 + aSeed.x * 6.28) * 0.28,
    -0.6 - z * 3.4
  );
  vec4 clip = uProjection * uView * vec4(pos, 1.0);
  gl_Position = clip;
  float size = (0.6 + aSeed.w * 2.6) * uPixelRatio;
  gl_PointSize = size * (7.0 / max(clip.w, 0.6));
  vAlpha = (0.10 + aSeed.w * 0.22) * (1.0 - smoothstep(3.0, 9.0, clip.w));
}
`;

export const PARTICLE_FRAGMENT = `#version 300 es
precision highp float;
in float vAlpha;
out vec4 fragColor;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  fragColor = vec4(vec3(0.95, 0.93, 0.86) * a, a);
}
`;

// ─────────────────────────────────────────────────────────────
// 4) Post — اللمسة السينمائية
// ─────────────────────────────────────────────────────────────
export const POST_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const POST_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uTime;
uniform float uVignette;
uniform float uGrain;
uniform float uChromatic;
uniform float uFade;      // 0..1 — تعتيم عام عند الانتقال
uniform vec3 uFadeColor;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  vec2 center = uv - 0.5;
  float r2 = dot(center, center);

  // انحراف لوني خفيف عند الأطراف (عدسات سينمائية)
  float ca = uChromatic * r2;
  vec3 col;
  col.r = texture(uScene, uv + center * ca).r;
  col.g = texture(uScene, uv).g;
  col.b = texture(uScene, uv - center * ca).b;

  // bloom تقريبي — عينات ساطعة
  vec2 texel = 1.0 / uResolution;
  vec3 bloom = vec3(0.0);
  bloom += texture(uScene, uv + vec2(texel.x * 6.0, 0.0)).rgb;
  bloom += texture(uScene, uv - vec2(texel.x * 6.0, 0.0)).rgb;
  bloom += texture(uScene, uv + vec2(0.0, texel.y * 6.0)).rgb;
  bloom += texture(uScene, uv - vec2(0.0, texel.y * 6.0)).rgb;
  bloom *= 0.25;
  float lum = dot(bloom, vec3(0.299, 0.587, 0.114));
  col += bloom * smoothstep(0.55, 1.0, lum) * 0.35;

  // vignette
  float vig = smoothstep(0.98, 0.22, length(center) * 1.38);
  col *= mix(1.0, vig, uVignette);

  // حبيبات فيلم
  float grain = hash(uv * uResolution + floor(uTime * 24.0)) - 0.5;
  col += grain * uGrain;

  // تلاشي الانتقال
  col = mix(col, uFadeColor, clamp(uFade, 0.0, 1.0));

  fragColor = vec4(col, 1.0);
}
`;

// ─────────────────────────────────────────────────────────────
// 5) Final card backdrop
// ─────────────────────────────────────────────────────────────
export const FINAL_CARD_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FINAL_CARD_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uProgress;
uniform float uTime;
uniform vec3 uBrandColor;
uniform vec3 uBgTop;
uniform vec3 uBgBottom;
out vec4 fragColor;

void main() {
  vec3 bg = mix(uBgBottom, uBgTop, pow(vUv.y, 0.85));

  // توهج ناعم خلف الشعار
  vec2 c = (vUv - vec2(0.5, 0.62)) * vec2(1.0, 1.25);
  float glow = exp(-dot(c, c) * 7.0) * 0.30;
  bg += uBrandColor * glow;

  // أشعة ضوء رأسية خفيفة
  float rays = 0.5 + 0.5 * sin(vUv.x * 18.0 + uTime * 0.25);
  bg += uBrandColor * rays * 0.008;

  // إطار داكن (vignette)
  float vig = smoothstep(1.1, 0.25, length((vUv - 0.5) * vec2(1.05, 1.3)));
  bg *= mix(0.72, 1.0, vig);

  float alpha = smoothstep(0.0, 0.35, uProgress);
  fragColor = vec4(bg * alpha, alpha);
}
`;

// ─────────────────────────────────────────────────────────────
// أدوات
// ─────────────────────────────────────────────────────────────
export function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('تعذر إنشاء المظلل');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'مجهول';
    gl.deleteShader(shader);
    throw new Error(`خطأ تجميع المظلل: ${log}`);
  }
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    throw new Error('تعذر إنشاء برنامج WebGL');
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'مجهول';
    gl.deleteProgram(program);
    throw new Error(`خطأ ربط البرنامج: ${log}`);
  }
  return program;
}
