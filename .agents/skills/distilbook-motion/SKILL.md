---
name: distilbook-motion
description: Build or customize a story-driven research-platform motion showreel (Distilbook) — 7 scenes, 20s, kinetic typography, visual citation networks, structured summary cards, a Three.js distillation scene, Slide/Zoom/Glitch cinematic transitions, and precise beat-synced motion. Use when asked for "Distilbook", "research motion graphics", "product showreel", "brand story video", "citation network animation", or "kinetic idea cards". Arabic-first and RTL-safe. حزمة الموشن جرافيك البحثي — قصة منصة بأسلوب Showreel مع تزامن الإيقاع.
metadata:
  short-description: الموشن جرافيك البحثي — قصة Distilbook في 20 ثانية
---

# حزمة الموشن جرافيك البحثي (Research Distilbook Motion Graphics)

حزمة جاهزة في القالب: `src/distilbook/`.
الدليل الكامل: `docs/DISTILBOOK_MOTION.md`. المختبر: `/?lab=distilbook`.

| أداة | متى |
|---|---|
| `<DistilbookShowreel config />` | شورييل قصصي كامل جاهز (7 مشاهد/20ث) بمحتوى قابل للاستبدال |
| `buildDistilbookTimeline(root, opts)` | خط زمني حتمي مخصص — Seek وتكرار وonTime |
| `DistilbookShowreelHandle` | تحكم برمجي: play/pause/seek — لأزرار الفصول |
| `DISTILBOOK_SCENES` / `DEFAULT_DISTILBOOK_CONFIG` | تعديل القصة والمحتوى كبيانات |
| `DistillStage` | مشهد Three.js للتقطير (MorphBlob + بلورات + قطرات + BeatClock) |
| `REF_NODES` / `REF_EDGES` | بيانات شبكة الاستشهادات القابلة للتوسيع |

## الوصفة السريعة

### 1. شورييل بمحتواك

```tsx
import { DistilbookShowreel } from '@/distilbook';

<DistilbookShowreel
  config={{ brand: 'علامتك', tagline: 'وعدك', cta: 'جرّب الآن', bpm: 120 }}
  height="560px"
/>
```

### 2. فصول قابلة للقفز (نمط لوحة القصة)

```tsx
const ref = useRef<DistilbookShowreelHandle>(null);
{DISTILBOOK_SCENES.map((s) => (
  <button key={s.id} onClick={() => ref.current?.seek(s.start)}>{s.title}</button>
))}
```

### 3. تعديل قصة المشاهد

عدّل `src/distilbook/types.ts` → `DISTILBOOK_SCENES` (start/end/transition/accent)
— الكوريغرافيا في `timeline.ts` مرتبطة بالمعرفات والأزمنة تلقائياً.

## قواعد

1. **المشاهد ماركب ثابت** — لا GSAP داخل مكونات `scenes/`؛ كل الحركة في `timeline.ts`.
2. **data-\* هي العقد** — `data-scene` للطبقة، و`data-word/idea/page/edge/stat/beat…` لأهداف الكوريغرافيا.
3. **لا CSS transforms على عناصر SVG** — حرك `attr` (مثل نصف القطر) و`opacity` فقط؛ توافق jsdom/SSR.
4. **اللون قوس درامي** — لكل مشهد accent يقود الخلفية وشارة HUD؛ لا تكسر التسلسل (ورد→فيروزي→…→زمردي).
5. **المحتوى بيانات** — الأفكار/البطاقات/الأرقام من `config`؛ لا تكتب نصاً في المشاهد.
6. **مشهد 3D يعمل فقط عند فعاليته** — مرّر `active` وأوقف التحديث خارجه.

## قائمة مراجعة سريعة

- [ ] `npm run typecheck` يمرر والحزمة chunk كسول
- [ ] Seek عشوائي يعمل بلا قفزات (خط زمني حتمي)
- [ ] بديل بلا WebGL يظهر في jsdom بلا انهيار
- [ ] النبضات محسوبة من BPM (لا أزمنة ثابتة)
- [ ] المحتوى كله قابل للاستبدال عبر `config`
