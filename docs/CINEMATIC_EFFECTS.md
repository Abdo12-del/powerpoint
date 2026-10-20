# حزمة المؤثرات السينمائية — Cinematic Effects & Visual Transitions

> **Three.js (MIT)** للمشاهد ثلاثية الأبعاد + **Lenis (MIT)** للحركة الانسيابية —
> Parallax وMorphing وGlitch وParticles، تشوهات بصرية (RGB Shift / Grain / Vignette / Bloom)،
> انتقالات ديناميكية بين المقاطع، وتزامن كامل للحركة مع الإيقاع (BeatClock) —
> لإنشاء مشاهد موشن جرافيك جريئة بأسلوب Showreel احترافي.

- **الرابط**: `/?lab=effects`
- **الكود**: `src/effects/` (المحرّك + المختبر)
- **الاختبارات**: `src/__tests__/cinematic-effects.test.ts` (21) و`src/__tests__/cinematic-effects-ui.test.tsx` (5)

---

## 1. ما تراه في المختبر

| القسم | ما فيه |
|---|---|
| **المسرح الرئيسي** | شورييل Three.js كامل (16 ثانية حلقيّة): حلقة أشكال معدنية بظلال ناعمة + مجسّم مركزي يتنفس (Morph) + عاصفة جسيمات، والكاميرا تدور على خط زمني من 4 مقاطع تُقص بانتقال غليتش/وميض. شارات حيّة: المقطع، الزمن، BPM. |
| **أدوات المسرح** | منزلق الإيقاع 70–180 BPM (يُعاد ضبط الساعة فوراً) + التقاط إطار PNG. |
| **مفاتيح التشوهات** | Glitch / Bloom / Grain / RGB Shift / Vignette — كل واحدة تُفعَّل وتُعطَّل حيّاً من شريط التحكم. |
| **كتالوج التأثيرات** | 3 بطاقات مصغّرة مستقلة: Morphing (Fresnel + ضوضاء)، Particles (نبض 128 BPM)، Glitch على نسيج إجرائي — انسخ أيها إلى شرائحك. |
| **انتقالات DOM** | ثلاثة أنماط GSAP جاهزة لتبديل البطاقات: `slide` / `zoom` / `glitch`. |
| **بارالاكس Lenis** | تمرير انسيابي + 3 طبقات تستجيب لتقدّم القسم بسرعات `data-speed` مختلفة. |

---

## 2. البنية

```
src/effects/
├── ThreeShowreel.tsx      # المكوّن الجاهز: canvas + EffectComposer + شارات + أزرار + بديل CSS
├── beat.ts                # BeatClock (طور/فهرس/اضمحلال النبضة) + خط زمني المقاطع Shots + transitionIntensity
├── webgl.ts               # isWebGLAvailable — بوابة أمان لبيئات بلا GPU (jsdom/CI)
├── three/
│   ├── useThreeScene.ts   # خطاف دورة الحياة: مشهد + كاميرا + مُصيّر + rAF + تنظيف كامل
│   ├── ShowreelStage.ts   # المسرح: 6 أشكال معدنية + ظلال PCF + MorphBlob + ParticleField + كاميرا مدارية
│   ├── MorphBlob.ts       # مجسّم يتنفس: إزاحة ضوضائية + Fresnel rim + تدرّج لوني بـ uMorph
│   ├── ParticleField.ts   # Points + AdditiveBlending، انفجارات burst() وإخفات لونية لكل جسيم
│   └── GlitchQuad.ts      # لوحة غليتش على نسيج Canvas إجرائي (للكتالوج)
├── materials/
│   ├── shaders.ts         # GLSL: CinemaShader (مرور سينمائي شامل) + MorphMaterialShader + GlitchQuadShader
│   └── CinemaPass.ts      # ShaderPass بواجهة متعة: glitch/rgbShift/grain/vignette/pulse
├── lenis/
│   ├── LenisProvider.tsx  # مغلّف الصفحة: تمرير انسيابي بمنحنى أسّي
│   └── useLenis.ts        # خطاف Lenis + useLenisScroll (scroll/progress/velocity)
├── transitions/dom.ts     # انتقالات GSAP: slideIn / zoomIn / glitchIn / transitionSwap
└── lab/EffectsLab.tsx     # صفحة ?lab=effects كاملة
```

**خط المعالجة اللاحقة** (داخل `EffectComposer`):

```
RenderPass → UnrealBloomPass → CinemaPass (glitch/rgb/grain/vignette/pulse) → OutputPass
```

---

## 3. تزامن الحركة مع الإيقاع

`BeatClock` هو قلب التزامن — ساعة نقية (بلا DOM) قابلة للاختبار:

```ts
const beat = new BeatClock(128);
beat.beatDuration;            // 60/128 = 0.46875s
beat.indexAt(t);              // فهرس النبضة
beat.phaseAt(t);              // طور النبضة 0..1
beat.envAt(t, 0.14);          // اضمحلال أسّي بعد النبضة — يضرب الكاميرا والتوهج
beat.start(); beat.update(now, (e) => e.intensity /* كل رابعة = 1 وإلا 0.6 */);
```

كل نبضة تُطلق في المسرح: **انفجار جسيمات** + **نبضة كاميرا** (تقريب `radius × 0.94`) + **وميض سينمائي**
في `CinemaPass` + **رفع emissive** للأشكال — فتبدو الحركة «مضروبة» على الموسيقى.

خط زمني المقاطع (16 ثانية حلقيّة):

| المقطع | الزمن | الكاميرا | الإبراز |
|---|---|---|---|
| `shapes` | 0–4s | مدار واسع r=7.2 | حلقة الأشكال |
| `morph` | 4–8s | قريب r=4.4 | المجسّم المتحوّل |
| `storm` | 8–12s | عالٍ وسريع | عاصفة الجسيمات |
| `finale` | 12–16s | هادئ | الكل + اسم العلامة |

عند كل قصّ يتصاعد `transitionIntensity` فترتفع شدة الغليتش وانزياح RGB لحظياً ثم يتلاشيا (0.45s).

---

## 4. الاستعمال

### المكوّن الجاهز

```tsx
import { ThreeShowreel } from '@/effects';

<ThreeShowreel
  brand="ARENA STUDIO"
  tagline="ثلاثية الأبعاد — إيقاع وتشوّه"
  bpm={128}
  height="540px"
  effects={{ glitch: true, bloom: true }}
/>
```

### مباشرة مع الخطاف

```tsx
import { useThreeScene, MorphBlob, ParticleField } from '@/effects';

const canvasRef = useRef<HTMLCanvasElement>(null);
useThreeScene(canvasRef, {
  onInit: ({ scene, camera }) => { /* ابنِ مشهدك */ },
  onFrame: ({ time, delta }) => { /* حدّث */ },
});
return <canvas ref={canvasRef} className="h-full w-full" />;
```

### الحركة الانسيابية (Lenis)

```tsx
import { LenisProvider, useLenisScroll } from '@/effects';

// 1) غلّف الصفحة كاملة
<LenisProvider duration={1.2}>{children}</LenisProvider>

// 2) أو اقرأ التمرير مباشرة
useLenisScroll(({ scroll, progress, velocity }) => console.log(scroll, progress, velocity));
```

### انتقالات DOM

```tsx
import { transitionSwap } from '@/effects';

transitionSwap(container, () => renderNext(), 'glitch'); // 'slide' | 'zoom' | 'glitch'
```

---

## 5. الأداء والأمان

- **حزمة كسولة**: `three` (~600KB مضغوطة 153KB) تُحمَّل فقط عند فتح `?lab=effects` — لا تدخل حزمة العرض.
- **بلا WebGL؟** `isWebGLAvailable()` تمنع إنشاء المُصيّر أصلاً؛ المكوّن يعرض بطاقة CSS بهوية المشهد — والاختبارات (jsdom) خضراء بلا GPU.
- **تنظيف كامل**: `useThreeScene` يُتلف الهندسات والمواد والمُصيّر ويلغي rAF والمراقِبات عند الإلغاء.
- **بلا إعادة رسم React أثناء الحركة**: شارة الزمن تُحدَّث بـ DOM مباشر، و`setState` فقط عند تغيّر المقطع.
- الظلال PCF ناعمة بدقة 1024، وتعتيم ACES Filmic، وضباب أُسّي يخفي أطراف المشهد.

---

## 6. الاعتمادات (كلها MIT)

| الحزمة | الدور |
|---|---|
| `three` r186 | المشاهد ثلاثية الأبعاد + EffectComposer + UnrealBloom |
| `lenis` 1.3 | التمرير الانسيابي (smooth wheel/touch) |
| `gsap` 3.15 | انتقالات DOM والجداول الزمنية (مثبّت مسبقاً في القالب) |

المهارة المرافقة: `.agents/skills/cinematic-effects/SKILL.md`
