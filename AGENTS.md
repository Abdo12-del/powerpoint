# AGENTS.md — موجز للوكيل البرمجي

> اقرأ هذا الملف أولاً إن طُلب منك **إنتاج عرض تقديمي** من هذا المستودع (مذكرة/مناقشة تخرج، تقرير مؤسسة، دورة تدريبية، عرض منتج…).

## ما هذا المستودع؟

قالب عرض تقديمي **أبيض تماماً (لا نصّ في أي شاشة)** يعمل في المتصفح (React 19 + Vite 7 + TypeScript + Tailwind 4، عربي RTL)، يطبّق مواصفة ثابتة: **عنوان ← مقدمة (3–4 خطوات) ← خريطة فصول ← شرائح (3–5 فصول × 4–8 شرائح) ← خاتمة**. كل البنية والتنقل والتحقق والمكتبات جاهزة؛ العمل المعتاد تعبئة `src/data/`، مع تصميم بصري متنوع لكل شريحة وفق `docs/SLIDE_VISUAL_DESIGN.md`. يجوز تركيب JSX خاص داخل `content` عندما يكون القالب الجاهز مكرراً؛ أضف/عدّل مكوّناً فقط إذا كان لبنة قابلة لإعادة الاستخدام، مع توثيق واختبار.

| اقرأ | لماذا |
|---|---|
| `docs/PRESENTATION_TEMPLATE_SPEC.md` | المواصفة الكاملة والقواعد وقائمة الاكتمال |
| `docs/THESIS_PRESENTATION_ROUTER.md` + `src/thesis/` | اختيار منهج عرض المذكرة حسب التخصص/نوع البحث مع قواعد مؤسسية موثقة وحدود الثقة؛ لا تعمم دليلاً محلياً |
| `docs/ARCHETYPES.md` | الأنماط العشرة للشرائح مع مقتطف استعمال لكل واحد |
| `docs/SLIDE_VISUAL_DESIGN.md` | قواعد إلزامية لتنوّع التخطيط البصري ومنع تكرار بنية الشرائح؛ الحركة مسموحة لكنها لا تغني عن تنويع التكوين |
| `docs/PROJECT_LIBRARIES.md` | فهرس جميع حزم التشغيل والتطوير المثبتة (78 + 16)؛ ابدأ به قبل إضافة اعتماد أو تنفيذ وظيفة تغطيها مكتبة موجودة |
| `docs/ANIMATION_LIBRARIES.md` | مكتبات الحركة المثبتة: جدول «ماذا أريد ← ماذا أستعمل» |
| `docs/ANIMATION_PROJECTS.md` | المهارات، معرض المكونات المستعارة، الوصفات، وكتالوج مشاريع GitHub |
| `docs/TYPOGRAPHY.md` | 29 خطاً عربياً حسب النوع، 10 اقترانات جاهزة، قواعد الطباعة العربية، ومكونات حركة النص |
| `docs/TEXT_ANIMATION_PROJECTS.md` | مشاريع حركة الخطوط المثبّتة (HarfBuzz «الخط يُكتب»، number-flow، fitty) والمكونات النصية الخمسة الجديدة وما رُفض ولماذا |
| `docs/CINEMATIC_FLYOVER.md` | العرض السينمائي ثلاثي الأبعاد: التقاط Playwright، مسار الكاميرا، العمق وDoF، البطاقة الختامية، معاينة الإطارات |
| `docs/CHARTS.md` | الرسوم البيانية وحركاتها: الرسوم الحركية المخصّصة (أعمدة/خط/حلقة/رادار/خط مصغّر/قائمة أشرطة)، Recharts/Nivo/Chart.js/ECharts بسمة واحدة، مرايا RTL، التحميل الكسول، والمختبر `?lab=charts` |
| `.agents/skills/*/SKILL.md` | **المهارات** — اقرأ المناسبة قبل العمل على الحركة (الجدول أدناه) |
| `src/types/presentation.ts` | العقود: `PresentationMeta`, `PrefaceStep`, `ChapterData`, `SlideData`, `FinalData` |
| `src/data/` | الاستمارات التي تملؤها — بيضاء تماماً: كل الحقول `''` وكل `content: null`، والتعليقات تشرح كل حقل؛ الشاشات تُظهر عناوينها وشاراتها تلقائياً فور الكتابة (`src/lib/blank.ts`) |

### قاعدة إلزامية لاستخدام المكتبات

قبل كتابة وظيفة أو إضافة حزمة، راجع `docs/PROJECT_LIBRARIES.md` و`package.json`، ثم ابحث عن مغلّف/مكوّن في `src/components/` أو `src/recipes/` أو `src/lib/`. فضّل المكتبة المثبتة ومكونات المشروع، ولا تعِد تنفيذ قدرتها يدوياً أو تثبّت بديلاً مكرراً. إذا لم تغطِّ الحزم الحالية الحاجة، اشرح الفجوة أولاً ووثّق الإضافة. هذه القاعدة موجهة لكل وكيل AI يعمل في المستودع.

### قاعدة إلزامية لتنوّع التصميم البصري

عند إنشاء/تعبئة الشرائح، اقرأ `docs/SLIDE_VISUAL_DESIGN.md` وخطّط تكويناً بصرياً مختلفاً لكل شريحة قبل كتابة JSX. لا تجعل الشرائح كلها «عنوان + ثلاث بطاقات»، ولا تكرر نفس بنية المحتوى في شريحتين متتاليتين؛ نوّع المساحات، المحاذاة، التوازن، الصور/المخططات/الأرقام وفق الرسالة مع بقاء الهوية متماسكة. أنماط `archetype` تصف نوع المحتوى ولا تفرض أن يكون الشكل مرئياً متطابقاً. استخدم JSX وCSS Grid/Flex عند الحاجة إلى تكوين خاص. الحركة والمؤثرات مسموحة حين تخدم الرسالة، لكنها لا تُغني عن اختلاف التخطيطات بصرياً.

## المهارات (Agent Skills) — `.agents/skills/` (و`.claude/skills` رابط إليها)

| المهارة | اقرأها عندما |
|---|---|
| `presentation-motion-director` | تختار أي مؤثر لأي شريحة/شاشة، أو يُطلب «حسّن الحركة» |
| `gallery-components` | تحتاج عنصراً بصرياً جاهزاً (beam، عدّاد، طرفية، خلفية، إطار جهاز…) أو تستعير مكوّناً من Magic UI/motion-primitives |
| `framer-motion-recipes` | تضيف دخولاً/خروجاً/stagger/layout/pathLength |
| `gsap-react-timelines` | تحتاج تسلسلاً زمنياً دقيقاً أو SplitText أو Flip أو مساراً |
| `svg-diagram-animation` | شريحة مخطط/علاقات/سير إجراء/خط زمني/شجرة |
| `lottie-and-media` | رسوم Lottie، لقطات شاشة، فيديو، إطارات أجهزة |
| `arabic-typography-motion` | تختار خطاً/اقتراناً لطابع العرض، تحرّك عنواناً أو كلمة مهمة، أو تصلح حروفاً عربية منفصلة |
| `kinetic-typography` | «حرّك العنوان/النص»، كلمة تتبدّل، لمعة، تحوّل كلمات، عنوان يملأ الشاشة — جدول القرار لكل أدوات النص |
| `calligraphy-draw-on` | بسملة/عنوان/اقتباس «يُكتب بالقلم» (`CalligraphyText` — HarfBuzz → SVG) أو نص إلى مسارات |
| `numbers-and-counters` | KPI/نسبة/عدّاد متحرك (`NumberRoll`)، أو أرقام معكوسة/مهتزّة في RTL |
| `data-charts-motion` | شريحة فيها رسم بياني (أعمدة/خط/حلقة/رادار/قمع/سانكي/مقياس/خريطة حرارية)، لوحة مؤشرات، أو رسم معكوس/غير مقروء في RTL — اختيار الشكل والطبقة والكوريغرافيا |
| `cinematic-flyover` | «عرض سينمائي ثلاثي الأبعاد»، التقاط صفحة بـ Playwright، مسار كاميرا وDoF، معاينة إطارات، بطاقة ختامية باسم العلامة |
| `motion-showreel` | «شورييل موشن جرافيك 15 ثانية»، Kinetic/3D/Parallax/Glitch/Morph/Particles، Slide/Zoom، تزامن BPM |
| `cinematic-effects` | «مؤثرات سينمائية»، مشهد Three.js، تشوهات بصرية (Glitch/RGB/Grain)، انتقالات ديناميكية، Lenis، مزامنة الإيقاع |
| `distilbook-motion` | «شورييل قصصي لمنصة/منتج»، موشن بحثي، شبكة استشهادات، بطاقات ملخصات، كتابة حركية بمحتوى مخصص |
| `chalkboard-annotation` | «سبورة»، «رسم فوق الشرائح»، شرح مباشر يحتاج تعليقاً حراً أو سبورة مستقلة، أدوات قلم/ممحاة وألوان وسُمك |
| `zoom-spotlight` | «تكبير على جزء من الشريحة»، «ليزر»، «تسليط ضوء»، شرح تفصيل يحتاج تركيز الجمهور على موضع محدد |
| `presenter-notes` | «ملاحظات المعلم/المتحدث»، «مؤقت للعرض»، «نافذة المعلم»، إلقاء مباشر بملاحظات مخفية عن الجمهور ومعاينة الشريحة التالية |
| `animation-qa` | قبل التسليم، أو عند حركة بطيئة/متقطعة |
| `thesis-presentation-routing` | تحوّل مذكرة تخرج أو مشروعاً تطبيقياً إلى عرض؛ يختار المنهج حسب التخصص ونوع الدراسة ويطبّق الدليل المؤسسي ضمن نطاقه |

إن لم يحمّلها وكيلك تلقائياً فاقرأ ملف `SKILL.md` المناسب مباشرة.

## خطوات التنفيذ (الوصفة)

1. **اجمع مادة العرض ووجّه المنهج أولاً**: استخرج العنوان والجهة/الكلية/المعهد ونوع المؤسسة والمجال/الشعبة/التخصص والشهادة ونوع الدراسة والمدة المخصصة، إلى جانب المنجزين والمشرف والتاريخ ومحتوى المذكرة. اقرأ `docs/THESIS_PRESENTATION_ROUTER.md`، افحص قواعد المؤسسة في `src/thesis/`، ثم اختر خطة التخصص/نوع العمل مع ذكر درجة الثقة. لا تعمم دليلاً من جامعة أخرى؛ إذا غاب التخصص أو المدة أو كان المصدر قديماً فاسأل قبل تثبيت المنهج. لا تخترع أرقاماً أو أسماء.
2. **استخرج 3–5 أسئلة** يجيب عنها العرض ← كل سؤال فصل في `src/data/chapters/chN.tsx` (`id`: `ch1`…`ch5`، `title`، `subtitle`، `icon` من `lucide-react`، `color` من المجموعة الموجودة).
3. **قسّم كل فصل إلى 4–8 شرائح**: الأولى `ChapterPreface` (مع `outline` من 3–5 نقاط)، الأخيرة `ChapterSummary`، وبينهما محاور بنمط واحد لكل شريحة من: `profile | bullets | timeline | tree | comparison | process | table | relation | code | stats`.
4. **كل شريحة**: `id` ببادئة الفصل (`ch2-kpis`)، `chapterId` مطابق، `title` اسم من 3–6 كلمات (ليس جملة)، `subtitle` اختياري، `icon` دالة، `archetype`، `content` مكوّن النمط مكان `null`. لا تترك `archetype: 'placeholder'` ولا `content: null`؛ عنوان بلا محتوى أو محتوى بلا عنوان = خطأ في التحقق. أثناء الصياغة يمكنك وضع `<Placeholder hint="…" />` من `@/components/ui` مؤقتاً.
5. **الشاشات الثابتة** في `src/data/presentation.tsx`:
   - `meta`: الجهة (سطور)، نوع العمل، العنوان، المنجزون، المشرف، التاريخ، `background` (`'stars' | 'network' | 'snow' | 'bubbles' | 'fireflies' | 'none'`).
   - `preface`: 3–4 خطوات بترتيب **سياق ← إشكالية (سؤال واحد) ← أهداف ← منهجية**.
   - `final`: 3–4 جمل تلخّص (لا معلومة جديدة) + `closing` + `thanks` + `celebrate` (`true`/`'fireworks'`… أو `false` للمناقشات الرسمية).
6. **الخطوط**: اختر اقتراناً يناسب طابع العرض في `src/data/typography.ts` (`preset: 'academic' | 'modern-tech' | 'corporate' | 'editorial' | 'heritage' | 'kufi-bold' | 'friendly' | 'geometric' | 'maghrebi'`؛ الافتراضي Cairo). عاينه في `/?lab=fonts`. الدليل: `docs/TYPOGRAPHY.md`.
7. **الحركة**: الأساس يعمل تلقائياً (انتقالات، stagger، كشف الكلمات). أضف مؤثراً **واحداً مهيمناً** حيث يخدم الفكرة فقط — من `@/components/effects` أو `@/components/gallery` أو وصفة من `@/recipes` (مهارة `presentation-motion-director` تحسم الاختيار).
8. **شغّل `npm run check`** (أنواع + اختبارات + بناء) وأصلح كل خطأ. راجع تحذيرات التحقق في وحدة تحكم المتصفح (`npm run dev`): القالب الأبيض يطبع `template.blank` وحده؛ ومع التعبئة لا يجوز أن يبقى `slide.blank` / `preface.blank` / `chapter.title` / `slide.placeholder`. اختبارات `render.test.tsx` تتحقق من أن القالب الأبيض بلا نصّ — إن ملأت `src/data/` فعلاً لعرض حقيقي، حدّث مجموعة «القالب الأبيض» فيها (أو اجعلها تعمل على نسخة من البيانات).

## المكتبات المثبتة (لا تثبّت شيئاً إضافياً إلا لضرورة)

| الحاجة | استعمل من `@/components/effects` | المكتبة الأصلية |
|---|---|---|
| إظهار الكتل تباعاً / حركات عامة | `Stagger`, `Card`, `WordReveal` من `@/components/ui` و`motion.*` | framer-motion |
| تسلسل زمني معقّد داخل شريحة | `useGSAP` + `gsap.timeline()`، أو `GsapReveal` | gsap + @gsap/react (كل الإضافات) |
| تقسيم عنوان لتحريكه | `splitWords()` — **كلمات فقط** | GSAP SplitText |
| احتفال (خاتمة/نتيجة) | `ConfettiOnMount`, `fireConfetti` | canvas-confetti |
| خلفية جسيمات | `ParticlesBackground preset="…"` | @tsparticles/react + slim |
| رسم متحرك JSON | `LottiePlayer src={json}` (ضع الملفات في `src/assets/lottie/`) | lottie-react |
| نص يُكتب تدريجياً | `Typewriter` | react-type-animation |
| إبراز كلمة بخط اليد | `Annotate type="circle|highlight|box|underline"` | rough-notation (RTL) |
| بطاقة تميل مع المؤشر | `TiltCard` | react-parallax-tilt |
| قائمة تتحرك عند التغيير | `AutoAnimate` | @formkit/auto-animate |
| حركة بأصناف CSS فقط | `className="animate-in fade-in slide-in-from-bottom-4"` | tw-animate-css |

| عنصر بصري جاهز (42 مكوّناً MIT) | `AnimatedBeam`, `NumberTicker`, `TextAnimate`, `TextEffect`, `TextLoop`, `TextShimmer`, `MorphingText`, `LineShadowText`, `OrbitingCircles`, `Terminal`, `Marquee`, `BorderBeam`, `Meteors`, `Safari`, `Iphone`, `ImageComparison`… من `@/components/gallery` | Magic UI + motion-primitives (مستعارة) |
| تركيبة كاملة لنمط | `StatsCountUp`, `RelationBeams`, `TitleHero`, `CodeTerminal`, `TimelineDraw`, `EcosystemOrbit`, `GsapTitleTimeline`, `BeforeAfterCompare` من `@/recipes` | وصفات مُختبَرة |
| حركة نص عربي آمنة (وزن/قناع/تظليل/تدرّج) | `KineticHeadline`, `VariableText`, `ClipReveal`, `HighlightSweep`, `FancyText` من `@/components/typography` | framer-motion + خطوط متغيّرة |
| «الخط يُكتب» بالقلم (بسملة/عنوان ≤ 6 كلمات) | `CalligraphyText text font="aref-ruqaa"` من `@/components/typography` | harfbuzzjs (wasm كسول) |
| رقم بطل تتدحرج خاناته / عنوان يملأ الشاشة | `NumberRoll value locales="ar-DZ"` / `FitText` من `@/components/typography` | @number-flow/react / fitty |
| رسم بياني متحرك (أعمدة/خط/حلقة/رادار/خط مصغّر/قائمة أشرطة) | `ChartFrame` + `MotionBarChart`, `MotionLineChart`, `MotionDonutChart`, `MotionRadarChart`, `Sparkline`, `MotionBarList` من `@/components/charts`؛ وصفتا `KpiCards`, `ChartStory` من `@/recipes` | framer-motion + d3-scale/shape (RTL أصلي) |
| خريطة ذهنية تفاعلية (عقد، وصلات، تكبير/تحريك) | استخدم الحزمة المثبتة `@xyflow/react` عند طلب خريطة ذهنية؛ استورد CSS من `@xyflow/react/dist/style.css` وحمّل الوحدة الكبيرة ديناميكياً إذا كانت شاشة اختيارية | `@xyflow/react` (React Flow) |
| شكل متقدّم (قمع، وافل، سانكي، مقياس، خريطة حرارية/شجرية، تحوّل شامل) | `lazyChart(() => import('…'))` حول Recharts (`@/components/charts/recharts`) أو Nivo (`@nivo/*` + `nivoTheme`)، أو `<ChartJs />` / `<EChart />` (كسولان) | recharts / nivo / chart.js / echarts — كلها كسولة |

الأيقونات: `lucide-react` فقط. الخطوط: 29 خطاً مثبتاً دون اتصال (`src/fonts/registry.ts`؛ كوفي/نسخ/رقعة/حديث/مدوّر/زخرفي + Inter وJetBrains Mono وFira Code) تُختار بالاقتران من `src/data/typography.ts`؛ الافتراضي Cairo + JetBrains Mono.

## قواعد لا تُكسر

- **فكرة واحدة لكل شريحة**؛ العنوان ≤ 6 كلمات.
- **لا تقسّم النص العربي إلى حروف** في أي حركة (كلمات/أسطر فقط)، ولا `tracking-*`/`italic` على العربية (الخطوط العرضية بحجم كبير فقط).
- الأرقام والمصطلحات في `<Num>` / `<Term>` / `<Badge>` لا داخل فقرات.
- معرفات الشرائح فريدة وببادئة الفصل؛ `chapterId` يطابق الفصل.
- RTL للعربية، و`dir="ltr"` تلقائي للكود والمعرّفات (`<code>`, `Term`).
- الخاتمة تلخّص فقط. الخلفيات `pointer-events-none`. احترم `prefers-reduced-motion` (المغلّفات تفعل).
- لا تعدّل `src/components/`، `src/hooks/`، `src/lib/` لمجرد تعبئة محتوى.
- لا تضف ملفات ثقيلة إلى Git (فيديو، Lottie ضخم > 1MB) — استعمل `public/` أو روابط.

## أوامر

```bash
npm install          # مرة واحدة
npm run dev          # http://localhost:5173 — يطبع تقرير التحقق في وحدة تحكم المتصفح
npm test             # 163 اختباراً (تحقق، تدفق، عرض كل شاشة، الأنماط العشرة، المؤثرات، المعرض، الوصفات، الخطوط)
npm run check        # أنواع + اختبارات + بناء — يجب أن يمرّ قبل التسليم
```

## تعريف الاكتمال (Definition of Done)

- [ ] `npm run check` يمرّ بلا أخطاء.
- [ ] لا تحذير `template.blank` / `slide.blank` / `preface.blank` / `chapter.title` / `slide.placeholder`، ولا نصوص «…» نائبة في `src/data/`.
- [ ] 3–5 فصول، كل فصل تمهيد + 2–6 محاور + خلاصة.
- [ ] المقدمة 3–4 خطوات والإشكالية سؤال واحد.
- [ ] الخاتمة 3–4 جمل بلا معلومة جديدة؛ `celebrate` مناسب لطابع العرض.
- [ ] كل شريحة نمط واحد ومؤثر مهيمن واحد على الأكثر.
- [ ] مرّت قائمة مهارة `animation-qa` (عربية بالكلمات، RTL، تقليل الحركة، أداء).
- [ ] اقتران الخطوط مقصود (`src/data/typography.ts`) ومرّت قائمة `arabic-typography-motion` (لا تباعد حروف/مائل على العربية).
- [ ] كل رسم بياني: أول فئة يميناً، عنوان خبري، لون مميَّز واحد، ≤ 7 فئات، اكتمال ≤ 2 ث، والمكتبة الثقيلة كسولة (قائمة `data-charts-motion`).
