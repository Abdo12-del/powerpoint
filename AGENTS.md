# AGENTS.md — موجز للوكيل البرمجي

> اقرأ هذا الملف أولاً إن طُلب منك **إنتاج عرض تقديمي** من هذا المستودع (مذكرة/مناقشة تخرج، تقرير مؤسسة، دورة تدريبية، عرض منتج…).

## ما هذا المستودع؟

قالب عرض تقديمي **أبيض تماماً (لا نصّ في أي شاشة)** يعمل في المتصفح (React 19 + Vite 7 + TypeScript + Tailwind 4، عربي RTL)، يطبّق مواصفة ثابتة: **عنوان ← مقدمة (3–4 خطوات) ← خريطة فصول ← شرائح (3–5 فصول × 4–8 شرائح) ← خاتمة**. كل البنية والتنقل والتحقق والمكتبات جاهزة؛ عند **إنتاج عرض** اقتصر على تعبئة `src/data/` ولا تعدّل المكونات لمجرد إدخال المحتوى. أما طلبات تطوير القالب فتسمح بإضافة أداة أو سلوك جديد دون كسر عقد الأنماط.

| اقرأ | لماذا |
|---|---|
| `docs/PRESENTATION_TEMPLATE_SPEC.md` | المواصفة الكاملة والقواعد وقائمة الاكتمال |
| `docs/ARCHETYPES.md` | الأنماط العشرة للشرائح مع مقتطف استعمال لكل واحد |
| `docs/ANIMATION_LIBRARIES.md` | مكتبات الحركة المثبتة: جدول «ماذا أريد ← ماذا أستعمل» |
| `docs/ANIMATION_PROJECTS.md` | المهارات، معرض المكونات المستعارة، الوصفات، وكتالوج مشاريع GitHub |
| `docs/TYPOGRAPHY.md` | 29 خطاً عربياً حسب النوع، 10 اقترانات جاهزة، قواعد الطباعة العربية، ومكونات حركة النص |
| `docs/TEXT_ANIMATION_PROJECTS.md` | مشاريع حركة الخطوط المثبّتة (HarfBuzz «الخط يُكتب»، number-flow، fitty) والمكونات النصية الخمسة الجديدة وما رُفض ولماذا |
| `docs/CHARTS.md` | الرسوم البيانية وحركاتها: الرسوم الحركية المخصّصة (أعمدة/خط/حلقة/رادار/خط مصغّر/قائمة أشرطة)، Recharts/Nivo/Chart.js/ECharts بسمة واحدة، مرايا RTL، التحميل الكسول، والمختبر `?lab=charts` |
| `docs/DIAGRAMS_CODE.md` | Mermaid 12، Shiki 4، React Flow/Dagre، Excalidraw؛ RTL، الثيم، الحركة التدريجية، أمثلة ومختبر `?lab=diagrams` |
| `.agents/skills/*/SKILL.md` | **المهارات** — اقرأ المناسبة قبل العمل على الحركة (الجدول أدناه) |
| `src/types/presentation.ts` | العقود: `PresentationMeta`, `PrefaceStep`, `ChapterData`, `SlideData`, `FinalData` |
| `src/data/` | الاستمارات التي تملؤها — بيضاء تماماً: كل الحقول `''` وكل `content: null`، والتعليقات تشرح كل حقل؛ الشاشات تُظهر عناوينها وشاراتها تلقائياً فور الكتابة (`src/lib/blank.ts`) |

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
| `technical-diagrams-code` | إضافة مخطط تقني/شفرة: Mermaid، Shiki، React Flow/Dagre، Excalidraw، سمة القالب، RTL، الحركة التدريجية والرخص |
| `animation-qa` | قبل التسليم، أو عند حركة بطيئة/متقطعة |

إن لم يحمّلها وكيلك تلقائياً فاقرأ ملف `SKILL.md` المناسب مباشرة.

## خطوات التنفيذ (الوصفة)

1. **اجمع مادة العرض** من المستخدم (العنوان، الجهة، المنجزون، المشرف، التاريخ، محتوى المذكرة/التقرير). إن نقصت معلومة اسأل أو ضع نصاً نائباً واضحاً — لا تخترع أرقاماً أو أسماء.
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
| شكل متقدّم (قمع، وافل، سانكي، مقياس، خريطة حرارية/شجرية، تحوّل شامل) | `lazyChart(() => import('…'))` حول Recharts (`@/components/charts/recharts`) أو Nivo (`@nivo/*` + `nivoTheme`)، أو `<ChartJs />` / `<EChart />` (كسولان) | recharts / nivo / chart.js / echarts — كلها كسولة |
| مخطط نصّي ثابت (flow / sequence / MCD / UML) | `MermaidDiagram` من `@/components/diagrams` — RTL، سمة slate/amber/sky، روابط تدريجية، strict security | Mermaid 12 (MIT؛ Node `>=22.12`؛ ElkJS متعدٍ ورخصته موضحة في `docs/DIAGRAMS_CODE.md`) |
| شبكة عقد قابلة للسحب أو القراءة | `NodeDiagram` من `@/components/diagrams` + `AnimatedBeam` اختياري؛ Dagre تلقائي | `@xyflow/react` + `@dagrejs/dagre` (MIT) |
| رسمة حرة «بخط اليد» | `ExcalidrawBoard` من `@/components/diagrams` (عربي، read-only افتراضياً) | `@excalidraw/excalidraw` (MIT؛ لا تضف tldraw) |
| شفرة مع ألوان أو diff أو كشف أسطر | `CodeBlock` من `@/components/archetypes` — `highlightLines`, `diff`, `revealLines` | Shiki 4 (MIT) |

الأيقونات: `lucide-react` فقط. الخطوط: 29 خطاً مثبتاً دون اتصال (`src/fonts/registry.ts`؛ كوفي/نسخ/رقعة/حديث/مدوّر/زخرفي + Inter وJetBrains Mono وFira Code) تُختار بالاقتران من `src/data/typography.ts`؛ الافتراضي Cairo + JetBrains Mono.

## قواعد لا تُكسر

- **فكرة واحدة لكل شريحة**؛ العنوان ≤ 6 كلمات.
- **لا تقسّم النص العربي إلى حروف** في أي حركة (كلمات/أسطر فقط)، ولا `tracking-*`/`italic` على العربية (الخطوط العرضية بحجم كبير فقط).
- الأرقام والمصطلحات في `<Num>` / `<Term>` / `<Badge>` لا داخل فقرات.
- معرفات الشرائح فريدة وببادئة الفصل؛ `chapterId` يطابق الفصل.
- RTL للعربية، و`dir="ltr"` تلقائي للكود والمعرّفات (`<code>`, `Term`). للمخططات اقرأ `docs/DIAGRAMS_CODE.md`: Mermaid بسمته الآمنة RTL، واتجاه العقد `RL` عند الحاجة، وحركة الروابط تحترم تقليل الحركة.
- لا تثبّت tldraw؛ إذا احتجت رسم حرّ استخدم Excalidraw MIT. لا تضف ELK مباشرة ما دام Dagre يفي بمتطلبات التخطيط.
- الخاتمة تلخّص فقط. الخلفيات `pointer-events-none`. احترم `prefers-reduced-motion` (المغلّفات تفعل).
- لا تعدّل `src/components/`، `src/hooks/`، `src/lib/` لمجرد تعبئة محتوى.
- لا تضف ملفات ثقيلة إلى Git (فيديو، Lottie ضخم > 1MB) — استعمل `public/` أو روابط.

## أوامر

يلزم Node.js `>=22.12.0` لتبعيات Mermaid 12؛ أمر `npm run build` يرفع حد V8 heap إلى 4 GiB لحزم الإنتاج الكبيرة.

```bash
npm install          # مرة واحدة
npm run dev          # http://localhost:5173 — يطبع تقرير التحقق في وحدة تحكم المتصفح
npm test             # 136 اختباراً (تحقق، تدفق، الأنماط، المؤثرات، المعرض، الوصفات، الخطوط/النص، الرسوم البيانية، المخططات والشفرة)
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
