# حزمة السبورة والتعليق — Chalkboard & Annotation

> رسم وكتابة حرة **فوق الشرائح** أثناء العرض، و**سبورة مستقلة** متعددة الصفحات تنتقل إليها أثناء الشرح —
> قلم وممحاة، ألوان الطباشير والماركر، سُمك متغيّر، تراجع ومسح، حفظ محلي تلقائي وتصدير PNG.
>
> منفذة بنموذج إضافة **chalkboard** من [`reveal.js-plugins`](https://github.com/rajgoel/reveal.js-plugins) (MIT — Asvin Goel)
> على نظام العروض الحالي (React + عقد التحكم §6) — نفس المفاتيح ونفس بنية الحفظ، بلا الحاجة لـ reveal.js.

- **الرابط**: `/?lab=chalkboard` (أو `/?lab=board`) — وفي العرض المباشر مباشرةً بلا أي إعداد
- **الكود**: `src/chalkboard/`
- **الاعتماد**: `reveal.js-plugins 4.6` (MIT) مثبّت كمرجع النموذج والترخيص
- **الاختبارات**: `src/__tests__/chalkboard.test.ts` (13) و`src/__tests__/chalkboard-ui.test.tsx` (10)

---

## 1. الاستعمال المباشر — العرض المباشر

| الإدخال | الفعل |
|---|---|
| **C** | تبديل التعليق فوق الشريحة الحالية (قماش شفاف فوق كل شاشة: العنوان/المقدمة/الخريطة/شريحة/الخاتمة) |
| **B** أو زر «سبورة» في شريط التحكم | سبورة مستقلة داكنة تغطي العرض كاملاً |
| **→ / ←** داخل السبورة | تقليب صفحات السبورة (وآخر صفحة + → = صفحة جديدة) |
| **Delete** | مسح رسم الطبقة الحالية (تعليق الشاشة أو صفحة السبورة) |
| **Esc** | إنهاء السبورة/التعليق أولاً ثم سلوكه الاعتيادي |

شريط الأدوات (يظهر مع الطبقة): **طباشير / ماركر / ممحاة** — 6 ألوان طباشير + 6 ماركر شفاف للتظليل —
سُمك **رفيع/متوسط/عريض** — **تراجع** خطّةً خطّة — **مسح** الطبقة — **تصدير PNG**.

> المفاتيح مضافة إلى عقد التحكم (§6) في `src/config/controls.ts` — تظهر في نافذة الاختصارات (؟) —
> ولا تكسر أي مفتاح أصلي (الأسهم/Enter/Space/Esc/M/F/H).

## 2. البنية

```
src/chalkboard/
├── types.ts                # الأدوات، الألوان، السُمك، بنية الحفظ v1
├── store.ts                # ChalkboardStore نقي: تعليق لكل screenKey + صفحات سبورة + localStorage آمن
├── renderer.ts             # رسم Canvas2D: تنعيم نقاط المنتصف، ممحاة destination-out، تصدير PNG
├── controller-types.ts     # عقد ChalkboardController
├── useChalkboard.ts        # الخطاف: نمط/أداة/صفحة + حفظ مؤجّل 400ms + حفظ عند المغادرة
├── ChalkboardCanvas.tsx    # قماش يلتقط المؤشر: رسم تزايدي بلا إعادة رسم React
├── ChalkboardOverlay.tsx   # الطبقة: شريط الأدوات + الشارة + تنقّل الصفحات (fixed | contained)
└── lab/ChalkboardLab.tsx   # ?lab=chalkboard — شرائح نموذجية وقائمة ميزات ومسح الحفظ
```

**نموذج الرسم** (كالإضافة الأصلية): كل خطّة = `{ tool, color, size, points[] }` —
الممحاة خطّة بـ `destination-out` فتمحو فعلياً ما تحتها، والتراجع حذف آخر خطّة (يعيد الظهور).

**التخزين** (`db-chalkboard-v1`): `{ version: 1, notes: Record<screenKey, strokes>, board: pages[][] }` —
حفظ مؤجّل 400ms بعد آخر تعديل + حفظ عند `pagehide`. التلف/الغياب → بداية نظيفة بلا أخطاء.

## 3. التوافق مع نظام العروض

- **القالب الأبيض سليم**: الطبقة صامتة تماماً (`null`) حتى يطلبها المُقدِّم — لا نصّ ولا أزرار قبلها.
- **التنقّل محفوظ**: في وضع التعليق الأسهم تقلّب الشرائح كالمعتاد (والتعليق يرتبط بـ `screenKey` فيتبع الشريحة).
  في السبورة تتحول الأسهم لصفحاتها — وEsc يعيدك للعرض.
- **شريط التحكم**: زر «سبورة مستقلة (B)» أيقونة فقط، يظهر عند تثبيت الحزمة (خاصية اختيارية `onChalkboard`).
- **كل شاشة لها طبقتها**: العنوان، خطوات المقدمة، الخريطة، كل شريحة، الخاتمة.

## 4. الاستعمال البرمجي

```tsx
import { useChalkboard, ChalkboardOverlay } from '@/chalkboard';

function Stage() {
  const board = useChalkboard();
  return (
    <div className="relative">
      {/* محتواك… */}
      <ChalkboardOverlay board={board} layerId="slide-3" layerLabel="الشريحة 3" />
    </div>
  );
}
```

`ChalkboardController`: `mode / tool / color / size / boardPage / boardPageCount / revision` +
`setTool setColor setSize setLayer` + `notesFor commitNote boardStrokesFor commitBoardStroke` +
`nextPage prevPage undo clear toggleNotes toggleBoard close exportPNG resetAll`.

`variant="contained"` للتركيب داخل حاوية (كالمختبر) بدل تغطية الشاشة.

## 5. ملاحظات

- **الرسم التزايدي**: أثناء السحب يُرسم المقطع الجديد فقط على القماش — بلا setState في كل حركة مؤشر؛
  إعادة الرسم الكاملة تحدث فقط عند التراجع/المسح/تغيير المقاس.
- **بلا Canvas**: `getContext` يرجع null (jsdom/بيئات معطوبة) → الحزمة تسكت ولا ترمي، والاختبارات خضراء.
- **اللمس**: `touch-none` على القماش يمنع تمرير الصفحة أثناء الرسم باللمس/القلم.
- **التصدير**: التعليق PNG بخلفية شفافة، والسبورة بخلفيتها الداكنة (`strokesToPNG`).
- **مسح كل شيء**: `board.resetAll()` (زر في المختبر) يمسح الرسومات والحفظ المحلي معاً.

المهارة المرافقة: `.agents/skills/chalkboard-annotation/SKILL.md`
