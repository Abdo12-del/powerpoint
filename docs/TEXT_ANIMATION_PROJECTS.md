# مشاريع ومهارات حركة الخطوط والنص (Text & Font Animation Projects)

هذا الملف يكمّل [`TYPOGRAPHY.md`](TYPOGRAPHY.md) (الخطوط واقتراناتها وقواعد الطباعة) و[`ANIMATION_PROJECTS.md`](ANIMATION_PROJECTS.md) (المهارات والمعرض العام). هنا ما أُضيف خصيصاً لتحسين **حركة الخطوط والنص** في عرض عربي RTL:

1. **ثلاثة مشاريع مثبّتة من npm** مع مغلّفات في `src/components/typography/`: HarfBuzz (الخط يُكتب)، number-flow (الأرقام تتدحرج)، fitty (النص يملأ العرض).
2. **خمسة مكونات نصية مستعارة** (MIT) أُضيفت إلى المعرض `src/components/gallery/` (37 ← 42).
3. **ثلاث مهارات جديدة** في `.agents/skills/`: `kinetic-typography`، `calligraphy-draw-on`، `numbers-and-counters` (8 ← 11).
4. ما جُرّب أو فُحص **ولم يُثبَّت** — مع السبب — حتى لا يعيد أحد التجربة.

المعاينة الحية لكل ما يلي: `npm run dev` ← `/?lab=fonts` (قسما «الخط يُكتب» و«مشاريع حركة النص المثبّتة»).

---

## 1. المشاريع المثبّتة

| المشروع | الحزمة | الرخصة | الحجم (تقريبي) | المغلّف في القالب | ما يضيفه |
|---|---|---|---|---|---|
| [harfbuzz/harfbuzzjs](https://github.com/harfbuzz/harfbuzzjs) | `harfbuzzjs@1.6` | MIT | wasm ≈ 430KB — **كسول** (يُحمَّل عند أول استعمال فقط) | `src/lib/text-shaper.ts` + `CalligraphyText` | تشكيل العربية الحقيقي (أشكال الحروف المتصلة، الروابط، الحركات، الميزات) إلى مسارات SVG ← مؤثر «الخط يُكتب» بالقلم |
| [barvian/number-flow](https://github.com/barvian/number-flow) | `@number-flow/react@0.6` | MIT | ≈ 25KB | `NumberRoll` | كل خانة تتدحرج إلى قيمتها، بحسب المحلية (`ar-EG` هندية / `ar-DZ` غربية)، نسب وعملات وتدوين مختصر، بلا وميض أرقام عشوائية |
| [rikschennink/fitty](https://github.com/rikschennink/fitty) | `fitty@2.4` | MIT | ≈ 3KB | `FitText` | العنوان يملأ عرض حاويته بالضبط ويعيد القياس عند تغيّر الحجم وبعد تحميل الخط |

### 1.1 `CalligraphyText` — الخط يُكتب

```tsx
import { CalligraphyText } from '@/components/typography';

<CalligraphyText text="بسم الله الرحمن الرحيم" font="aref-ruqaa" size={96} />
<CalligraphyText text={meta.title} font="amiri" weight={700} mode="draw" strokeColor="#38bdf8" duration={4} />
<CalligraphyText text="خلاصة الفصل" font="katibeh" size={120} mode="fill" delay={0.3} onComplete={() => setReady(true)} />
```

**كيف يعمل:** النص ← تقسيم اتجاه مبسّط (`splitRuns`: عربي RTL، أرقام/لاتيني LTR) ← HarfBuzz يشكّل كل مقطع بالملف المناسب (العربي أو اللاتيني) ← مسارات `d` لكل شكل بمواضعه ← `<motion.path pathLength>` يرسم الأشكال بترتيب الكتابة من اليمين، ثم تعبئة. الأشكال هي ما ينتجه الخط فعلاً (حرف أوّلي/وسطي/نهائي، نقاط، حركات) — لا حروف Unicode منفصلة، لذلك لا يُكسر الاتصال.

**الخطوط القابلة للرسم** (`src/fonts/calligraphy.ts` — ملفات `.woff` ثابتة من fontsource، عربي + لاتيني):

| المعرّف | الأوزان | أفضل استعمال |
|---|---|---|
| `aref-ruqaa` | 400 · 700 | الأجمل في الرسم — بسملة، عنوان الجلسة، اقتباس قصير |
| `amiri` | 400 · 700 | نسخ كلاسيكي بتشكيل دقيق — آيات، أبيات، عناوين أكاديمية (`features={['dlig']}`) |
| `katibeh` · `rakkas` · `jomhuria` | 400 | عناوين تراثية ضخمة، كلمة–ثلاث كلمات |
| `scheherazade-new` | 400 · 700 | نسخ تقليدي (upem 2048 — أدقّ) |
| `harmattan` | 400 · 700 | أسلوب مغاربي (ورش) |
| `tajawal` · `almarai` · `ibm-plex-sans-arabic` | 400 · 700/800 | سانس حديث يُرسم كمخطط هندسي ثم يُملأ |

لماذا هذه العشرة فقط؟ المشكّل يحتاج ملف الخط الخام؛ fontsource يوفّر `.woff` (zlib، يُفكّ في المتصفح بـ `DecompressionStream`) للحزم الثابتة فقط، أما الخطوط المتغيّرة (Cairo، Changa…) فتأتي `.woff2` (Brotli) ولا يمكن فكّها في المتصفح بلا مكتبة إضافية. لخط آخر: ضع `TTF/OTF/WOFF` في `public/fonts/` ومرّر `font={{ arabic: '/fonts/x.ttf' }}`.

| خاصية | الافتراضي | ملاحظة |
|---|---|---|
| `mode` | `draw-fill` | `draw` قلم فقط · `fill` ظهور تدريجي بلا قلم · `glyphs` ثابت |
| `duration` | 3 ث | تُوزَّع على الأشكال بنسبة عرض كل شكل (الكلمة الطويلة تأخذ وقتاً أطول) |
| `size` | 72 | بالبكسل؛ الـ SVG يتقلّص مع الحاوية |
| `padding` | 15% | هامش حول viewBox للحركات والنوازل |
| `features` | — | ميزات OpenType تُمرَّر إلى HarfBuzz |

السلوك الآمن: نص مخفي بالخط نفسه يحجز المكان أثناء التحميل؛ عند أي فشل يظهر النص العادي مع تحذير في وحدة التحكم؛ `prefers-reduced-motion` يعرض النتيجة النهائية مباشرة.

**واجهة المشكّل** لأغراض أخرى (أقنعة، تصدير، canvas):

```ts
import { loadShaperFont, shapeText, shapedToSvgPath, splitRuns } from '@/lib/text-shaper';
import { calligraphySource } from '@/fonts/calligraphy';
const font = await loadShaperFont(calligraphySource('amiri', 700));
const shaped = await shapeText('حفل التخرّج', font, { size: 120 }); // { glyphs[{ d, x, y, scale, advance, cluster, run, order }], width, height, baseline }
const svgInner = shapedToSvgPath(shaped); // <path transform="translate(x y) scale(s -s)" d="…"/>…
```

### 1.2 `NumberRoll` — الأرقام تتدحرج

```tsx
import { NumberRoll } from '@/components/typography';
<NumberRoll value={1284} suffix=" خرّيجاً" className="text-7xl font-black text-amber-300" />
<NumberRoll value={0.874} format={{ style: 'percent', maximumFractionDigits: 1 }} />        // ٨٧٫٤٪ (ar-EG افتراضياً)
<NumberRoll value={2026} locales="ar-DZ" format={{ useGrouping: false }} />                // 2026
<NumberRoll value={3_500_000} format={{ notation: 'compact' }} />                          // ٣٫٥ مليون
```
- مُغلَّف بـ `<span dir="ltr">` تلقائياً؛ `tabular-nums`؛ يحترم تقليل الحركة.
- اختر نمط أرقام واحداً للعرض كله (الجزائر/المغرب العربي: `ar-DZ` غربية). النمط `stats` (`StatCounters`) يستعمل `ar-DZ` أصلاً.
- `trend={+1}` للوحات النتائج (تصعد دائماً)، `animated={false}` أثناء السحب.

### 1.3 `FitText` — النص يملأ العرض

```tsx
import { FitText } from '@/components/typography';
<FitText as="h1" minSize={32} maxSize={220} className="font-black text-amber-300">{meta.title}</FitText>
```
سطر واحد (`multiLine={false}` افتراضياً)؛ يغيّر `font-size` فقط فهو آمن للعربية؛ يعيد القياس بعد `document.fonts.ready` وعند تغيّر الحجم؛ يلغي الاشتراك عند الإزالة.

## 2. المكونات النصية المستعارة الجديدة (`@/components/gallery`)

| المكوّن | المصدر | ما يفعل | الاستعمال | تكييف العربية |
|---|---|---|---|---|
| `TextEffect` | motion-primitives | دخول/خروج النص بالكلمات أو الأسطر بإعدادات `blur` / `fade-in-blur` / `scale` / `fade` / `slide`، مع `trigger` للخروج | `<TextEffect as="h1" per="word" preset="fade-in-blur" speedReveal={1.2}>…</TextEffect>` | `per="char"` يُرقّى تلقائياً إلى `word` إذا احتوى النص حروفاً عربية |
| `TextLoop` | motion-primitives | تبديل عناصر (كلمة/عبارة/JSX) في مكانها | `<TextLoop interval={1.8}><span>ناجح</span><span>مبتكر</span></TextLoop>` | كتلة واحدة — آمن |
| `TextShimmer` | motion-primitives | لمعة تمرّ على النص (تدرّج مقصوص بالنص) | `<TextShimmer as="p" duration={1.6} sweep="rtl">جارٍ التحميل…</TextShimmer>` | خيار `sweep` (الافتراضي من اليمين)؛ ألوان القالب الداكن |
| `MorphingText` | Magic UI | تحوّل سلس بين كلمات كاملة (blur + عتبة ألفا) | `<MorphingText texts={['تحليل','تصميم','تنفيذ']} className="h-20 text-[3rem]" />` | السلسلة كاملة — آمن؛ نسخة واحدة في الشريحة؛ يحترم تقليل الحركة |
| `LineShadowText` | Magic UI | ظل مخطّط متحرك خلف العنوان (نمط ملصق) | `<LineShadowText as="h1" shadowColor="#fbbf24" className="text-6xl font-black">التخرّج</LineShadowText>` | نسخة النص كاملة في `::after`؛ لا `italic` |

المصدر والالتزام والتعديلات: [`src/components/gallery/UPSTREAM.md`](../src/components/gallery/UPSTREAM.md). الاختبارات: `src/__tests__/typography-projects.test.tsx`.

## 3. جدول القرار المختصر

| أريد… | استعمل | المهارة |
|---|---|---|
| عنواناً يدخل كلمةً كلمة | `TextEffect per="word"` / `TextAnimate by="word"` / `KineticHeadline` (خط متغيّر) | `kinetic-typography` |
| فقرة سطراً سطراً | `TextEffect per="line"` | `kinetic-typography` |
| كلمة تتبدّل في جملة | `TextLoop` / `WordRotate` | `kinetic-typography` |
| كلمات مفتاحية تتحوّل | `MorphingText` | `kinetic-typography` |
| لمعة انتظار / عنوان ملصق | `TextShimmer` / `LineShadowText` | `kinetic-typography` |
| عنواناً يملأ الشاشة | `FitText` | `kinetic-typography` |
| بسملة/اقتباساً يُكتب بالقلم | `CalligraphyText` | `calligraphy-draw-on` |
| رقماً/نسبة بطلة | `NumberRoll` (+ `HighlightSweep`) | `numbers-and-counters` |
| 3–6 مؤشرات | النمط `stats` | `numbers-and-counters` |
| كشفاً بخط نسخ بلا تقسيم | `ClipReveal` | `arabic-typography-motion` |
| وزناً/عرضاً يتنفّس | `VariableText` | `arabic-typography-motion` |

القواعد الثابتة: مؤثر نصي مهيمن واحد لكل شريحة؛ الكلمة وحدة لا تتجزأ؛ لا `tracking`/`italic`/`uppercase` على العربية؛ نمط أرقام واحد؛ استقرار الشريحة ≤ 1.5 ث (استثناء «الخط يُكتب» ≤ 5 ث).

## 4. ما فُحص ولم يُثبَّت (ولماذا)

| المشروع / المكوّن | النتيجة | البديل |
|---|---|---|
| **opentype.js 2.0** (MIT) | جُرّب فعلياً: تشكيل العربية ناقص — تُسقط كلمات، Amiri يرمي `lookupType 6 not supported`، لا WOFF2 | `harfbuzzjs` |
| **React Bits** (49.6k★) | رخصة MIT + Commons Clause: «لا بيع أو ترخيص فرعي أو إعادة توزيع للمكونات نفسها — وحدها أو في حزمة أو كنسخة منقولة» ← لا يُنسخ إلى قالب عام. ومعظم مكونات النص فيه حرفية (`SplitText`, `Shuffle`, `ScrambledText`, `TextPressure`) | إعادة كتابة الفكرة: ضغط النص = `VariableText axis="wdth"`؛ `BlurText` = `TextEffect preset="blur"`؛ `CountUp` = `NumberRoll` |
| Magic UI `hyper-text` / `flip-text` / `spinning-text` / `kinetic-text` / `text-3d-flip` / `dia-text-reveal` | تفكّك الحروف | `TextEffect per="word"` |
| Magic UI `video-text` | قناع SVG بـ data-URL لا يرى خطوط الويب ← العربية بخط النظام | `FancyText variant="gradient"` أو قناع من `shapedToSvgPath` |
| Magic UI `comic-text` | `skewX` (مائل اصطناعي) + `uppercase` | `LineShadowText` |
| Magic UI `typing-animation` المستقل | حرفي، واسمه يتعارض مع `TypingAnimation` داخل `Terminal` | `Terminal`/`TypingAnimation` للكود، `Typewriter` في `effects/` |
| Magic UI `text-reveal` / `scroll-based-velocity` | مرتبطة بالتمرير لا بالشرائح | — |
| motion-primitives `sliding-number` / `animated-number` | تحتاج `react-use-measure`؛ `NumberRoll` أفضل | `NumberRoll` |
| motion-primitives `text-morph` / `text-roll` / `text-scramble` / `text-shimmer-wave` | حرفية | `MorphingText` / `TextLoop` / `TextShimmer` |
| `SplitType` / anime.js v4 splitter | GSAP SplitText (مجاني الآن) موجود ويقسّم كلمات/أسطر | `splitWords()` / `SplitText type:'words,lines'` |
| `fontkit` (5.6MB) | ثقيل؛ HarfBuzz أدقّ وأصغر | — |
| `fontaine` / `capsize` | مقاييس خط احتياطي لمنع القفز (CLS) — مفيدة لمواقع، لا لعرض يحمّل خطوطه مسبقاً | `warmUpFonts` في `src/fonts/apply.ts` |
| `react-wrap-balancer` | `text-wrap: balance` في CSS يكفي للعناوين | `[text-wrap:balance]` |

## 5. التحقق

```bash
npm run check   # أنواع + 99 اختباراً + بناء
```
- `src/__tests__/text-shaper.test.ts` (بيئة node): يفكّ WOFF، يشكّل بسملة بالرقعة ويتحقق من ترتيب الكتابة من اليمين، أرقام LTR داخل جملة RTL، أخذ «—» من الملف اللاتيني بدل مربع.
- `src/__tests__/typography-projects.test.tsx` (jsdom): حارس العربية في `TextEffect`، المكونات الخمسة، `NumberRoll` (`dir="ltr"`، المحلية)، `FitText` (fitty يُفعَّل ويُلغى)، `CalligraphyText` (نص نائب ← SVG، وسلوك الفشل).
- في البناء: `dist/assets/harfbuzz-*.wasm` و`text-shaper-*.js` chunks منفصلة؛ الحزمة الأساسية ≈ 450KB.
