---
name: chalkboard-annotation
description: Add freehand drawing and annotation over presentation slides plus a standalone multi-page chalkboard during live talks — pen/eraser/marker tools, chalk colors, stroke width, undo/clear, localStorage persistence, PNG export, and §6-compatible keyboard shortcuts (C annotate, B chalkboard). Ported from reveal.js-plugins chalkboard (MIT) onto the React presentation system. Use when asked for "chalkboard", "annotation", "draw on slides", "whiteboard during talk", "live drawing". Arabic-first and RTL-safe. حزمة السبورة والتعليق — رسم وكتابة حرة فوق الشرائح وسبورة مستقلة أثناء الشرح.
metadata:
  short-description: السبورة والتعليق — رسم فوق الشرائح وسبورة مستقلة
---

# حزمة السبورة والتعليق (Chalkboard & Annotation)

حزمة جاهزة في القالب: `src/chalkboard/`.
الدليل الكامل: `docs/CHALKBOARD.md`. المختبر: `/?lab=chalkboard`. في العرض المباشر: `C` تعليق و`B` سبورة.

| أداة | متى |
|---|---|
| `useChalkboard()` | كل التحكم: النمط/الأداة/اللون/السُمك/الصفحات + تراجع/مسح/تصدير |
| `<ChalkboardOverlay board layerId />` | الطبقة كاملة (أدوات + قماش + شارة) — `variant="fixed"` للعرض أو `"contained"` لحاوية |
| `ChalkboardStore` | النموذج النقي — تعليق لكل screenKey + صفحات سبورة + toJSON |
| `renderStrokes / strokesToPNG` | رسم/تصدير مخصص خارج React |
| `KEYS.annotate / KEYS.chalkboard / KEYS.clearDrawing` | عقد مفاتيح §6 (C / B / Delete) |

## الوصفة السريعة

### 1. تركيبها في أي مشغّل شرائح

```tsx
const board = useChalkboard();
<div className="relative">
  {slideContent}
  <ChalkboardOverlay board={board} layerId={screenKey} layerLabel="الشريحة 4" />
</div>
```

### 2. زر تفعيل مخصص

```tsx
<button onClick={board.toggleBoard}>سبورة</button>
<button onClick={board.toggleNotes}>تعليق</button>
```

### 3. في السبورة: الأسهم تقلّب الصفحات

مرّر `next/prev` المُقدَّمة منك إلى `board.nextPage/prevPage` عندما `board.mode === 'board'`
(مطبَّق في `Presentation.tsx` — انسخ النمط نفسه).

## قواعد

1. **لا نصّ قبل التفعيل** — الطبقة `null` في الوضع المغلق؛ القالب الأبيض يبقى نظيفاً.
2. **layerId ثابت للشريحة** (screenKey أو slide.id) — التعليق يتبع الشريحة عند التنقّل.
3. **الرسم التزايدي فقط أثناء السحب** — لا setState لكل حركة؛ إعادة الرسم عند التراجع/المسح/القياس.
4. **الممحاة destination-out** — لا ترسم بلون الخلفية؛ تعمل فوق أي محتوى.
5. **الحفظ مؤجّل** (400ms) + عند pagehide — لا تكتب localStorage في كل خطّة.
6. **بلا Canvas لا شيء يرمي** — `getContext` null يعني صمتاً كاملاً.

## قائمة مراجعة سريعة

- [ ] `C`/`B`/`Delete` مضافة لنافذة الاختصارات ولا تكسر مفاتيح §6 الأصلية
- [ ] Esc يغلق الطبقة قبل أي سلوك آخر، والأسهم تتبع السياق (شريحة/صفحة سبورة)
- [ ] التعليق يُحفظ لكل شريحة على حدة ويصمد لإعادة التحميل
- [ ] التراجع يعيد الظهور بعد الممحاة (حذف خطّة لا تعبئة لون)
- [ ] زر السبورة في شريط التحكم أيقونة فقط
