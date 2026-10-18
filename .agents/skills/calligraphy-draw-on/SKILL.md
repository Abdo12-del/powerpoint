---
name: calligraphy-draw-on
description: Animated Arabic calligraphy "handwriting" (draw-on) effect for this presentation template — CalligraphyText shapes text with HarfBuzz (harfbuzzjs, wasm) into real connected SVG glyph paths and draws them stroke-by-stroke from right to left, then fills. Covers which of the 10 shapeable fonts to use (Aref Ruqaa, Amiri, Katibeh, Rakkas, Jomhuria, Scheherazade New, Harmattan, Tajawal, Almarai, IBM Plex Sans Arabic), modes (draw / draw-fill / fill), durations, custom TTF/OTF/WOFF fonts, OpenType features, the text-shaper API (shapeText, shapedToSvgPath) for masks and exports, performance, and troubleshooting (boxes, missing glyphs, clipped marks). Use when asked for a basmala/title/quote "written by hand", a logo-like reveal, SVG text paths, or when text-to-path for Arabic is needed. مؤثر «الخط يُكتب» للعربية.
metadata:
  short-description: «الخط يُكتب» — تشكيل HarfBuzz إلى مسارات SVG ورسمها بالقلم
---

# الخط يُكتب (Calligraphy draw-on)

المكوّن: `CalligraphyText` من `@/components/typography`. المحرّك: `src/lib/text-shaper.ts` (HarfBuzz عبر `harfbuzzjs`). الخطوط القابلة للرسم: `src/fonts/calligraphy.ts`. المعاينة: `/?lab=fonts` ← قسم «الخط يُكتب». الدليل: `docs/TEXT_ANIMATION_PROJECTS.md`.

**لماذا هذا وليس SVG `<text>` أو تقسيم الحروف؟** العربية متصلة: الحرف يتغيّر شكله بموقعه، والحركات تُوضَع فوقه، والروابط تُرسم بين الحروف. HarfBuzz يُنتج الأشكال النهائية (glyphs) بمواضعها الحقيقية، فنرسم ما يرسمه الخطاط فعلاً — لا حروفاً مفككة.

## 1. الاستعمال في 30 ثانية

```tsx
import { CalligraphyText } from '@/components/typography';

// شاشة العنوان / تمهيد الفصل
<CalligraphyText text="بسم الله الرحمن الرحيم" font="aref-ruqaa" size={96} />
<CalligraphyText text={meta.title} font="amiri" weight={700} mode="draw" strokeColor="#38bdf8" duration={4} />
<CalligraphyText text="خلاصة الفصل" font="katibeh" size={120} mode="fill" color="#fbbf24" delay={0.3} />
```

| خاصية | الافتراضي | معنى |
|---|---|---|
| `font` | `'aref-ruqaa'` | معرّف من `CALLIGRAPHY_FONT_IDS` أو `{ arabic: url, latin?: url, variations? }` لخط خاص |
| `weight` | 400 | أقرب وزن متاح (`calligraphySource`) |
| `size` | 72 | حجم الخط بالبكسل = ارتفاع الـ em؛ الـ SVG يتقلّص مع الحاوية (`max-width:100%`) |
| `mode` | `'draw-fill'` | `draw` قلم فقط · `draw-fill` قلم ثم تعبئة · `fill` ظهور الأشكال تباعاً · `glyphs` ثابت |
| `duration` / `delay` | 3 / 0 | زمن الكتابة الكلي بالثواني (يُوزَّع على الأشكال بنسبة عرضها) |
| `color` / `strokeColor` / `strokeWidth` | `#fbbf24` / = color / من الخط | سماكة القلم ثابتة بصرياً (`non-scaling-stroke`) |
| `features` | — | ميزات OpenType: `['dlig']` للروابط الزخرفية في Amiri، `['ss01']`… |
| `padding` | 15% من الحجم | هامش حول الـ viewBox حتى لا تُقصّ الحركات والنوازل |
| `onComplete` | — | يُستدعى بعد آخر شكل (لتشغيل ما بعده) |

يحترم `prefers-reduced-motion` (يعرض النص النهائي مباشرة). أثناء التحميل يحجز المكان بنص مخفي بالخط نفسه، وعند أي فشل (wasm محجوب، خط تالف) يعرض النص العادي ويطبع تحذيراً — لا يُسقط الشريحة.

## 2. اختيار الخط

| الغرض | الخط | ملاحظة |
|---|---|---|
| بسملة، افتتاحية، اقتباس قصير | `aref-ruqaa` | الأجمل في الرسم: ضربات قصيرة واضحة |
| آية/بيت شعر/عنوان أكاديمي | `amiri` (400/700) | نسخ مع تشكيل دقيق؛ `features={['dlig']}` لروابط إضافية |
| عنوان تراثي ضخم | `katibeh` · `rakkas` · `jomhuria` | كلمة–ثلاث كلمات، حجم ≥ 96px |
| نص ديني تقليدي | `scheherazade-new` | upem 2048 — دقة أعلى، ملف أكبر |
| لمسة مغاربية | `harmattan` | أسلوب ورش |
| سانس حديث (مخطط هندسي) | `tajawal` · `almarai` · `ibm-plex-sans-arabic` | `mode="draw"` مع قلم رفيع يعطي إحساس «رسم المخطط» |

القاعدة: **كلمة إلى سطر واحد** (≤ 6 كلمات). للفقرات استعمل `ClipReveal`/`TextEffect per="word"`.

## 3. التوقيت والتركيب

- `duration ≈ 0.5 ث × عدد الكلمات` (3 كلمات ≈ 1.5–2 ث؛ بسملة 4 كلمات ≈ 3 ث). لا تتجاوز 5 ث.
- بعده بـ `delay = duration + 0.3` يدخل العنوان الفرعي (`ClipReveal`) أو يبدأ الفصل. استعمل `onComplete` إن أردت ترتيباً صارماً.
- مؤثر مهيمن واحد: الشريحة التي فيها `CalligraphyText` لا تحمل جسيمات/beam/عدّاداً في الوقت نفسه (خلفية ساكنة `DotPattern` مقبولة).
- اللون: القلم = لون التمييز (amber/sky)، التعبئة = اللون نفسه أو أفتح. على خلفية فاتحة اجعل `strokeWidth` ≥ 1.5.
- الحاوية: `flex items-center justify-center`، واترك للـ SVG `height: auto`. لا تضع `overflow-hidden` ضيقاً (الحركات تخرج فوق الـ em).

## 4. خط خاص (ليس من القائمة)

```tsx
// ضع الملف في public/fonts/ — TTF أو OTF أو WOFF (zlib). WOFF2 غير مدعوم (Brotli) — حوّله إلى WOFF/TTF أولاً.
<CalligraphyText text="عنوان" font={{ arabic: '/fonts/my-thuluth.ttf', latin: '/fonts/inter.woff' }} />
// خط متغيّر: مرّر محاوره
<CalligraphyText text="عنوان" font={{ arabic: '/fonts/cairo-variable.ttf', variations: { wght: 800 } }} />
```
`latin` اختياري: يُستعمل تلقائياً للحروف الغائبة من الملف العربي (أرقام غربية، لاتيني، «—»). ملفات fontsource العربية مقسّمة (subset) ولذلك نحمّل الملفين معاً.

## 5. واجهة المشكّل مباشرة (أقنعة، تصدير، Canvas)

```ts
import { loadShaperFont, shapeText, shapedToSvgPath } from '@/lib/text-shaper';
import { calligraphySource } from '@/fonts/calligraphy';

const font = await loadShaperFont(calligraphySource('amiri', 700));
const shaped = await shapeText('حفل التخرّج', font, { size: 120, dir: 'rtl', features: ['dlig'] });
// shaped.glyphs[i] = { d, x, y, scale, advance, cluster, run, order } — بترتيب الكتابة (الأيمن أولاً)
// التحويل لكل شكل: translate(x y) scale(scale -scale)   ← محور y مقلوب لأن وحدات الخط صاعدة
const inner = shapedToSvgPath(shaped); // <path transform=… d=…/> متسلسلة
// قناع: <svg viewBox={`0 0 ${shaped.width} ${shaped.height}`}><mask id="t">{…inner بلون أبيض…}</mask>…</svg>
```
- `splitRuns(text)` يقسّم النص إلى مقاطع اتجاه (عربي RTL، أرقام/لاتيني LTR) — HarfBuzz لا يطبّق bidi بنفسه.
- التشكيل مُخزَّن مؤقتاً لكل (نص، خط، حجم)؛ الـ wasm (≈430KB) يُحمَّل مرة واحدة كسولاً عند أول استعمال فقط — لا يدخل الحزمة الأساسية.

## 6. استكشاف الأخطاء

| العرض | السبب | الإصلاح |
|---|---|---|
| مربعات بدل بعض الحروف | الحرف غائب من الملف العربي والملف اللاتيني | أضف `latin` أو استعمل خطاً يحوي الحرف؛ الرموز الخاصة (✓ ★) ليست في الخطوط العربية |
| الحركات/النقاط مقصوصة | `padding` صغير أو حاوية `overflow-hidden` | زد `padding` أو أزل القص |
| النص بخط النظام ولا حركة | فشل التحميل (انظر التحذير في وحدة التحكم) | ملف خاطئ أو WOFF2 أو مسار غير موجود في `public/` |
| الأرقام معكوسة | مرّرت `dir="ltr"` لنص عربي | اترك `dir` الافتراضي `rtl` |
| حركة متقطعة | شكل ضخم جداً (size > 200 مع 20+ شكلاً) | قلّل الحجم أو استعمل `mode="fill"` (بلا pathLength) |
| تختلف الأوزان عن النص المجاور | الملف الثابت 400/700 فقط | طابق وزن النص المجاور أو استعمل `weight={700}` |
| في الاختبارات (jsdom) | لا wasm/fetch | `vi.doMock('@/lib/text-shaper', …)` كما في `src/__tests__/typography-projects.test.tsx`؛ اختبار المشكّل الحقيقي يجري في بيئة node بقراءة ملفات `.woff` من `node_modules` (`text-shaper.test.ts`) |
