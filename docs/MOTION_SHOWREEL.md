# العرض الإبداعي — Motion Design Showreel

> Motion Canvas (MIT) + GSAP — 15 ثانية سينمائية: Kinetic Typography و3D Transitions وParallax وGlitch وMorphing وParticles، مع انتقالات Slide/Zoom سلسة وتزامن مع الموسيقى وتنسيق بصري جريء.

## المختبر الحي

```bash
npm run dev
# http://localhost:5173/?lab=showreel
# أو
# http://localhost:5173/?lab=motion
```

## خط زمني المشاهد (15 ثانية)

| # | المشهد | الزمن | التأثيرات | الوصف |
|---|--------|-------|-----------|-------|
| 1 | **KINETIC** | 0–2.2s | Kinetic Typography + Slide | كلمات تتنفس وزناً (wght 200→900)، تتابع بالكلمات لا بالحروف |
| 2 | **DEPTH** | 2.2–4.4s | 3D Transitions + Zoom | انقلابات فراغية بمنظور حقيقي (rotationY/X + preserve-3d) |
| 3 | **PARALLAX** | 4.4–6.6s | Parallax + Slide | طبقات بسرعات متفاوتة، تفاعل مع المؤشر + حركة تلقائية |
| 4 | **GLITCH** | 6.6–8.8s | Glitch + Slide | RGB split + scanlines + displacement، نبضة مع كل Beat |
| 5 | **MORPH** | 8.8–11s | Morphing + Zoom | تحوّل الأشكال: دائرة→مربع→مثلث→سداسي→نجمة→معين مع انتقال لوني |
| 6 | **PARTICLES** | 11–13.2s | Particles + Parallax | انفجار جسيمات متزامن مع BPM (128)، Canvas2D خفيف، تفاعل مع المؤشر |
| 7 | **FINALE** | 13.2–15s | Kinetic + Particles | كارت ختامي مع اسم العلامة وعبارة متحركة، شارات التقنيات |

## التقنيات

### Motion Canvas (MIT)

المشاهد مبنية بنفس فلسفة Motion Canvas:

```
Scene → View → Txt / Rect / Circle + yield* waitFor / tween
```

الفرق: نشغّلها عبر GSAP في المتصفح مباشرةً بدون FFmpeg لسهولة المعاينة. للتصدير كفيديو:

```bash
npm run showreel:export
# ثم استعمل التسجيل من المتصفح أو Motion Canvas خارجياً لتصدير MP4
```

### GSAP

```ts
import { gsap } from 'gsap';
import { buildShowreelTimeline } from '@/showreel/timeline';

const { tl } = buildShowreelTimeline(root, (time, sceneId) => {
  console.log(time, sceneId);
}, 128); // BPM

tl.play();
tl.pause();
tl.time(5.2); // معاينة إطار
```

- **SplitText:** تقسيم آمن للعربية — `type: 'words'` فقط (لا حروف)
- **Timeline:** انتقالات Slide (x) + Zoom (scale) + Blur مع `power3.inOut`
- **Beat sync:** `beat = 60 / BPM` — كل نبضة `scale: 1.015` على `[data-beat]`

### التأثيرات

| التأثير | الملف | كيف |
|---------|-------|-----|
| **Kinetic** | `scenes/KineticScene.tsx` | GSAP words stagger + scaleY نبض الوزن |
| **3D** | `scenes/Transition3DScene.tsx` | `perspective:1000px` + `rotationY` + `preserve-3d` |
| **Parallax** | `scenes/ParallaxScene.tsx` | طبقات بسرعات `depth*50px` مع mousemove + GSAP auto |
| **Glitch** | `effects/glitch.ts` | طبقات RGB split + clip-path + scanlines |
| **Morph** | `effects/morph.ts` | استيفاء خطي بين مسارات SVG + انتقال لوني |
| **Particles** | `effects/particles.ts` | نظام جسيمات Canvas2D مع جاذبية وتوهج و `pulse()` مع BPM |

## API

```tsx
import { MotionShowreel } from '@/showreel/MotionShowreel';

<MotionShowreel
  config={{
    brand: 'STUDIO SHOWREEL',
    tagline: 'حكاية تُروى بالحركة',
    bpm: 128,
    syncToMusic: true,
    loop: true,
  }}
  height="560px"
/>
```

### كشريحة

```tsx
import { MotionDesignShowreel } from '@/components/showreel/MotionDesignShowreel';

export const slide: SlideData = {
  id: 'ch2-showreel',
  chapterId: 'ch2',
  title: 'مهارات الموشن',
  icon: Film,
  archetype: 'stats',
  content: <MotionDesignShowreel brand="الاستوديو" tagline="إبداع بلا حدود" bpm={128} />,
};
```

## التنسيق البصري الجريء

- **خطوط:** Cairo Black للعناوين (5xl–7xl) + Noto Naskh للنص + JetBrains للرمز — أحجام كبيرة وتباعد أسطر ضيق
- **أشكال هندسية:** دوائر ومربعات ومثلثات ونجوم بحدود سميكة وألوان ديناميكية متغيرة مع كل مشهد
- **ألوان ديناميكية:** لوحة متغيرة (ذهبي → سماوي → بنفسجي → وردي → زمردي → فوشيا) مع توهج وضباب

## الملفات

```
src/showreel/
├── types.ts              # عقود المشاهد والضبط
├── timeline.ts           # مخطط GSAP الزمني + مزامنة BPM
├── MotionShowreel.tsx    # المكون الرئيسي (15s)
├── effects/
│   ├── glitch.ts         # RGB split + scanlines
│   ├── morph.ts          # استيفاء مسارات SVG + حلقة morph
│   └── particles.ts      # نظام جسيمات Canvas2D + نبض
├── scenes/
│   ├── KineticScene.tsx
│   ├── Transition3DScene.tsx
│   ├── ParallaxScene.tsx
│   ├── GlitchScene.tsx
│   ├── MorphScene.tsx
│   ├── ParticleScene.tsx
│   └── FinaleScene.tsx
└── lab/
    └── ShowreelLab.tsx   # ?lab=showreel — المختبر الكامل
```
