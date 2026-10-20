---
name: zoom-spotlight
description: Add zoom-in on slide parts (RevealZoom model from reveal.js — Alt+Click toward the speaking point, edge panning, Esc, adjustable zoomLevel) plus a laser pointer and a spotlight that follows the explanation position during live talks. Use when asked for "zoom on slide", "spotlight", "laser pointer", "magnify part of slide", "presenter focus", or "reveal.js zoom". Arabic-first and RTL-safe. حزمة التكبير والتركيز — تكبير على أجزاء الشريحة وليزر وتسليط ضوء لموضع الشرح.
metadata:
  short-description: التكبير والتركيز — RevealZoom وليزر وتسليط ضوء
---

# حزمة التكبير والتركيز (Zoom & Spotlight)

حزمة جاهزة في القالب: `src/spotlight/`. نموذج إضافة **RevealZoom** المدمجة مع reveal.js (MIT).
الدليل الكامل: `docs/SPOTLIGHT.md`. المختبر: `/?lab=spotlight`. في العرض المباشر: Alt+Click تكبير، Z توسيط، S تسليط، L ليزر.

| أداة | متى |
|---|---|
| `useSpotlight()` | كل التحكم: حالة التكبير + التسليط + الليزر + الضبط الحي |
| `zoomTo / zoomCss / panTowards` | منطق التكبير النقي (زرع نقطة النقر أعلى-يسار والتفاف الأطراف) |
| `<SpotlightOverlay spot />` | طبقتا التسليط والليزر — `variant="fixed" | "contained"` |
| `spotlightBackground(x, y, radius)` | توليد تدرّج الفتحة الدائرية لأي استخدام |
| `LaserTrail` | مسار ليزر متلاشٍ مستقل عن React |

## الوصفة السريعة

### 1. تكبير نحو نقطة (نموذج RevealZoom)

```tsx
const spot = useSpotlight();
<div onPointerDown={(e) => {
  if (e.altKey) spot.zoomAt(e.clientX, e.clientY, stage.getBoundingClientRect());
}}>
  <div style={zoomCss(spot.zoom, 0.25)}>{slide}</div>
</div>
```

### 2. تسليط ضوء يتبع المؤشر

```tsx
spot.toggleSpotlight(); // S — والعجلة تضبط نصف القطر
<SpotlightOverlay spot={spot} />
```

## قواعد

1. **الطبقات pointer-events:none** — لا تعترض النقر أو التنقّل أبداً.
2. **Esc بالطبقات**: ليزر ← تسليط ← تكبير ← السلوك الاعتيادي (نفس ترتيب التركيب البصري).
3. **النقر على أزرار/حقول مع Alt لا يُكبّر** — حماية واجهة (`closest('button, a, input…')`).
4. **أثناء السبورة النقر يرسم لا يُكبّر** — الرسم أولوية.
5. **حلقات rAF تعمل فقط أثناء الحاجة** — التفاف أثناء التكبير، ورسم أثناء الليزر فقط.
6. **تحديث DOM مباشر للحركة** — موضع الضوء ومسار الليزر بلا setState لكل حركة مؤشر.

## قائمة مراجعة سريعة

- [ ] Alt+Click (Ctrl على لينكس) يكبّر نحو النقرة ونقر ثانٍ/Esc/Z يخرج
- [ ] الالتفاف يلتصق بحدود المسرح ولا يترك فراغاً أكبر من اللازم
- [ ] S/L والعجلة تعمل، وشارات الحالة تظهر (مستوى التكبير/نصف القطر)
- [ ] عقد التحكم §6 محفوظة والمفاتيح الجديدة في نافذة الاختصارات
- [ ] jsdom بلا canvas: صمت تام واختبارات خضراء
