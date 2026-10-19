# الرياضيات والعلوم داخل الشرائح العربية

عدة لإظهار الصيغ الرياضية، الاشتقاقات، الكيمياء والوحدات، والرسوم التفاعلية داخل القالب العربي RTL — **من دون إضافة archetype حادي عشر**. ضع المكوّن في `content` لنمط قائم مثل `bullets` أو `process` أو `comparison` أو `stats`.

المختبر الحي: `/?lab=math`.

## الحزم والرخصة والتوافق

| الحزمة | النسخة المثبّتة | الرخصة | الدور |
|---|---:|---|---|
| `katex` | 0.19.0 | MIT | صيغ سريعة، عرض HTML + MathML، ومكوّنات الرياضيات |
| `katex/contrib/mhchem` | جزء من KaTeX 0.19.0 | MIT ضمن الحزمة | كيمياء `\ce{...}` وكميات/وحدات `\pu{...}`؛ لا توجد حزمة `mhchem` منفصلة |
| `mafs` | 0.21.0 | MIT | رسم الدوال والتفاعل بالسحب، متوافق حسب peer range مع React/React DOM `>=18` |

يستعمل التطبيق React 19.3.1. يعلن Mafs اعتماداً على `katex@^0.16`، لذلك يربط `package.json` اعتماد Mafs بـ KaTeX 0.19 المباشر عبر override؛ اختُبر العرض الفعلي لمكوّن Mafs `LaTeX` على React 19. هذا يمنع تحميل نسخة KaTeX ثالثة إضافية في مسار الرياضيات. تبقى نسخ KaTeX التي تحتاجها مكتبات أخرى مستقلة عن هذا override.

**تنبيه peer عابر:** Mafs 0.21 يعلن React `>=18`، لكن تبعيته `use-resize-observer@9.1.0` ما زالت تعلن React/React DOM حتى 18. قد يظهر تحذير npm `ERESOLVE overriding peer dependency`؛ اختبار الرسم التفاعلي على React 19 يمر، وMafs يستعمل ResizeObserver الأصلي في المتصفحات الحديثة. لم تُرقَّ هذه التبعية قسراً لأن الإصدار 10 غيّر التصدير من default إلى named بينما Mafs 0.21 يستورد default.

## الواجهة العامة والتحميل الكسول

```tsx
import {
  ChemicalEquation,
  EquationReveal,
  FunctionPlot,
  MathBlock,
  MathInline,
  UnitValue,
} from '@/components/math';
```

`src/components/math/index.ts` خفيف: KaTeX مع mhchem يُحمّل عند ظهور أول صيغة، وMafs مع CSS الخاص به يُحمّل عند استخدام `FunctionPlot` فقط. بذلك لا يدخل أي منهما bundle العرض الأساسي أو الشرائح التي لا تستعمله.

## صيغة ضمن فقرة عربية — LTR معزول

```tsx
<p dir="rtl">
  عند سرعة ابتدائية مقدارها{' '}
  <MathInline
    tex={String.raw`v_0 = 12.5\,\mathrm{m\,s^{-1}}`}
    ariaLabel="السرعة الابتدائية تساوي 12.5 متراً في الثانية"
  />، يتغيّر موضع الجسم مع الزمن.
</p>
```

- `MathInline` يغلّف كل صيغة بعنصر `dir="ltr"` و`unicode-bidi: isolate`؛ لذلك تبقى المعادلة كتلة واحدة، وتبقى الفاصلة العربية والكلمات بعدها ضمن سياق RTL.
- ضع علامات الترقيم خارج `<MathInline>`؛ لا تدمج الجملة العربية في TeX ولا تضع `dir="ltr"` على الفقرة كلها.
- `MathBlock` للمعادلات المنفصلة، ويولّد KaTeX داخل `<div dir="ltr">` مع MathML قابل للقراءة.
- `ariaLabel` اختياري للتعبير الصوتي؛ KaTeX يضمّن MathML افتراضياً (`output: 'htmlAndMathml'`).

## كشف الاشتقاق خطوةً خطوة

```tsx
<EquationReveal
  initialDelay={0.15}
  stagger={0.55}
  steps={[
    { id: 'given', label: 'المعادلة الأصلية', tex: String.raw`2x + 3 = 11` },
    { id: 'subtract', label: 'نطرح 3 من الطرفين', tex: String.raw`2x = 11 - 3` },
    { id: 'result', label: 'نقسم على 2', tex: String.raw`x = 4`, note: 'إذن الحل هو أربعة.' },
  ]}
/>
```

`steps` قائمة من `{ id?, tex, label?, note? }`. يظهر كل سطر بتتابع ثابت ومختصر؛ `prefers-reduced-motion` يعرض النتيجة فوراً. اشرح التحويل في `label` أو `note`، ولا تترك قفزات حسابية غير مبررة.

## الكيمياء والوحدات عبر mhchem

```tsx
<ChemicalEquation
  equation="2H2 + O2 -> 2H2O"
  ariaLabel="الهيدروجين والأكسجين ينتجان الماء"
/>

<p dir="rtl">
  تسارع الجاذبية يقارب <UnitValue value="9.81" unit="m.s^{-2}" />.
</p>
```

- `ChemicalEquation` يضيف `\ce{...}` تلقائياً ويعرض صيغة كتلية.
- `UnitValue` يضيف `\pu{value unit}`؛ قيمة `unit` تتبع قواعد mhchem (مثل `kg.m/s^2` أو `m.s^{-2}`).
- هذه الأدوات **تنسيق رمزي** وليست محرك تحويل وحدات أو مدقق أبعاد؛ اذكر الوحدة والمصدر/الدقة في نص الشريحة.
- يمكن استعمال `\ce{...}` و`\pu{...}` مباشرةً داخل `MathInline` أو `MathBlock` إذا أردت صيغة مركّبة.

## رسم دالة تفاعلي

```tsx
<FunctionPlot
  fn={(x) => Math.sin(x)}
  label="f(x) = sin(x)"
  xDomain={[-6, 6]}
  yDomain={[-1.6, 1.6]}
  height={320}
  ariaLabel="منحنى الجيب مع نقطة يمكن تحريكها"
/>
```

`FunctionPlot` يرسم بمنصة Mafs، ويقيّد نقطة السحب على مسار الدالة. يوجد منزلق HTML ذي تسمية عربية وناتج إحداثيات `aria-live` بديل قابل للوحة المفاتيح؛ لا يعتمد استعمال الرسم على الماوس وحده. يضبط الغلاف ألوان Mafs إلى slate/amber/sky ويدعم العرض المتجاوب، بينما ملفا `mafs/core.css` و`mafs/font.css` محمّلان كسولاً.

## الأمان وإمكانية الوصول والاختبار

- `renderMathMarkup()` يستعمل `trust: false` و`throwOnError: false`؛ لا يسمح بوسوم HTML موثوقة في TeX، وتظهر الصيغة غير الصحيحة كخطأ KaTeX بدلاً من تعطيل العرض.
- لا تمرّر HTML مولّداً يدوياً إلى `dangerouslySetInnerHTML`؛ المكوّن وحده يحقن خرج KaTeX الآمن.
- الصيغ LTR معزولة عن سياق العربية، والاشتقاقات لها تسميات RTL، والرسم يوفّر منزلقاً مسمىً وإحداثيات حية.
- اختبار KaTeX/mhchem واتجاه RTL في `src/components/math/math.test.tsx`؛ اختبار Mafs + React 19 وKaTeX override في `src/components/math/function-plot.test.tsx`.

```bash
npx vitest run src/components/math/math.test.tsx src/components/math/function-plot.test.tsx
npm run check
```

لا تطبّق `npm audit fix` كجزء من إضافة الرياضيات. تُتابَع نتائج التدقيق الموجودة بصورة منفصلة عن هذا التغيير.
