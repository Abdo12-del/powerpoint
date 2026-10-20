/**
 * شيدرات WebGL2 لمشهد Flyover
 * - Depth of Field (تفاوت الحدة حسب العمق)
 * - إضاءة ناعمة وظلال
 * - Parallax + رفع البطاقات
 */

export const vertexShaderSource = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aUV;
layout(location = 2) in float aDepth;
layout(location = 3) in float aElevation;

uniform mat4 uMVP;
uniform mat4 uModel;
uniform float uTime;
uniform float uDepthIntensity;
uniform float uParallaxStrength;

out vec2 vUV;
out float vDepth;
out float vElevation;
out vec3 vWorldPos;
out vec3 vNormal;
out float vFog;

void main() {
  vUV = aUV;
  vDepth = aDepth;
  vElevation = aElevation;

  vec3 pos = aPosition;

  // Parallax: الطبقات الأبعد تتحرك أبطأ
  float parallax = (1.0 - aDepth) * uParallaxStrength * 0.5;
  pos.x += sin(uTime * 0.3 + aDepth * 6.28) * parallax * 0.1;
  pos.y += cos(uTime * 0.2 + aDepth * 4.0) * parallax * 0.05;

  // رفع البطاقات والصور والشعارات (elevation)
  pos.z += aElevation * (0.15 + sin(uTime * 0.8 + aDepth * 8.0) * 0.02);

  vec4 world = uModel * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  vNormal = vec3(0.0, 0.0, 1.0);

  // ضباب مسافة خفيف لإضافة عمق
  float dist = length(world.xyz);
  vFog = clamp((dist - 4.0) / 6.0, 0.0, 0.5);

  gl_Position = uMVP * vec4(pos, 1.0);
}
`;

export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 vUV;
in float vDepth;
in float vDepth2;
in float vElevation;
in vec3 vWorldPos;
in vec3 vNormal;
in float vFog;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uFocusDistance;
uniform float uAperture;
uniform float uDepthIntensity;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbient;
uniform float uShadowStrength;

out vec4 fragColor;

// دالة ضبابية بسيطة لمحاكاة Depth of Field
vec4 dofSample(sampler2D tex, vec2 uv, float blur) {
  if (blur < 0.001) return texture(tex, uv);
  vec4 c = vec4(0.0);
  float w = 0.0;
  // 9-tap blur
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 off = vec2(float(x), float(y)) * blur * 0.008;
      float weight = 1.0 - length(vec2(float(x), float(y))) * 0.22;
      c += texture(tex, uv + off) * weight;
      w += weight;
    }
  }
  return c / w;
}

float softShadow(vec3 pos, float elevation) {
  // ظل ناعم تحت البطاقات المرفوعة
  if (elevation < 0.01) return 1.0;
  float d = elevation * 2.5;
  float s = exp(-d * 3.0) * uShadowStrength;
  // تشويه ناعم
  s *= 0.6 + 0.4 * sin(vWorldPos.x * 2.0 + uTime * 0.5) * 0.1;
  return 1.0 - s * 0.45;
}

void main() {
  // حساب مقدار التشويش حسب المسافة عن المستوى البؤري
  float coc = abs(vDepth * 10.0 - uFocusDistance) * uAperture;
  coc = clamp(coc, 0.0, 1.2);
  // العمق يضخم تأثير الـ DOF
  coc *= mix(0.7, 1.4, uDepthIntensity);

  vec4 tex = dofSample(uTexture, vUV, coc);

  // إضاءة Blinn-Phong ناعمة
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(-vWorldPos);

  float NdotL = max(dot(N, L), 0.0);
  float diffuse = NdotL * 0.75 + 0.25;

  // specular خفيف
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 48.0) * 0.35;

  // ظل ناعم
  float shadow = softShadow(vWorldPos, vElevation);
  shadow = mix(1.0, shadow, uShadowStrength);

  vec3 light = uAmbient + uLightColor * diffuse * shadow + vec3(spec);

  vec3 color = tex.rgb * light;

  // توهج خفيف على الحواف للبطاقات المرفوعة
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * vElevation * 0.25;
  color += vec3(1.0, 0.85, 0.45) * rim;

  // ضباب
  color = mix(color, vec3(0.02, 0.04, 0.12), vFog);

  fragColor = vec4(color, tex.a);
}
`;

// نسخة مبسطة بدون varyings إضافية (للتوافق)
export const fragmentShaderSourceSimple = `#version 300 es
precision highp float;

in vec2 vUV;
in float vDepth;
in float vElevation;
in vec3 vWorldPos;
in vec3 vNormal;
in float vFog;

uniform sampler2D uTexture;
uniform float uFocusDistance;
uniform float uAperture;
uniform float uDepthIntensity;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbient;
uniform float uShadowStrength;

out vec4 fragColor;

vec4 dofSample(sampler2D tex, vec2 uv, float blur) {
  if (blur < 0.001) return texture(tex, uv);
  vec4 c = vec4(0.0);
  float w = 0.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 off = vec2(float(x), float(y)) * blur * 0.007;
      float weight = 1.0 - length(vec2(float(x), float(y))) * 0.2;
      c += texture(tex, uv + off) * weight;
      w += weight;
    }
  }
  return c / w;
}

void main() {
  float coc = abs(vDepth * 10.0 - uFocusDistance) * uAperture;
  coc = clamp(coc, 0.0, 1.1) * mix(0.7, 1.3, uDepthIntensity);
  vec4 tex = dofSample(uTexture, vUV, coc);

  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(-vWorldPos);
  float NdotL = max(dot(N, L), 0.0);
  float diffuse = NdotL * 0.7 + 0.3;
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 32.0) * 0.3;
  float shadow = 1.0;
  if (vElevation > 0.01) {
    float d = vElevation * 2.0;
    shadow = 1.0 - exp(-d * 2.8) * uShadowStrength * 0.4;
  }
  vec3 light = uAmbient + uLightColor * diffuse * shadow + vec3(spec);
  vec3 color = tex.rgb * light;
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.8) * vElevation * 0.2;
  color += vec3(1.0, 0.84, 0.4) * rim;
  color = mix(color, vec3(0.02, 0.05, 0.14), vFog);
  fragColor = vec4(color, tex.a);
}
`;
