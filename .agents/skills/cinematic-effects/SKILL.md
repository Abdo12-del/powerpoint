---
name: cinematic-effects
description: Build or customize Three.js cinematic effect scenes and a professional motion-design showreel — 3D shapes, morphing, particles, glitch/RGB-shift/grain/vignette post-processing, dynamic transitions, beat-synced motion, and Lenis smooth scrolling. Use when asked for "cinematic effects", "Three.js scene", "visual transitions", "beat sync", "Lenis smooth scroll", "showreel with 3D", "glitch/particles/morph". Arabic-first and RTL-safe. حزمة المؤثرات السينمائية — Three.js وLenis مع تشوهات بصرية وانتقالات ديناميكية وتزامن مع الإيقاع.
metadata:
  short-description: المؤثرات السينمائية — Three.js، تشوهات بصرية، إيقاع، Lenis
---

# حزمة المؤثرات السينمائية (Cinematic Effects & Visual Transitions)

حزمة جاهزة في القالب: `src/effects/` (المحرّك + المختبر).
الدليل الكامل: `docs/CINEMATIC_EFFECTS.md`. المختبر: `/?lab=effects`.

| أداة | متى |
|---|---|
| `<ThreeShowreel brand tagline bpm />` | مشهد شورييل كامل جاهز — أشكال 3D + Morph + Particles + مرور سينمائي + تزامن إيقاعي |
| `BeatClock` | أي حركة تريد «ضربها» على الموسيقى — طور/فهرس/اضمحلال النبضة |
| `useThreeScene` + `ThreeCanvas` | مشهد Three.js مخصص بدورة حياة React آمنة |
| `MorphBlob` / `ParticleField` / `createGlitchQuad` | عناصر جاهزة للتركيب في أي مشهد |
| `CinemaPass` | مرور لاحق واحد يجمع Glitch/RGB/Grain/Vignette/Pulse |
| `LenisProvider` / `useLenis` | تمرير انسيابي وبارالاكس مربوط بالتمرير |
| `transitionSwap` / `slideIn` / `zoomIn` / `glitchIn` | انتقالات DOM ديناميكية للبطاقات |

## الوصفة السريعة

### 1. شورييل ثلاثي الأبعاد في شريحة

```tsx
import { ThreeShowreel } from '@/effects';

<ThreeShowreel brand="اسم العلامة" tagline="العبارة" bpm={128} height="540px" />
```

### 2. مزامنة حركة مخصصة مع الإيقاع

```ts
import { BeatClock } from '@/effects';

const beat = new BeatClock(120);
beat.start();
// في حلقة الرسم:
beat.update(elapsed, ({ intensity }) => {
  gsap.to(el, { scale: 1 + 0.05 * intensity, duration: 0.12, yoyo: true, repeat: 1 });
});
```

### 3. بارالاكس تمرير انسيابي

```tsx
import { LenisProvider } from '@/effects';

<LenisProvider duration={1.2}>
  <section data-speed={0.3}>طبقة</section>
</LenisProvider>
```

## قواعد

1. **لا تُدخل `three` في حزمة العرض** — استوردها داخل مختبر `?lab=effects` أو مكوّن كسول فقط.
2. **افحص WebGL قبل الإنشاء** — `isWebGLAvailable()` وبطاقة بديلة CSS (نمط `ThreeShowreel`).
3. **نبضة واحدة مهيمنة** لكل مشهد — لا تضرب الكاميرا والجسيمات والنص بنفس الشدة دائماً.
4. **التشوهات بالتتابع لا بالتراكم**: غليتش عند القصّ فقط، grain/vignette ثابتة خفيفة.
5. **قلّل الحركة** عند `prefers-reduced-motion` — أوقف BeatClock وأظهر إطاراً ثابتاً.

## قائمة مراجعة سريعة

- [ ] `npm run typecheck` يمرر (three منفصل في chunk كسول)
- [ ] بديل بلا WebGL يظهر في jsdom/CI بلا انهيار
- [ ] تنظيف كامل: `dispose()` للهندسات والمواد، إلغاء rAF وResizeObserver
- [ ] لا `setState` في كل إطار — شارات الزمن بتحديث DOM مباشر
- [ ] الإيقاع قابِل للضبط (70–180 BPM) والتشوهات قابلة للتعطيل حيّاً
