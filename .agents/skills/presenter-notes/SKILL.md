---
name: presenter-notes
description: Add a teacher/presenter window (Reveal Notes model from reveal.js MIT) showing speaker notes, live previews of the current and next slide, an elapsed timer and wall clock — while the audience view stays completely clean. Notes live on meta/preface/slide/final nodes and are never rendered to students. Use when asked for "presenter notes", "speaker notes", "teacher window", "presentation timer", "countdown for talk", "rehearsal timer", or "reveal.js notes". Arabic-first and RTL-safe. حزمة ملاحظات المعلم ومؤقت العرض — نافذة منفصلة بملاحظات ومعاينتين ومؤقت.
metadata:
  short-description: نافذة المعلم — ملاحظات ومعاينة ومؤقت
---

# حزمة ملاحظات المعلم ومؤقت العرض (Presenter Notes & Timer)

حزمة جاهزة في القالب: `src/presenter/`. نموذج إضافة **Reveal Notes** المدمجة مع reveal.js (MIT).
الدليل الكامل: `docs/PRESENTER.md`. المختبر: `/?lab=presenter`. في العرض المباشر: `N` يفتح النافذة (أو لوحة مدمجة عند حجب النوافذ).

| أداة | متى |
|---|---|
| `notesFor(screen, data, slides)` | ملاحظات أي شاشة: title←meta، preface←steps[i]، slide←slides[i]، final←final |
| `<PresenterWindow />` | نافذة/لوحة المعلم: معاينتان حقيقيتان مصغّرتان + ملاحظات + مؤقت + عدّاد + تقدم |
| `PresenterTimer / formatElapsed / wallClock` | مؤقت نقي (start/pause/reset بجمع الفترات) + تنسيق MM:SS/H:MM:SS + ساعة حائط |
| `screenInfo / slidesOf / slideById` | عدّاد «الشريحة i+1 / n» والعنوان والفصل، تسطيح وبحث الشرائح |

## الوصفة السريعة

### 1. اكتب الملاحظات في البيانات

```ts
// types/presentation.ts: notes?: string على meta وpreface[i] وslides[i] وfinal
{ id: 'ch1-a', title: 'المحور أ', archetype: 'bullets', notes: 'أشر إلى الرسم قبل قراءة الأرقام' }
```

### 2. افتح نافذة المعلم (نموذج Reveal Notes)

```tsx
const win = window.open('', PRESENTER_WINDOW_NAME, PRESENTER_WINDOW_FEATURES);
if (!win) return setPresenterMode('embedded'); // حجب النوافذ → لوحة مدمجة
// مستند مستقل: rtl + استنساخ الأنماط + createRoot(win.document.body...)
```

### 3. الملاحظات للمعلم فقط

```tsx
// الواجهة الرئيسية لا تستدعي notesFor إطلاقاً — القارئ الوحيد هو نافذة المعلم
<PresenterWindow notes={notesFor(screen, data, slides)} ... />
```

## قواعد

1. **الخصوصية أولاً**: لا تمرّر نص الملاحظات إلى شجرة واجهة الطلاب — لا حتى كنص مخفي.
2. **`window.open` قد تعيد `null`** — بديل مدمج إلزامي (variant="embedded") حتى لا يتعطل الدرس.
3. **حلقة مزامنة بعد كل رسم** — المعاينتان والملاحظات والعدّاد تتبع الشاشة الحالية دائماً.
4. **تنظيف كامل**: pagehide + فحص win.closed + unmount — بلا جذور React يتيمة.
5. **Esc بالطبقات** يبدأ بنافذة المعلم: نافذة ← سبورة ← ليزر ← تسليط ← تكبير.
6. **المؤقت في refs** (لا state لكل tick) — تحديث كل 500ms بلا إعادة رسم العرض.

## قائمة مراجعة سريعة

- [ ] `N` يفتح/يركّز/يغلق و`Esc` يغلق — وزر 🎓 في شريط التحكم
- [ ] المعاينتان حقيقيتان (نفس شاشات العرض مصغّرة scale بمنشأ top right)
- [ ] المؤقت يبدأ تلقائياً ويجمع الفترات بعد pause/resume ويصفَّر بـ reset
- [ ] الملاحظات الفارغة تُظهر التلميحة، والمكتوبة تظهر بـ whitespace-pre-wrap
- [ ] الواجهة الافتراضية خالية تماماً من نصوص الملاحظات (اختبار سلبي)
- [ ] المفتاح `N` (و`ى`) في نافذة الاختصارات وعقد التحكم §6 محفوظة
