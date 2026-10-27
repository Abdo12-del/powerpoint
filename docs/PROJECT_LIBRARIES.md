# فهرس مكتبات المشروع للوكيل الذكي

هذا الفهرس هو نقطة البدء لأي وكيل AI يعدّل المشروع أو ينشئ عرضاً فيه. **المكتبات المذكورة مثبتة**؛ مصدر الإصدارات والحالة النهائي هو `package.json` و`package-lock.json`. لا تعِد تنفيذ وظيفة موجودة يدوياً، ولا تثبّت حزمة مكررة قبل البحث في هذا الفهرس والمغلّفات الموجودة في `src/`.

## سياسة الوكيل

1. اقرأ تعليمات الوكيل المولّدة (`AGENTS.md` أو ملف الأداة المناسبة) وهذا الفهرس قبل اقتراح مكتبة أو إضافة اعتماد. المصدر المنظم للقواعد هو `.ruler/`.
2. اختر المكتبة المناسبة من الجداول، ثم ابحث عن مغلّف جاهز أو مثال في المسارات المذكورة قبل الاستيراد المباشر.
3. أعد استعمال المكونات والمغلّفات الحالية (`src/components/`, `src/recipes/`, `src/lib/`) متى غطّت الحاجة.
4. حمّل المكتبات الثقيلة/الاختيارية كسولاً عند توفر ذلك؛ لا تضفها إلى الحزمة الأولية بلا حاجة.
5. لا تضف اعتماداً جديداً إلا إذا لم تغطِّ المكتبات الحالية المطلوب، مع شرح السبب وإضافة توثيق/اختبار مناسب.
6. لا تحذف اعتماداً لمجرد أن استعماله غير واضح؛ تحقّق أولاً من الاستيرادات والمهارات والتجارب والمختبرات.

## مكتبات التطبيق (`dependencies`)

### إطار التطبيق والبنية

| الحزمة | الغرض/التوجيه |
|---|---|
| `react`, `react-dom` | بناء الواجهات والمكونات؛ اتبع نمط React الموجود. |
| `@xyflow/react` | خرائط ذهنية/رسوم عقدية تفاعلية (عقد، وصلات، تحريك وتكبير). أدرج `@xyflow/react/dist/style.css` عند الاستعمال، وافصل شاشة الخريطة ديناميكياً إذا كانت اختيارية. |
| `lucide-react` | أيقونات الواجهات والشرائح؛ لا تضف مكتبة أيقونات بديلة. |
| `clsx`, `tailwind-merge` | تركيب ودمج أصناف CSS؛ استعمل المساعد `cn` في `src/lib/cn.ts`. |

### الحركة، العرض الحي، والتأثيرات

| الحزمة | الغرض/التوجيه |
|---|---|
| `framer-motion` | انتقالات الشاشات، ظهور البطاقات، الحركة القائمة على الحالة. ابدأ بالمغلفات في `src/components/ui/` و`src/components/effects/`. |
| `gsap`, `@gsap/react` | الخطوط الزمنية المركبة والتحكم الحركي؛ استخدم `useGSAP` والتهيئة الموجودة في `src/lib/gsap.ts` أو فهرس المؤثرات. |
| `lenis` | تمرير ناعم للمشاهد التي تحتاجه؛ تحقق من تكامل المشروع وتقليل الحركة قبل إضافته. |
| `reveal.js`, `reveal.js-plugins` | عروض Reveal.js/ملحقاتها عند الحاجة؛ لا تستبدل بنية العرض الحالية بها دون طلب. |
| `three` | مشاهد ورسوم WebGL/3D؛ اعزلها في شاشة/مكوّن كسول وقدّم بديلاً عند غياب WebGL. |
| `@tsparticles/engine`, `@tsparticles/react`, `@tsparticles/slim` | خلفيات الجسيمات؛ استخدم `ParticlesBackground` وpresets الموجودة، لا تنشئ محركاً ثانياً. |
| `canvas-confetti` | احتفال خفيف؛ استخدم `fireConfetti` أو `ConfettiOnMount` واحترم تقليل الحركة. |
| `lottie-react` | تشغيل ملفات Lottie؛ استخدم `LottiePlayer` والتحميل الكسول، وضع الأصول في المسار المعتمد. |
| `react-type-animation` | كتابة/تبديل النص؛ استعمل `Typewriter` مع النص العربي كلمةً كلمة لا حرفاً حرفاً. |
| `rough-notation` | تعليم أو تحديد نص بالقلم؛ استخدم `Annotate` وتهيئة RTL الموجودة. |
| `react-parallax-tilt` | تأثير الميل للبطاقات؛ استخدم `TiltCard` بدلاً من كتابة مستمعات المؤشر يدوياً. |
| `@formkit/auto-animate` | انتقالات DOM للقوائم المتغيرة؛ استخدم `AutoAnimate`. |
| `@number-flow/react` | تحريك الأرقام؛ استعمل `NumberRoll` من `src/components/typography/`. |
| `fitty` | احتواء النص ضمن المساحة؛ استعمل `FitText` من `src/components/typography/`. |
| `harfbuzzjs` | تشكيل النص العربي ورسم مسارات الحروف؛ استعمل `CalligraphyText` الجاهز ولا تعالج العربية يدوياً. |
| `tw-animate-css` | أصناف حركة CSS/Tailwind؛ مستورد في CSS المشروع، تجنب إعادة تعريف الصنف الموجود. |

### الرسوم البيانية والبيانات

| الحزمة | الغرض/التوجيه |
|---|---|
| `recharts` | رسوم React شائعة؛ المسارات والمغلفات في `src/components/charts/recharts/`، وتحمّل كسولاً. |
| `@nivo/bar`, `@nivo/bump`, `@nivo/core`, `@nivo/funnel`, `@nivo/heatmap`, `@nivo/line`, `@nivo/pie`, `@nivo/radar`, `@nivo/radial-bar`, `@nivo/sankey`, `@nivo/theming`, `@nivo/treemap`, `@nivo/waffle` | عائلة Nivo للأشكال البيانية المتخصصة؛ ابدأ بـ`src/components/charts/` ودليل `docs/CHARTS.md`، وحمّل النوع المطلوب فقط. |
| `chart.js`, `react-chartjs-2`, `chartjs-plugin-datalabels` | رسوم Chart.js؛ استعمل المكونات الجاهزة في `src/components/charts/`، وسجّل الإضافات وفق الأمثلة. |
| `echarts`, `echarts-for-react` | رسوم ECharts للأشكال المتقدمة؛ استعمل `EChart` الكسول في المشروع، لا تستورد المحرك في شاشة العرض الأساسية. |
| `d3-array`, `d3-interpolate`, `d3-scale`, `d3-shape` | حساب المقاييس والأشكال والاستيفاء؛ تستخدمها طبقات الرسوم الخفيفة. استعملها مباشرة فقط عند حاجة لا يغطيها مغلف الرسوم. |

### خطوط وأصول محلية

كل الحزم التالية توفر ملفات خطوط محلية بلا اعتماد على تحميل الخط من خدمة خارجية. اختَر من سجل الخطوط والاقترانات في `src/fonts/registry.ts` و`src/data/typography.ts`، ولا تستورد الخطوط عشوائياً داخل الشرائح.

- **متغيرة** (`@fontsource-variable/*`): `@fontsource-variable/alexandria`, `@fontsource-variable/baloo-bhaijaan-2`, `@fontsource-variable/cairo`, `@fontsource-variable/changa`, `@fontsource-variable/el-messiri`, `@fontsource-variable/inter`, `@fontsource-variable/kufam`, `@fontsource-variable/lemonada`, `@fontsource-variable/marhey`, `@fontsource-variable/markazi-text`, `@fontsource-variable/noto-kufi-arabic`, `@fontsource-variable/noto-naskh-arabic`, `@fontsource-variable/noto-sans-arabic`, `@fontsource-variable/readex-pro`, `@fontsource-variable/reem-kufi`, `@fontsource-variable/rubik`, `@fontsource-variable/vazirmatn`.
- **ثابتة** (`@fontsource/*`): `@fontsource/almarai`, `@fontsource/amiri`, `@fontsource/aref-ruqaa`, `@fontsource/fira-code`, `@fontsource/harmattan`, `@fontsource/ibm-plex-sans-arabic`, `@fontsource/jetbrains-mono`, `@fontsource/jomhuria`, `@fontsource/katibeh`, `@fontsource/rakkas`, `@fontsource/scheherazade-new`, `@fontsource/tajawal`.

## أدوات التطوير والاختبار (`devDependencies`)

| الحزمة | الغرض |
|---|---|
| `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss` | خادم التطوير والبناء وتحويل React وTailwind؛ حافظ على إعدادات `vite.config.*` وCSS الحالية. |
| `@intellectronica/ruler` | إدارة تعليمات AI المعيارية في `.ruler/` وتوليد ملفات الوكلاء عبر `npm run ai:rules`؛ لا تعدّل المخرجات المولّدة يدوياً. |
| `typescript` | فحص وبناء TypeScript؛ لا تتجاوز أخطاء النوع بـ`any` أو تعطيل الفحوص إلا لضرورة موثقة. |
| `vitest`, `jsdom` | اختبارات الوحدات وتكامل DOM؛ أضف/حدّث اختباراً مع السلوك الجديد. |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/three`, `@types/canvas-confetti`, `@types/d3-array`, `@types/d3-interpolate`, `@types/d3-scale`, `@types/d3-shape` | تعريفات TypeScript للمكتبات المقابلة؛ لا تستوردها وقت التشغيل. |

## سجل الأسماء الكامل (مطابق لـ`package.json`)

هذه القائمتان مرجع آلي للتحقق من أن كل اعتماد مثبت موثق للوكيل. حدّثهما عند إضافة/حذف حزمة؛ الإصدارات تبقى في `package.json` و`package-lock.json`.

### Runtime dependencies

<!-- runtime-packages:start -->
`@fontsource-variable/alexandria`, `@fontsource-variable/baloo-bhaijaan-2`, `@fontsource-variable/cairo`, `@fontsource-variable/changa`, `@fontsource-variable/el-messiri`, `@fontsource-variable/inter`, `@fontsource-variable/kufam`, `@fontsource-variable/lemonada`, `@fontsource-variable/marhey`, `@fontsource-variable/markazi-text`, `@fontsource-variable/noto-kufi-arabic`, `@fontsource-variable/noto-naskh-arabic`, `@fontsource-variable/noto-sans-arabic`, `@fontsource-variable/readex-pro`, `@fontsource-variable/reem-kufi`, `@fontsource-variable/rubik`, `@fontsource-variable/vazirmatn`, `@fontsource/almarai`, `@fontsource/amiri`, `@fontsource/aref-ruqaa`, `@fontsource/fira-code`, `@fontsource/harmattan`, `@fontsource/ibm-plex-sans-arabic`, `@fontsource/jetbrains-mono`, `@fontsource/jomhuria`, `@fontsource/katibeh`, `@fontsource/rakkas`, `@fontsource/scheherazade-new`, `@fontsource/tajawal`, `@formkit/auto-animate`, `@gsap/react`, `@nivo/bar`, `@nivo/bump`, `@nivo/core`, `@nivo/funnel`, `@nivo/heatmap`, `@nivo/line`, `@nivo/pie`, `@nivo/radar`, `@nivo/radial-bar`, `@nivo/sankey`, `@nivo/theming`, `@nivo/treemap`, `@nivo/waffle`, `@number-flow/react`, `@tsparticles/engine`, `@tsparticles/react`, `@tsparticles/slim`, `@xyflow/react`, `canvas-confetti`, `chart.js`, `chartjs-plugin-datalabels`, `clsx`, `d3-array`, `d3-interpolate`, `d3-scale`, `d3-shape`, `echarts`, `echarts-for-react`, `fitty`, `framer-motion`, `gsap`, `harfbuzzjs`, `lenis`, `lottie-react`, `lucide-react`, `react`, `react-chartjs-2`, `react-dom`, `react-parallax-tilt`, `react-type-animation`, `recharts`, `reveal.js`, `reveal.js-plugins`, `rough-notation`, `tailwind-merge`, `three`, `tw-animate-css`
<!-- runtime-packages:end -->

### Dev dependencies

<!-- dev-packages:start -->
`@intellectronica/ruler`, `@tailwindcss/vite`, `@types/canvas-confetti`, `@types/d3-array`, `@types/d3-interpolate`, `@types/d3-scale`, `@types/d3-shape`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/three`, `@vitejs/plugin-react`, `jsdom`, `tailwindcss`, `typescript`, `vite`, `vitest`
<!-- dev-packages:end -->
