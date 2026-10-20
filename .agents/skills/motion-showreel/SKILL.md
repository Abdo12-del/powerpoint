# مهارة: العرض الإبداعي — Motion Design Showreel

## متى تُستعمل

عندما يطلب المستخدم: مشاهد موشن جرافيك 15 ثانية، Kinetic Typography، 3D Transitions، Parallax، Glitch، Morphing، Particles، Slide/Zoom، تزامن مع الموسيقى، تنسيق بصري جريء.

## المختبر

```
http://localhost:5173/?lab=showreel
http://localhost:5173/?lab=motion
```

## الوصفة السريعة

### 1. مكون الشريحة

```tsx
import { MotionDesignShowreel } from '@/components/showreel/MotionDesignShowreel';

content: <MotionDesignShowreel brand="STUDIO" tagline="حكاية تُروى بالحركة" bpm={128} />
```

### 2. مكون مباشر

```tsx
import { MotionShowreel } from '@/showreel/MotionShowreel';

<MotionShowreel config={{ brand: '...', tagline: '...', bpm: 128, syncToMusic: true }} height="560px" />
```

### 3. Timeline مخصص

```ts
import { buildShowreelTimeline } from '@/showreel/timeline';
const { tl } = buildShowreelTimeline(rootEl, (time, sceneId) => {}, 128);
tl.play();
tl.time(6.6); // معاينة مشهد Glitch
```

### 4. تأثيرات فردية

```ts
import { triggerGlitch, ensureGlitchStyles } from '@/showreel/effects/glitch';
import { startMorphLoop } from '@/showreel/effects/morph';
import { ParticleSystem } from '@/showreel/effects/particles';
```

## خط زمني المشاهد

| مشهد | زمن | تأثيرات |
|------|-----|---------|
| KINETIC | 0–2.2s | Kinetic + Slide |
| DEPTH | 2.2–4.4s | 3D + Zoom |
| PARALLAX | 4.4–6.6s | Parallax + Slide |
| GLITCH | 6.6–8.8s | Glitch |
| MORPH | 8.8–11s | Morphing + Zoom |
| PARTICLES | 11–13.2s | Particles + Parallax |
| FINALE | 13.2–15s | Kinetic + Particles |

## القواعد

- 15 ثانية، Slide/Zoom مع `power3`، تزامن BPM (`beat = 60/BPM`)
- النص العربي بالكلمات لا بالحروف
- تنسيق بصري جريء: خطوط كبيرة + أشكال هندسية + ألوان ديناميكية
- الدليل الكامل: `docs/MOTION_SHOWREEL.md`
