---
name: math-science-rtl
description: Math and science notation for this Arabic RTL presentation template — KaTeX 0.19, mhchem chemistry and units, stepwise equations, and Mafs function plots. Covers LTR isolation inside Arabic sentences, punctuation, accessible labels, reduced motion, React 19 compatibility, lazy loading, and licensing. Use when a slide contains formulas, derivations, chemical equations, units, or mathematical plots. الرياضيات والعلوم داخل شرائح عربية RTL.
metadata:
  short-description: معادلات RTL، وحدات وكيمياء، ورسوم دوال تفاعلية
---

# الرياضيات والعلوم في RTL

اقرأ [`docs/MATH_SCIENCE.md`](../../../docs/MATH_SCIENCE.md) للمرجع الكامل وAPI المختبر `/?lab=math`.

## اختر المكوّن

| ما تريد عرضه | المكوّن من `@/components/math` |
|---|---|
| صيغة داخل فقرة عربية | `MathInline` — اتجاه LTR معزول، والفاصلة العربية خارج الصيغة |
| معادلة مستقلة | `MathBlock` |
| اشتقاق/حل تدريجي | `EquationReveal`، مع شرح كل تحويل |
| معادلة كيميائية | `ChemicalEquation` — mhchem `\ce{...}` |
| مقدار ووحدة | `UnitValue` — mhchem `\pu{...}`، تنسيق فقط لا تحويل وحدات |
| رسم دالة تفاعلي | `FunctionPlot` — Mafs ونقطة سحب + منزلق لوحة مفاتيح |

ضعها داخل `content` في archetype قائم؛ لا تضف نمط شريحة جديداً لمجرد اختلاف الترميز.

## اتجاه العربية

```tsx
<p dir="rtl">
  عند سرعة ابتدائية <MathInline tex={String.raw`v_0 = 12.5\,\mathrm{m\,s^{-1}}`} />، يتغيّر الموضع.
</p>
```

- لا تضع `dir="ltr"` على الفقرة العربية: كل صيغة تتولى `dir="ltr"` و`unicode-bidi: isolate` بذاتها.
- اكتب الفاصلة والنقطة العربية **بعد** عنصر الصيغة، كي تبقى في جملة RTL ولا تدخل في نطاق KaTeX.
- لا تقسّم العربية إلى أحرف لتحريكها. `EquationReveal` يحرك كتل الخطوات لا glyphs.

## الإعداد والأمان

- KaTeX `0.19.0` MIT، وMafs `0.21.0` MIT؛ كلاهما كسول. mhchem مضمّن في KaTeX ولا تثبّت حزمة مستقلة.
- `package.json` يفرض لـ Mafs نسخة KaTeX 0.19 المباشرة؛ اختُبر `<LaTeX>` في Mafs على React 19. تبعية Mafs القديمة `use-resize-observer@9` قد تصدر تحذير peer على React 19، لكن تكامل الرسم يختبر سلوكاً فعلياً.
- يُنتج KaTeX HTML + MathML مع `trust: false`; لا تسمح بـ `trust: true` أو إدخال HTML يدوي.
- أضف `ariaLabel` عندما تكون الصيغة/الرسم بحاجة إلى عبارة منطوقة. منزلق Mafs مسمىّ ويوفّر ناتج إحداثيات `aria-live`.
- كل حركة تحترم `prefers-reduced-motion`. حافظ على عنوان عربي خبري، ووحدة/مصدر واضحين، وفكرة واحدة لكل شريحة.

الاختبارات: `npx vitest run src/components/math/math.test.tsx src/components/math/function-plot.test.tsx` ثم `npm run check`.
