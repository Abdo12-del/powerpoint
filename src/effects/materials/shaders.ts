/**
 * مظللات التشوهات البصرية — Cinematic Post-Processing Shaders (GLSL)
 * مرور سينمائي واحد يجمع: Glitch (إزاحة أشرطة) + RGB Shift + Scanlines
 * + حبيبات فيلم + Vignette + وميض نبضي متزامن مع الإيقاع
 */

export const CinemaShader = {
  uniforms: {
    tDiffuse: { value: null as unknown },
    uTime: { value: 0 },
    /** شدة الغليتش 0..1 */
    uGlitch: { value: 0 },
    /** انزياح قنوات RGB 0..1 */
    uRgbShift: { value: 0.35 },
    /** حبيبات الفيلم 0..1 */
    uGrain: { value: 0.4 },
    /** تعتيم الأطراف 0..1 */
    uVignette: { value: 0.55 },
    /** وميض النبضة 0..1 (يتلاشى تلقائياً) */
    uPulse: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGlitch;
    uniform float uRgbShift;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uPulse;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // ── Glitch: إزاحة أفقية لأشرطة عشوائية مع تقطيع زمني ──
      float band = floor(uv.y * 24.0);
      float seed = hash(vec2(band, floor(uTime * 18.0)));
      float gate = step(1.0 - uGlitch * 0.4, seed);
      uv.x += gate * (hash(vec2(band, seed)) - 0.5) * 0.14 * uGlitch;

      // اهتزاز عمودي خفيف عند الغليتش القوي
      uv.y += uGlitch * 0.006 * sin(uTime * 60.0 + uv.y * 40.0);

      // ── RGB Shift: تفريق قنوات اللون (يزيد مع النبضة) ──
      vec2 dir = vec2(uRgbShift * (0.0035 + 0.012 * uPulse + 0.008 * uGlitch), 0.0);
      float r = texture2D(tDiffuse, uv + dir).r;
      vec4 base = texture2D(tDiffuse, uv);
      float b = texture2D(tDiffuse, uv - dir).b;
      vec3 col = vec3(r, base.g, b);

      // ── وميض النبضة المتزامن مع الإيقاع ──
      col += uPulse * 0.09 * vec3(1.0, 0.97, 0.9);

      // ── حبيبات فيلم ──
      float n = hash(uv * vec2(1920.0, 1080.0) + fract(uTime) * 43.0);
      col += (n - 0.5) * 0.09 * uGrain;

      // ── Scanlines عند الغليتش ──
      col *= 1.0 - 0.08 * uGlitch * step(0.5, fract(uv.y * 160.0));

      // ── Vignette ──
      float d = distance(uv, vec2(0.5));
      col *= 1.0 - uVignette * smoothstep(0.32, 0.86, d);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/**
 * مادة الـ Morph — مجسم يتنفس ويتحول بإزاحة ضوضائية على الأسطح
 * Fresnel rim + تدرج لوني يتبع uMorph
 */
export const MorphMaterialShader = {
  uniforms: {
    uTime: { value: 0 },
    /** 0..1 — يحرك التحوّل ولون التوهج */
    uMorph: { value: 0 },
    uColorA: { value: [0.95, 0.62, 0.15] },
    uColorB: { value: [0.22, 0.74, 0.97] },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uMorph;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    // ضوضاء رخيصة بطبقات جيبية — كافية للتشوه العضوي
    float n3(vec3 p) {
      return sin(p.x * 2.1 + uTime * 1.2)
           * sin(p.y * 1.7 - uTime * 0.9)
           * sin(p.z * 2.3 + uTime * 0.7);
    }

    void main() {
      vec3 p = position;
      float k = 0.18 + 0.24 * uMorph;
      p += normalize(normal) * n3(position * 1.35) * k;
      vNormal = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(p, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uMorph;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(cameraPosition - vWorldPos);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
      vec3 c = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uMorph * 3.14159));
      vec3 col = c * 0.22 + c * fres * 1.5 + vec3(1.0) * pow(fres, 3.0) * 0.55;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/**
 * مادة رباعي الغليتش — لعرض تأثير Glitch على أي نسيج (للمعرض المصغّر)
 */
export const GlitchQuadShader = {
  uniforms: {
    tDiffuse: { value: null as unknown },
    uTime: { value: 0 },
    uIntensity: { value: 0.8 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      float band = floor(uv.y * 18.0);
      float seed = hash(vec2(band, floor(uTime * 14.0)));
      float gate = step(1.0 - uIntensity * 0.45, seed);
      uv.x += gate * (hash(vec2(band, seed)) - 0.5) * 0.2 * uIntensity;

      vec2 dir = vec2(0.006 * uIntensity, 0.0);
      float r = texture2D(tDiffuse, uv + dir).r;
      vec4 c = texture2D(tDiffuse, uv);
      float b = texture2D(tDiffuse, uv - dir).b;
      vec3 col = vec3(r, c.g, b);

      // شرائط لونية أفقية
      col = mix(col, vec3(0.0, 1.0, 0.8), gate * 0.15);
      col *= 1.0 - 0.1 * step(0.5, fract(uv.y * 120.0));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
