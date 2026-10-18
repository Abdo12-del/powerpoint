---
name: kinetic-typography
description: Word-safe kinetic typography toolkit for this Arabic (RTL) presentation template — the installed text-animation projects and how to pick between them. TextEffect (motion-primitives presets blur / fade-in-blur / scale / slide, per word or line), TextLoop, TextShimmer, MorphingText, LineShadowText, TextAnimate, WordRotate, AnimatedShinyText / AnimatedGradientText / AuroraText / SparklesText from src/components/gallery; FitText (fitty) for headlines that fill the width; KineticHeadline / VariableText / ClipReveal / HighlightSweep / FancyText; CalligraphyText for draw-on. Includes the decision table (situation → component), the Arabic guards (no letter splitting, no tracking/italic), timing budgets, combos per screen (title, chapter preface, stats, final), what was deliberately NOT installed (React Bits licence, letter-based Magic UI effects) and how to re-implement their ideas safely. Use when asked to "animate the title/text", make text more dynamic, add a typing/loop/shimmer/morph effect, or make a headline fill the screen. حركة الخطوط والنص بالكلمات.
metadata:
  short-description: عدّة حركة النص — أي مكوّن لأي موقف، بالكلمات لا الحروف
---

# حركة الخطوط والنص (Kinetic typography)

كل الأدوات هنا تعمل على **الكلمة أو الكتلة أو الخلفية المقصوصة بالنص أو محاور الخط** — لا على الحروف. الدليل: `docs/TEXT_ANIMATION_PROJECTS.md` و`docs/TYPOGRAPHY.md`. المعاينة الحية لكل مكوّن: `/?lab=fonts`.

```tsx
import { TextEffect, TextLoop, TextShimmer, MorphingText, LineShadowText, TextAnimate, WordRotate, AnimatedGradientText, SparklesText } from '@/components/gallery';
import { KineticHeadline, VariableText, ClipReveal, HighlightSweep, FancyText, FitText, NumberRoll, CalligraphyText } from '@/components/typography';
```

## 1. جدول القرار: الموقف ← المكوّن

| الموقف | المكوّن | مقتطف | قيود |
|---|---|---|---|
| عنوان يدخل كلمةً كلمة بضبابية | `TextEffect` | `<TextEffect as="h1" per="word" preset="fade-in-blur" speedReveal={1.2}>…</TextEffect>` | `per="char"` يُرقّى تلقائياً إلى كلمات مع العربية |
| فقرة من 2–3 أسطر تدخل سطراً سطراً | `TextEffect per="line"` | النص مع `\n` بين الأسطر؛ `preset="slide"` | ≤ 3 أسطر |
| كلمة في جملة تتبدّل (ناجح / مبتكر / قابل للتوسّع) | `TextLoop` | `<TextLoop interval={1.8}><span>…</span>…</TextLoop>` | عناصر متقاربة الطول؛ ≤ 4 |
| بديل بسيط لكلمة تتبدّل | `WordRotate` | `<WordRotate words={[…]} duration={2200} />` | — |
| «جارٍ…»/انتظار/عنوان ينتظر الكشف | `TextShimmer` | `<TextShimmer as="p" duration={1.6} sweep="rtl">…</TextShimmer>` | لمعة رمادية→بيضاء؛ لا تستعمله للنص الأساسي |
| كلمات مفتاحية تتحوّل إلى بعضها (تحليل←تصميم←تنفيذ) | `MorphingText` | `<MorphingText texts={['تحليل','تصميم','تنفيذ']} className="h-20 text-[3rem]" />` | نسخة واحدة في الشريحة؛ كلمة–كلمتان؛ لا تختصره بأقل من 1.5 ث |
| عنوان بظل مخطّط متحرك (ملصق) | `LineShadowText` | `<LineShadowText as="h1" shadowColor="#fbbf24" className="text-6xl font-black">…</LineShadowText>` | خط ثقيل؛ لا `italic` |
| عنوان يملأ عرض الشاشة (اسم المشروع، «٢٠٢٦») | `FitText` | `<FitText as="h1" minSize={32} maxSize={220} className="font-black">…</FitText>` | سطر واحد؛ يعيد القياس بعد تحميل الخط |
| شاشة العنوان بخط متغيّر | `KineticHeadline` | `highlight={['الكلمة']}` | خط `variable: true` |
| عنوان بخط نسخ/رقعة (لا تقسيم) | `ClipReveal` | `direction="start"` | — |
| «الخط يُكتب» بسملة/اقتباس | `CalligraphyText` | مهارة `calligraphy-draw-on` | ≤ 6 كلمات |
| رقم/نتيجة حاسمة | `NumberRoll` + `HighlightSweep` | مهارة `numbers-and-counters` | `dir="ltr"` تلقائي |
| تدرّج/توهّج/بريق على كلمة | `FancyText`, `AnimatedGradientText`, `AuroraText`, `SparklesText` | — | كلمة أو كلمتان |
| كود يُكتب حرفاً حرفاً | `Terminal` + `TypingAnimation` | `dir="ltr"` | للكود واللاتيني فقط |

## 2. حراس العربية (مدمجة في الكود — لا تتجاوزها)

- `TextEffect` و`TextAnimate`: التقسيم بالحروف يتحوّل تلقائياً إلى كلمات إذا احتوى النص `[\u0600-\u06FF]`. لا تنسخ نسخة upstream بلا الحارس.
- لا تستعمل مكونات تفكّك الحروف حتى لو بدت جميلة: `HyperText`, `FlipText`, `SpinningText`, `TextScramble`, `TextRoll`, `KineticText`/`Text3DFlip` (Magic UI)، `Shuffle`/`ScrambledText`/`TextPressure`/`VariableProximity` (React Bits). بديلها: `TextEffect per="word"` + محور وزن (`VariableText`).
- لا `tracking-*`/`letter-spacing` ولا `italic` ولا `uppercase` على العربية (`comic-text` و`video-text` مستبعدان لهذا).
- `MorphingText` و`TextShimmer` و`LineShadowText` تعمل على السلسلة كاملة — آمنة؛ لكن `MorphingText` يستعمل `filter` ثقيلاً: نسخة واحدة وحجم معقول.
- الأرقام: `NumberRoll`/`NumberTicker` داخل `dir="ltr"`؛ نمط أرقام واحد في العرض (هندي أو غربي).

## 3. ميزانية التوقيت

| العنصر | المدة | التدرّج |
|---|---|---|
| عنوان (`TextEffect`/`KineticHeadline`) | 0.6–1.0 ث | 0.05–0.08 ث/كلمة (`speedReveal` 1–1.5) |
| فقرة سطر–سطر | 0.3 ث/سطر | 0.1 ث |
| `TextLoop`/`WordRotate` | 1.8–2.5 ث/كلمة | — |
| `MorphingText` | 1.5 ث تحوّل + 0.5 ث ثبات (ثابت في المكوّن) | — |
| `CalligraphyText` | 0.5 ث/كلمة، ≤ 5 ث | — |
| `NumberRoll` | 0.75 ث (الافتراضي) | — |

استقرار الشريحة الكامل ≤ 1.5 ث (الاستثناءات: الخط يُكتب، آلة كاتبة الكود). مؤثر نصي مهيمن واحد لكل شريحة؛ `TextLoop`/`TextShimmer` مستمران فلا تجمعهما مع خلفية متحركة.

## 4. تركيبات جاهزة لكل شاشة

```tsx
// شاشة العنوان (ثقيلة بالحركة لكنها متسلسلة)
<CalligraphyText text="بسم الله الرحمن الرحيم" font="aref-ruqaa" size={72} duration={2.5} />
<TextEffect as="h1" per="word" preset="fade-in-blur" delay={2.8} className="text-6xl font-black">{meta.title}</TextEffect>
<TextEffect as="p" per="line" preset="slide" delay={3.6} className="text-2xl text-slate-300">{`${meta.subtitle}\n${meta.presenter}`}</TextEffect>

// تمهيد الفصل: عنوان واحد كبير يملأ العرض
<FitText as="h2" minSize={40} maxSize={160} className="font-black text-amber-300"><ClipReveal>{chapter.title}</ClipReveal></FitText>

// شريحة إحصاء: الرقم بطل والعنوان هادئ
<NumberRoll value={1284} suffix=" خرّيجاً" className="text-7xl font-black text-amber-300" />
<TextEffect as="p" per="word" preset="fade" delay={0.8}>عدد الخريجين في الدفعة الحالية</TextEffect>

// الخاتمة: كلمات مفتاحية تتحوّل
<MorphingText texts={['تحليل', 'تصميم', 'تنفيذ', 'اختبار']} className="h-24 text-[4rem]" />
```

## 5. ما لم يُثبَّت عمداً (ولماذا) وكيف تعيد الفكرة بأمان

| المشروع/المكوّن | السبب | البديل الآمن |
|---|---|---|
| **React Bits** (TextPressure, Shuffle, ScrambledText, BlurText…) | رخصة MIT + Commons Clause — يمنع إعادة توزيع المكونات/نسخها المنقولة | أعد الفكرة لا الكود: ضغط النص = `VariableText axis="wdth"`; BlurText = `TextEffect preset="blur"` |
| `opentype.js` | تشكيله للعربية ناقص (يُسقط كلمات، Amiri يفشل) ولا WOFF2 | `harfbuzzjs` (المستعمل) |
| `sliding-number` (motion-primitives) | يحتاج `react-use-measure`؛ `NumberRoll` يغطيه | `NumberRoll` |
| `video-text` (Magic UI) | قناع SVG لا يرى خطوط الويب → العربية بخط النظام | `FancyText variant="gradient"` أو قناع من `shapedToSvgPath` |
| `typing-animation` المستقل | اسمه يتعارض مع `TypingAnimation` داخل `Terminal`؛ حرفي | `Terminal`/`TypingAnimation` للكود؛ `TextEffect per="word"` للعربية |
| SplitType / anime.js splitter | GSAP SplitText (مجاني) موجود ويقسّم كلمات/أسطر | `splitWords()` / `SplitText type:'words,lines'` |

إضافة مكوّن نصي جديد من upstream: اتبع «استعارة مكوّن جديد» في مهارة `gallery-components` ثم **أضف حارس العربية** إن كان يقسّم، واختباراً يثبت أن `>كلمة<` تبقى سليمة (انظر `typography-projects.test.tsx`).
