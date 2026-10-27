# سياسة المكتبات والمكونات

قبل تنفيذ وظيفة أو تثبيت اعتماد:

1. راجع `docs/PROJECT_LIBRARIES.md` و`package.json`؛ يغطي الفهرس **جميع** حزم التشغيل والتطوير المثبتة.
2. ابحث عن مكوّن أو مغلّف قائم في `src/components/` أو `src/recipes/` أو `src/lib/`، واقرأ المهارة المناسبة عند وجودها.
3. فضّل المكتبة والمكوّن الموجودين؛ لا تعِد تنفيذ قدرة متاحة أو تثبّت بديلاً مكرراً.
4. إذا لم تغطِّ الحزم الحالية الحاجة، وضّح الفجوة وسبب الإضافة، ثم حدّث الفهرس وفحص المكتبات في التغيير نفسه.
5. لا تحذف حزمة لمجرد أن استعمالها غير واضح؛ تحقّق من الاستيرادات والمهارات والتجارب والمختبرات.

## خريطة الاختيار السريعة

| الحاجة | ما يُستخدم في المشروع |
|---|---|
| حركة عامة/تتابع كتل | `Stagger`, `Card`, `WordReveal` من `@/components/ui`، ثم `motion.*` عند الحاجة — `framer-motion` |
| تسلسل زمني دقيق أو معقد | `useGSAP` و`gsap.timeline()` أو `GsapReveal` — `gsap` و`@gsap/react` |
| تقسيم عنوان | `splitWords()` للكلمات فقط — GSAP SplitText |
| احتفال | `ConfettiOnMount`, `fireConfetti` — `canvas-confetti` |
| جسيمات | `ParticlesBackground preset="…"` — `@tsparticles/*` |
| Lottie | `LottiePlayer`؛ الأصول في `src/assets/lottie/` — `lottie-react` |
| كتابة تدريجية/تحديد يدوي | `Typewriter` — `react-type-animation`؛ `Annotate` — `rough-notation` |
| ميل/قائمة متحركة/CSS | `TiltCard`، `AutoAnimate`، `tw-animate-css` من المكونات الحالية |
| عنصر بصري جاهز | `@/components/gallery` (42 مكوّناً MIT: مثل `AnimatedBeam`, `NumberTicker`, `TextAnimate`, `TextEffect`, `TextLoop`, `TextShimmer`, `MorphingText`, `LineShadowText`, `OrbitingCircles`, `Terminal`, `Marquee`, `BorderBeam`, `Meteors`, `Safari`, `Iphone`, `ImageComparison`) |
| تركيبة مكتملة لنمط | `@/recipes` (مثل `StatsCountUp`, `RelationBeams`, `TitleHero`, `CodeTerminal`, `TimelineDraw`, `EcosystemOrbit`, `GsapTitleTimeline`, `BeforeAfterCompare`) |
| حركة نص عربية | `@/components/typography`: `KineticHeadline`, `VariableText`, `ClipReveal`, `HighlightSweep`, `FancyText` |
| خط يُكتب بالقلم | `CalligraphyText` من `@/components/typography`، HarfBuzz كسول |
| رقم متدحرج/احتواء عنوان | `NumberRoll` / `FitText` — `@number-flow/react` / `fitty` |
| رسوم بيانية | `ChartFrame` و`MotionBarChart`, `MotionLineChart`, `MotionDonutChart`, `MotionRadarChart`, `Sparkline`, `MotionBarList`، أو `KpiCards` و`ChartStory`؛ دليل `docs/CHARTS.md` |
| شكل بياني متقدم | `lazyChart()` لـ Recharts أو Nivo؛ `<ChartJs />` و`<EChart />` كسولان. لا تحمّل المكتبة الثقيلة في الشاشة الأساسية |
| خريطة ذهنية تفاعلية | `@xyflow/react` فقط عند طلب خريطة؛ CSS الخاص بها وتحميلها ديناميكياً عند كونها اختيارية. لا تنفّذ أو تعدّل `MapScreen` من تلقاء نفسك |

الأيقونات من `lucide-react` فقط. الخطوط المحلية في `src/fonts/registry.ts` وتُختار عبر `src/data/typography.ts`. راجع `docs/ANIMATION_LIBRARIES.md` و`docs/CHARTS.md` و`docs/TYPOGRAPHY.md` عند الحاجة؛ لا تعِد نسخ جداول الفهرس الشامل في تعليمات أخرى.
