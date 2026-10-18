---
name: animation-qa
description: Review and verify animation quality in this presentation template before delivery — automated checks (npm run check, validator warnings), the per-slide motion budget, Arabic words-not-letters rule, RTL direction of offsets, reduced-motion support, performance (transform/opacity only, one canvas, lazy chunks), bundle size, and cleanup of timelines. Use when asked to review, audit, fix janky/slow animations, or as the final step after adding effects. مراجعة جودة الحركة قبل التسليم.
metadata:
  short-description: قائمة مراجعة الحركة — أداء، عربية، RTL، تقليل الحركة
---

# مراجعة جودة الحركة (Animation QA)

نفّذ هذه المراجعة بعد أي إضافة حركة وقبل التسليم. الترتيب مقصود: الآلي أولاً ثم اليدوي.

## 1. الفحوص الآلية
```bash
npm run check          # أنواع + اختبارات + بناء — يجب أن يمرّ
npm run dev            # افتح وحدة تحكم المتصفح: تقرير validatePresentation (لا slide.placeholder)
```
- في البناء راقب حجم `dist/assets/index-*.js`: الأساسي ≈ 450KB؛ Lottie وtsParticles وHarfBuzz (`harfbuzz-*.wasm` ≈ 430KB + `text-shaper-*.js`) يجب أن تبقى **chunks منفصلة** تُحمَّل كسولاً. إن قفز الأساسي بـ > 150KB فأحدهم استُورد استيراداً ثابتاً — استعمل المغلّفات الكسولة.
- أضف اختبار عرض (`renderToStaticMarkup`) لأي مكوّن/وصفة جديدة في `src/__tests__/` (انظر `gallery.test.tsx` و`recipes.test.tsx`).

## 2. قائمة المراجعة لكل شريحة

| # | البند | كيف تتحقق |
|---|---|---|
| 1 | **مؤثر مهيمن واحد** فوق الحركة الأساسية | عدّ المؤثرات: جسيمات/beam/typing/عدّاد… ≤ 1 |
| 2 | **لا حروف عربية منفصلة** | ابحث: `type: 'chars'`, `by="character"`, `per="char"`, `split('')`, HyperText/FlipText/Scramble؛ ولا `tracking-*`/`italic` على نص عربي (مهارات `arabic-typography-motion`, `kinetic-typography`). `CalligraphyText` مستثنى: أشكاله من HarfBuzz متصلة |
| 3 | **الاتجاه RTL صحيح** | الإزاحات الأفقية: «من بداية القراءة» = `x` موجب؛ `transformOrigin: right`؛ `dir="ltr"` على svg/marquee/terminal/أرقام (`NumberRoll` يفعلها)؛ نمط أرقام واحد (هندي أو غربي) في العرض كله |
| 4 | **التوقيت** | الدخول الكلي ≤ 1.5 ث (استثناء: آلة كاتبة الإشكالية ≤ 4 ث)؛ stagger 0.06–0.12 ث |
| 5 | **المؤثر المستمر هادئ** | سرعة الجسيمات ≤ 0.6، marquee ≥ 30 ث للدورة، orbit ≥ 15 ث |
| 6 | **الخلفية لا تعيق** | `pointer-events-none`؛ التباين فوقها ≥ 4.5:1 للنص |
| 7 | **تقليل الحركة** | المغلّفات تحترمه؛ الحركة اليدوية تستعمل `prefersReducedMotion()`/`useReducedMotion()` |
| 8 | **الأداء** | `transform`/`opacity` فقط؛ لا `width/height/top/left`؛ canvas واحد؛ لا `filter: blur` على عناصر كبيرة متحركة |
| 9 | **التنظيف** | كل `useEffect`/`useGSAP`/`setInterval` يعيد دالة تنظيف؛ لا أخطاء في وحدة التحكم عند التنقل السريع ذهاباً وإياباً |
| 10 | **المفاتيح** | أي تفاعل داخل الشريحة (أزرار TransitionPanel) لا يلتقط مفاتيح التنقل (`→ ← Esc Space Enter`) |
| 11 | **بلا تعديل جوهري على الأساس** | التغييرات في `src/data/` و`src/recipes/` فقط؛ `screens/`, `hooks/` سليمة |
| 12 | **العرض الفارغ** | إن كان المستودع قالباً: لا محتوى حقيقي، فقط وصفات ونصوص نائبة |

## 3. اختبار يدوي سريع (دقيقتان)
1. افتح العرض، تنقّل بـ `→` بسرعة عبر 10 شرائح ثم ارجع بـ `←` — لا تجمّد ولا أخطاء في وحدة التحكم.
2. اضغط `↓` للخريطة أثناء مؤثر مستمر (beam/جسيمات) ثم عُد — المؤثر يُعاد تشغيله نظيفاً.
3. فعّل «تقليل الحركة» في النظام (أو DevTools → Rendering → Emulate prefers-reduced-motion) — لا قصاصات ولا جسيمات، والمحتوى كامل.
4. DevTools → Performance أثناء شريحة ثقيلة: ≥ 55 fps؛ Layers: لا طبقات ضخمة متعددة.
5. اعرض على 1366×768 (قاعات المناقشة) — لا تجاوز ولا قص للخلفيات.

## 4. إصلاحات شائعة
| العرض | السبب المعتاد | الإصلاح |
|---|---|---|
| حركة تقفز/تتقطّع | تحريك `height`/`top` أو blur كبير | استعمل `transform`/`opacity`، `layout` من framer |
| المؤثر يبدأ قبل ظهور المحتوى | `delay` صغير | `delay ≈ 0.2 + n × stagger + 0.3` |
| الحروف العربية مفككة | تقسيم حروف أو `letter-spacing` | `WordReveal`/`splitWords`/`by="word"`/`per="word"`؛ احذف `tracking-*` |
| مربعات أو حروف ناقصة في `CalligraphyText` | الحرف غائب من ملفي الخط (عربي/لاتيني) أو WOFF2 | خط آخر أو `latin` إضافي؛ حوّل WOFF2 إلى WOFF/TTF (مهارة `calligraphy-draw-on`) |
| `MorphingText` يبطّئ الشريحة | فلتر blur+threshold على عنصر كبير أو أكثر من نسخة | نسخة واحدة، حجم ≤ 6rem، أو `TextLoop` بدلاً |
| وزن الخط لا يتحرك / يقفز | خط ثابت (غير متغيّر) | خط `variable: true` من `src/fonts/registry.ts` أو `ClipReveal`/`HighlightSweep` |
| عنصر يدخل من الجهة الخطأ | إشارة `x` | اعكس الإشارة أو استعمل `y` |
| beam لا يظهر | الحاوية ليست `relative` أو refs قبل التثبيت | `relative` على الحاوية، refs على عناصر مُصيّرة |
| keyframes المعرض لا تعمل | الصنف غير معرّف | أضفه إلى `src/styles/gallery.css` |
| الحزمة الأساسية انتفخت | استيراد ثابت لـ lottie-react/tsparticles/gsap في ملف يُحمَّل دائماً | استورد `LottiePlayer`/`ParticlesBackground` (كسولان)؛ GSAP فقط في الشرائح التي تحتاجه |
| حركة تعمل مرتين في التطوير | StrictMode + useEffect | `useGSAP` أو تنظيف صحيح — لا يظهر في الإنتاج |

## 5. تقرير المراجعة (أعده للمستخدم)
- عدد الشرائح المفحوصة، والمخالفات لكل بند، وما أُصلح.
- حجم الحزمة قبل/بعد.
- نتيجة `npm run check`.
