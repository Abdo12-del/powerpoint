# حزمة التكبير والتركيز — Zoom & Spotlight

> تكبير على أجزاء الشريحة بنموذج إضافة **RevealZoom** المدمجة مع [reveal.js](https://revealjs.com/plugins/)
> (MIT): **Alt+Click** نحو نقطة الشرح، التفاف عند أطراف الشاشة، Esc للخروج، و`zoomLevel` قابل للضبط —
> مع **مؤشر ليزر** متوهّج و**تسليط ضوء** بفتحة تتبع موضع الشرح أثناء العرض المباشر.

- **الرابط**: `/?lab=spotlight` (أو `/?lab=zoom`) — وفي العرض المباشر بلا أي إعداد
- **الكود**: `src/spotlight/`
- **الاعتماد المرجعي**: `reveal.js 6` (MIT) — مثبّت كمرجع النموذج؛ المنفذ محلي على نظام العروض
- **الاختبارات**: `src/__tests__/spotlight.test.ts` (13) و`src/__tests__/spotlight-ui.test.tsx` (11)

---

## 1. الاستعمال المباشر — العرض المباشر

| الإدخال | الفعل |
|---|---|
| **Alt+Click** (Ctrl على لينكس) | تكبير نحو نقطة الشرح حتى `zoomLevel` — ونقر ثانٍ يخرج (سلوك RevealZoom) |
| **Z** | تكبير/خروج مركزي |
| مؤشر قرب الحافة (أثناء التكبير) | التفاف (Pan) لاستكشاف أعمق — هامش 12% وسرعة 14/scale كما في الإضافة الأصلية |
| **عجلة الفأرة** (أثناء التكبير) | تعديل مستوى التكبير 1.5–6 |
| **S** | تسليط ضوء: عتمة بفتحة دائرية تتبع المؤشر — الجمهور يرى ما تشير إليه فقط |
| **L** | مؤشر ليزر: رأس متوهّج وذيل أحمر يتلاشى |
| **عجلة الفأرة** (أثناء التسليط) | ضبط نصف القطر 60–420px |
| **Esc** | الخروج بالطبقات: الليزر ← التسليط ← التكبير ← السلوك الاعتيادي |

الطبقات `pointer-events:none` فلا تعترض النقر أو السحب أو التنقّل — والأسهم تقلّب الشرائح
أثناء التسليط/الليزر (تقديم حي حقيقي). وتعمل معاً فوق السبورة والتعليق دون تعارض.

## 2. كيف يعمل التكبير (الرياضيات)

نموذج RevealZoom بالضبط (بتمرير صفري): الإزاحة أولاً ثم التكبير بمنشأ `0 0` —
النقطة المنقورة `(ox, oy)` تهبط أعلى-يسار العرض:

```
transform: scale(s) translate(-ox px, -oy px);   transform-origin: 0 0
```

- `zoomTo(clientX, clientY, rect, scale)` تقيّد النقطة داخل المسرح.
- `panTowards(state, mouse, rect, dt)` يزيح الأصل عند اقتراب المؤشر من الحواف —
  بنفس ثابتي الإضافة: `PAN_MARGIN = 12%` و`PAN_SPEED = 14/scale` لكل إطار @60fps —
  مع التصاق بالحدود، و«لا تغيير ⇒ لا إعادة رسم».
- `zoomCss` تُخرج أنماط المسرح بزمن انتقال 0.25s.

## 3. البنية

```
src/spotlight/
├── types.ts                 # الثوابت (zoomLevel، هوامش الالتفاف، نصف القطر، ألوان الليزر)
├── engine.ts                # منطق نقي: zoomTo/zoomCss/panTowards + spotlightBackground + LaserTrail
├── useSpotlight.ts          # الخطاف: حالة + حلقة التفاف rAF (تعمل فقط أثناء التكبير)
├── SpotlightOverlay.tsx     # طبقتا التسليط والليزر (تحديث DOM مباشر + شارة الحالة)
└── lab/SpotlightLab.tsx     # ?lab=spotlight — شريحة كثيفة التفاصيل وأدوات ضبط حيّة
```

## 4. الاستعمال البرمجي

```tsx
import { useSpotlight, SpotlightOverlay, zoomCss } from '@/spotlight';

function Stage() {
  const spot = useSpotlight();
  return (
    <div
      onPointerDown={(e) => e.altKey && spot.zoomAt(e.clientX, e.clientY, stageRef.current!.getBoundingClientRect())}
    >
      <div ref={stageRef} style={zoomCss(spot.zoom, 0.25)} className="h-full w-full">
        {slide}
      </div>
      <SpotlightOverlay spot={spot} />
    </div>
  );
}
```

`SpotlightController`: `zoom / zoomActive / zoomScale / zoomAt / toggleZoomCenter / zoomOut /
setZoomScale / nudgeZoom / spotlightOn / toggleSpotlight / spotlightRadius / nudgeSpotlightRadius /
laserOn / toggleLaser / closeAll`.

`variant="contained"` لتركيب الطبقات داخل حاوية (كالمختبر) بدل تغطية الشاشة.

## 5. التوافق والأداء

- **عقد التحكم §6**: مفاتيح `Z`/`S`/`L` (وحروفها العربية `ئ`/`س`/`م`) مضافة إلى
  `src/config/controls.ts` ونافذة الاختصارات — دون كسر أي مفتاح أصلي.
- **حماية الواجهة**: Alt+Click على أزرار/روابط/حقول لا يُكبّر، وأثناء السبورة النقر يرسم لا يُكبّر.
- **بلا Canvas**: قماش الليزر يسكت بهدوء (jsdom) — والاختبارات خضراء بلا رسم حقيقي.
- **أداء**: موضع الضوء ومسار الليزر تحديث DOM مباشر وحلقة rAF واحدة — صفر إعادة رسم React للحركة؛
  حلقة الالتفاف تعمل فقط أثناء التكبير الفعلي.

المهارة المرافقة: `.agents/skills/zoom-spotlight/SKILL.md`
