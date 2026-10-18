---
name: gallery-components
description: Use the vendored animated component gallery in src/components/gallery (Magic UI + motion-primitives, MIT) — AnimatedBeam, NumberTicker, TextAnimate, TextEffect, TextLoop, TextShimmer, MorphingText, LineShadowText, WordRotate, BlurFade, OrbitingCircles, AnimatedList, Marquee, Terminal/TypingAnimation, BorderBeam, ShineBorder, MagicCard, Meteors, Ripple, DotPattern, GridPattern, FlickeringGrid, WarpBackground, Safari, Iphone, ImageComparison, TransitionPanel, GlowEffect, ShimmerButton… Use when a slide needs a ready-made visual effect, when asked for "Magic UI"/"shadcn animated components", or when vendoring a new component from those projects. معرض مكونات الحركة الجاهزة وكيفية استعارتها.
metadata:
  short-description: معرض Magic UI / motion-primitives المستعار — أي مكوّن لأي شريحة
---

# معرض المكونات المستعارة (`src/components/gallery/`)

42 مكوّناً مُكيَّفاً ومُختبَراً (MIT) من **Magic UI** و**motion-primitives**. استيراد واحد:

```tsx
import { AnimatedBeam, NumberTicker, TextAnimate, OrbitingCircles, Terminal, TypingAnimation } from '@/components/gallery';
```

- لا تحتاج `npx shadcn init` ولا تثبيتاً — كل شيء محلي، والـ keyframes في `src/styles/gallery.css`.
- المصدر والالتزام ورخص كل ملف: `src/components/gallery/UPSTREAM.md`.
- أي مكوّن غير موجود هنا: انظر «استعارة مكوّن جديد» أدناه.

## الدليل السريع: الشريحة ← المكوّن

| الحاجة في الشريحة | المكوّن | ملاحظة |
|---|---|---|
| عنوان يدخل بضبابية/انزلاق كلمةً كلمة | `TextAnimate by="word" animation="blurInUp"` أو `TextEffect per="word" preset="fade-in-blur"` | `by="character"`/`per="char"` يتحوّلان تلقائياً إلى كلمات مع العربية |
| فقرة تدخل سطراً سطراً | `TextEffect per="line" preset="slide"` | أسطر مفصولة بـ `\n`؛ ≤ 3 أسطر |
| كلمة تتبدّل (سريع / موثوق / آمن) | `WordRotate words={[…]} duration={2200}` أو `TextLoop interval={1.8}` | كلمة أو عبارة قصيرة؛ `TextLoop` يقبل عناصر JSX |
| لمعة تمرّ على نص انتظار/عنوان | `TextShimmer duration={1.6} sweep="rtl"` | ليس للنص الأساسي |
| كلمات كاملة تتحوّل إلى بعضها | `MorphingText texts={[…]}` | نسخة واحدة في الشريحة (فلتر SVG عام) |
| عنوان بظل مخطّط متحرك | `LineShadowText shadowColor="#fbbf24"` | خط ثقيل، بلا italic |
| ظهور تدريجي لأي عنصر | `BlurFade delay={0.3} inView={false}` | ضع `inView={false}` داخل الشرائح |
| تسمية لامعة / تدرّج لوني | `AnimatedShinyText`, `AnimatedGradientText`, `AuroraText` | للشارات والعناوين القصيرة |
| بريق حول كلمة | `SparklesText` | عنوان قصير واحد |
| رقم يصعد | `NumberTicker value={1250} delay={0.4} decimalPlaces={0}` | غلّفه بـ `dir="ltr"` |
| حلقة نسبة مئوية | `AnimatedCircularProgressBar value={72} gaugePrimaryColor="#fbbf24" gaugeSecondaryColor="rgba(255,255,255,.1)" /` | قيمة واحدة بارزة |
| أشعة تربط مكونات (معمارية/علاقات) | `AnimatedBeam containerRef fromRef toRef curvature` | انظر `src/recipes/RelationBeams.tsx` |
| نظام ومكوناته تدور حوله | `OrbitingCircles radius={110} duration={20} iconSize={40}` | مع أيقونات lucide |
| قائمة تظهر عنصراً فعنصراً | `AnimatedList delay={700}` | 3–6 عناصر |
| شريط شعارات/شركاء | `Marquee pauseOnHover` | الحاوية `dir="ltr"` تلقائياً؛ العناصر داخلها RTL |
| تبديل لوحات داخل الشريحة | `TransitionPanel activeIndex` | زر داخلي يغيّر `activeIndex` |
| صورة قبل/بعد | `ImageComparison` + `ImageComparisonImage position="left|right"` + `ImageComparisonSlider` | ضع `dir="ltr"` على الحاوية |
| إطار متحرك حول بطاقة مهمة | `BorderBeam` أو `ShineBorder` داخل حاوية `relative overflow-hidden` | بطاقة واحدة في الشريحة |
| بطاقة بإضاءة تتبع المؤشر | `MagicCard` | بديل `TiltCard` |
| بطاقة نيون / توهّج | `NeonGradientCard`, `GlowEffect mode="pulse"` | شريحة «نتيجة» |
| زر لامع | `ShimmerButton` | زر «ابدأ» أو دعوة |
| خلفية شاشة العنوان | `Meteors number={12}`, `DotPattern`, `GridPattern`, `AnimatedGridPattern`, `FlickeringGrid`, `WarpBackground`, `Ripple` | خلفية واحدة فقط؛ `pointer-events-none` |
| كود/أوامر تُكتب | `Terminal` + `TypingAnimation` + `AnimatedSpan` | 2–5 أسطر؛ `dir="ltr"` |
| لقطة تطبيق في إطار جهاز | `Safari url imageSrc`, `Iphone src` | الصورة في `public/` |
| أفراد الفريق | `AvatarCircles avatarUrls numPeople` | صور مربعة صغيرة |

## أنماط الاستعمال داخل شريحة

```tsx
// بطاقة مهمة بإطار متحرك
<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
  <BorderBeam size={120} duration={8} colorFrom="#fbbf24" colorTo="#38bdf8" />
  …المحتوى…
</div>

// خلفية + محتوى
<div className="relative h-full">
  <DotPattern className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
  <div className="relative z-10">…</div>
</div>

// عدّادات
<div dir="ltr" className="font-mono text-5xl font-black tabular-nums"><NumberTicker value={98.5} decimalPlaces={1} />%</div>
```

## قيود القالب على المعرض
- **لا حروف عربية منفصلة**: لا تستعمل `by="character"` مع نص عربي (المكوّن يمنعه)؛ لم نستعر HyperText/FlipText/TextScramble عمداً.
- **مؤثر واحد مهيمن لكل شريحة** و**خلفية واحدة**.
- مكونات `startOnView`/`inView` تنتظر الظهور في viewport — داخل الشرائح اضبطها على التشغيل الفوري (`inView={false}`, `startOnView={false}`) إن تأخر الظهور.
- `Marquee`, `Terminal`, `ImageComparison`, العدّادات: إحداثيات LTR (`dir="ltr"`)، والنص داخلها يمكن أن يبقى RTL.
- أي مكوّن يعتمد canvas (`FlickeringGrid`, `WarpBackground`): واحد فقط في الشاشة.

للنص خصوصاً (قرار أدق، تركيبات لكل شاشة، وما استُبعد ولماذا): مهارة `kinetic-typography`؛ للأرقام: `numbers-and-counters`؛ للخط الذي يُكتب: `calligraphy-draw-on`.

## استعارة مكوّن جديد (Vendoring)

1. اختر المصدر (كلاهما MIT): Magic UI `apps/www/registry/magicui/<name>.tsx` أو motion-primitives `components/core/<name>.tsx`. القائمة الكاملة في `references/magic-ui-components.md` و`docs/ANIMATION_PROJECTS.md`.
2. اجلب الملف (مثال بـ GitHub API):
   ```bash
   gh api repos/magicuidesign/magicui/contents/apps/www/registry/magicui/<name>.tsx --jq .content | base64 -d > src/components/gallery/<name>.tsx
   ```
3. طبّق التكييف القياسي: احذف `"use client"`؛ `motion/react` → `framer-motion`؛ `@/lib/utils` → `@/lib/cn`؛ استيرادات الأنواع بـ `type` (verbatimModuleSyntax)؛ أزل `next-themes`/`next/image`.
4. إن كان في `registry.json` للمكوّن `css`/`cssVars` → أضف `--animate-*` و`@keyframes` إلى `src/styles/gallery.css`.
5. تأكد أنه لا يفكّك الحروف العربية؛ إن فعل، أضف حارساً كما في `text-animate.tsx` أو لا تستعره.
6. صدّره من `index.ts`، سجّله في `UPSTREAM.md`، أضف سطر عرض في `src/__tests__/gallery.test.tsx`، ثم `npm run check`.

## المراجع
- `references/magic-ui-components.md` — عائلات مكونات Magic UI (من المستودع الرسمي).
- `references/magic-ui-recipes.md` — وصفات أقسام كاملة (hero، شهادات، CTA) — طبّق منطقها على الشرائح.
- `references/magic-ui-upstream-skill.md` — المهارة الرسمية لـ Magic UI (تفترض `shadcn add`؛ هنا لا حاجة إليه).
