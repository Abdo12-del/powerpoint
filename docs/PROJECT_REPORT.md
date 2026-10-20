# التقرير الشامل — قالب العروض التقديمي العربي

> **التاريخ:** 2026-10-20 · **الفرع:** `arena/5af2c897-powerpoint` · **آخر التزام:** `f629b75` (مدفوع)
> **الخط الأساس:** `e0ccc01` نشر قالب العرض التقديمي الأبيض (#1)

---

## 1. نظرة عامة

قالب عروض تقديمية **عربي أولاً (RTL أصيل)** مبني بـ React 19 + Vite + TypeScript + Tailwind، يقدّم بديلاً حديثاً عن PowerPoint مع نظام حركة غني ونظام حزم قابلة للتوسّع. تدفق العرض: **شاشة العنوان ← خطوات المقدمة ← خريطة الفصول ← شرائح الفصول ← الخاتمة**، مع ملاحة كاملة بلوحة المفاتيح واللمس والسحب.

**نمط العمل المعتمد في كل حزمة** (7 حزم منفذة بنفس العقد):
مختبر حي `?lab=<name>` + مكوّن جاهز قابل لإعادة الاستخدام + دليل `docs/*.md` + مهارة وكيل `.agents/skills/` + اختبارات + تحديث README/AGENTS + التزام ودفع.

**ضمانات الاندماج عبر كل الحزم:** عقد التحكم §6 محفوظة دائماً (المفاتيح الجديدة إضافة خالصة)، دعم `prefers-reduced-motion`، عمل صامت في jsdom، بديل آمن عند غياب الإمكانات (WebGL / نوافذ منبثقة)، وكل شيء RTL-safe.

---

## 2. البنية التقنية

| الطبقة | التقنيات |
|---|---|
| الأساس | React 19، Vite، TypeScript، Tailwind، tw-animate-css |
| الحركة | framer-motion، GSAP (+ @gsap/react)، Motion Canvas (فلسفة الخط الزمني الحتمي)، @formkit/auto-animate |
| ثلاثي الأبعاد | Three.js، Lenis (تمرير انسيابي)، react-parallax-tilt |
| المكاتب المفتوحة المستعارة | reveal.js (MIT: نموذج Zoom وNotes)، reveal.js-plugins (MIT: نموذج chalkboard)، Magic UI وmotion-primitives (معرض 40 مكوّناً) |
| الرسوم البيانية | مكوّنات مخصّصة (framer-motion + d3) + غلاف لـ Recharts/Nivo/Chart.js/ECharts |
| الخطوط | 29 حزمة fontsource (أغلبها عربية متغيرة: Alexandria، Cairo، Readex Pro، Amiri، Aref Ruqaa…) |
| نص عربي | harfbuzzjs لتشكيل النص، fitty لملاءمة الأحجام |
| أرقام وجزيئات | @number-flow/react، canvas-confetti، @tsparticles |
| أيقونات | lucide-react |

**سكربتات الجودة:** `npm run check` = typecheck (tsc -b) + vitest + build — البوابة الإلزامية قبل كل التزام.

**الأرقام:**

| المقياس | القيمة |
|---|---|
| أسطر المصدر (بلا اختبارات) | ≈ 28,800 سطر |
| أسطر الاختبارات | ≈ 4,200 سطر |
| الاختبارات | **278 اختباراً أخضر** في 23 ملفاً |
| مهارات الوكيل | **19 مهارة** في `.agents/skills/` |
| الأدلة | 14 دليلاً في `docs/` + 3 لقطات WebGL حقيقية |
| المختبرات الحية | **10 مختبرات عبر 15 مساراً** |
| المعرفة المعروضة | 42 مكوّن معرض + 10 وصفات جاهزة (`src/recipes/`) |
| الحزم البرمجية المباشرة | **77 إنتاجاً + 16 تطويراً** (والسجل الكامل في §9) |

---

## 3. نظام العروض الأساسي (قبل الحزم)

- **المنسّق `Presentation.tsx`**: يربط البيانات ↔ الحالة ↔ الطبقات، وسلسلة Esc بالطبقات، وحماية أهداف النقر.
- **الملاحة `lib/navigation.ts`**: `buildSequence`/`nextScreen` — عقد تدفق حتمية (title/preface/map/slide/final).
- **التحقق `validatePresentation`**: Definition of Done تُطبع في وضع التطوير (القالب الأبيض + التعبئة الجزئية).
- **أنماط الشرائح (archetypes)** موثقة في `docs/ARCHETYPES.md`: بطاقات، جدول، مقارنة، خط زمني، شجرة، تدفق، عدادات، مقطع كود…
- **شريط التحكم ونافذة الاختصارات** — خريطة المفاتيح الحالية الكاملة:

| المفاتيح | الوظيفة |
|---|---|
| `→` / Enter / Space | الشريحة التالية |
| `←` | الشريحة السابقة |
| `↓` / M / Esc | خريطة الفصول (Esc منها: العودة للعنوان) |
| `F` | ملء الشاشة |
| `?` / H | نافذة الاختصارات |
| `C` | التعليق فوق الشريحة (قلم) |
| `B` | سبورة مستقلة بصفحات |
| Delete | مسح الرسم |
| Alt+Click (Ctrl على لينكس) | تكبير نحو نقطة الشرح |
| `Z` | تكبير/خروج مركزي |
| `S` | تسليط الضوء على موضع الشرح |
| `L` | مؤشر ليزر |
| `N` | نافذة المعلم: ملاحظات + معاينة + مؤقت |

---

## 4. الحزم السبع — الجدول الإجمالي

| # | الحزمة | النموذج المفتوح | الالتزام | المختبر | الدليل | المهارة |
|---|---|---|---|---|---|---|
| 1 | العرض السينمائي ثلاثي الأبعاد (3D Website Flyover) | Three.js (MIT) | `32b1de4` | `?lab=flyover` · `?lab=cinematic` | CINEMATIC_FLYOVER.md | cinematic-flyover |
| 2 | الشورييل الإبداعي (Motion Design Showreel 15ث) | Motion Canvas + GSAP (MIT) | `32b1de4` | `?lab=showreel` · `?lab=motion` | MOTION_SHOWREEL.md | motion-showreel |
| 3 | المؤثرات السينمائية (Three.js + Lenis) | Three.js + Lenis (MIT) | `009c12f` | `?lab=effects` | CINEMATIC_EFFECTS.md | cinematic-effects |
| 4 | الموشن البحثي (Distilbook) | Motion Canvas + GSAP + Three.js | `ce633db` | `?lab=distilbook` · `?lab=research` | DISTILBOOK_MOTION.md | distilbook-motion |
| 5 | السبورة والتعليق (Chalkboard) | chalkboard من reveal.js-plugins (MIT) | `a7d2c95` | `?lab=chalkboard` · `?lab=board` | CHALKBOARD.md | chalkboard-annotation |
| 6 | التكبير والتركيز (Zoom & Spotlight) | RevealZoom من reveal.js (MIT) | `8193740` | `?lab=spotlight` · `?lab=zoom` | SPOTLIGHT.md | zoom-spotlight |
| 7 | ملاحظات المعلم ومؤقت العرض (Presenter Notes & Timer) | Reveal Notes من reveal.js (MIT) | `f629b75` | `?lab=presenter` · `?lab=notes` | PRESENTER.md | presenter-notes |

### الحزمة 1 — العرض السينمائي ثلاثي الأبعاد
تحويم سينمائي حول موقع ويب مُجسّم ثلاثي الأبعاد: مسار كاميرا بمنحنيات Catmull-Rom، مراحل دخول/دوران/اقتراب/بطاقة ختامية، شاشة سينمائية (letterbox) وتشغيل حتمي بـ THREE.Timer. لقطات WebGL حقيقية محفوظة في `docs/cinematic-*.jpg` بسكربت `npm run capture*`. الاختبارات: `cinematic.test.ts` (22) + `cinematic-ui.test.tsx` (11).

### الحزمة 2 — الشورييل الإبداعي (15 ثانية)
فيلم موشن جرافيك قصير: Kinetic Typography، انتقالات 3D، بارالاكس، جليتش، مورف، جزيئات، مع Slide/Zoom وتزامن مع الإيقاع (BPM عبر BeatClock) — فلسفة Motion Canvas: خط زمني حتمي قابل للمعاينة إطاراً بإطار. الاختبارات ضمن حزمة cinematic + `showreel` في `src/showreel/`.

### الحزمة 3 — المؤثرات السينمائية
مشاهد Three.js بتمرير Lenis الانسيابي: بارالاكس/مورف/جليتش/جزيئات + تشوهات بصرية (RGB Shift، Grain، Vignette، Bloom) في مرور واحد، انتقالات ديناميكية بين المقاطع، وتزامن الحركة مع الإيقاع. **بديل CSS آمن كامل عند غياب WebGL** (`isWebGLAvailable`). الاختبارات: `cinematic-effects.test.ts` (21) + `cinematic-effects-ui.test.tsx` (5) + `effects.test.tsx` (7).

### الحزمة 4 — الموشن البحثي Distilbook (20 ثانية)
قصة منصة بحثية بأسلوب Showreel: افتتاح بحروف العلامة، مشهد المشكلة (تكدّس 8 صفحات وعدّاد الحجم)، **مشهد التقطير** ثلاثي الأبعاد (بديل CSS بنفس الاستعارة)، الأفكار، شبكة المراجع SVG، وبطاقات الملخصات — ماركب مشاهد ثابت قابل للاختبار. الاختبارات: `distilbook-motion.test.ts` (10) + `distilbook-ui.test.tsx` (12).

### الحزمة 5 — السبورة والتعليق
نموذج chalkboard من reveal.js-plugins: **قلم تعليق فوق الشريحة** (`C`) و**سبورة سوداء مستقلة بصفحات** (`B`) بألوان طباشير ومسح (`Delete`)، طبقة رسم لا تعترض التنقّل، وخروج Esc ضمن سلسلة الطبقات. الاختبارات: `chalkboard.test.ts` (15) + `chalkboard-ui.test.tsx` (8).

### الحزمة 6 — التكبير والتركيز
نموذج RevealZoom: **Alt+Click** يزرع نقطة النقر أعلى-يسار المسرح ثم translate-then-scale، التفاف أطراف 12% (÷scale)، Esc/نقر ثانٍ للخروج، والعجلة تغيّر المستوى — مع **مؤشر ليزر** متوهّج (Canvas 2D بوضع `lighter` ومسار متلاشٍ TTL 0.55ث) و**تسليط ضوء** دائري (radial-gradient، نصف قطر 140 قابل للضبط 60–420) يتبع موضع الشرح. مفاتيح Z/S/L، شارات حالة حية، وحماية أزرار الواجهة من التكبير. الاختبارات: `spotlight.test.ts` (16) + `spotlight-ui.test.tsx` (8).

### الحزمة 7 — ملاحظات المعلم ومؤقت العرض (الأحدث)
نموذج Reveal Notes: `N` (أو `ى`) يفتح **نافذة معلّم منبثقة** (`window.open` + `createRoot` داخل مستند rtl مُجهَّز بالكامل بأنماط مستنسخة)، وعند حجب النوافذ المنبثقة يتراجع تلقائياً إلى **لوحة مدمجة** بنفس المكوّن — الدرس لا يتعطل أبداً. تحتوي النافذة:
- **معاينتان حقيقيتان** للشريحة الحالية (620px) والتالية (300px) — نفس شاشات العرض مصغّرة بـ scale لا صوراً.
- **ملاحظات الشرح** تُكتب على `meta`/`preface[i]`/`slides[i]`/`final` عبر `notes?: string` وتقرأها `notesFor` — **لا تظهر للطلاب إطلاقاً** (الاختبارات تتحقق سلباً).
- **مؤقت وقت منقضٍ** يجمع الفترات (pause/resume/reset، تحديث كل 500ms عبر refs) + **ساعة حائط** + عدّاد «الشريحة i/n» + شريط تقدم + أزرار تنقّل متزامن.
- مفاتيح النافذة نفسها (RTL): `→`/مسافة سابق، `←` تالٍ، Esc إغلاق — وسلسلة Esc في العرض تبدأ بها.

الاختبارات: `presenter.test.ts` (11) + `presenter-ui.test.tsx` (9).

---

## 5. المختبرات الحية (10 مختبرات / 15 مساراً)

| المسارات | المختبر |
|---|---|
| `?lab=fonts` | معرض الخطوط العربية |
| `?lab=cinematic` · `?lab=flyover` | العرض السينمائي ثلاثي الأبعاد + لقطات |
| `?lab=charts` | الرسوم البيانية الحركية |
| `?lab=showreel` · `?lab=motion` | الشورييل الإبداعي |
| `?lab=effects` | المؤثرات السينمائية (WebGL + بديل) |
| `?lab=distilbook` · `?lab=research` | الموشن البحثي Distilbook |
| `?lab=chalkboard` · `?lab=board` | السبورة والتعليق |
| `?lab=spotlight` · `?lab=zoom` | التكبير والتركيز |
| `?lab=presenter` · `?lab=notes` | نافذة المعلم والمؤقت |

---

## 6. الجودة والاختبارات — 278 اختباراً / 23 ملفاً (كلها خضراء)

| الملف | العدد | الملف | العدد |
|---|---|---|---|
| render.test.tsx | 24 | validate.test.ts | 9 |
| cinematic.test.ts | 22 | typography-projects.test.tsx | 9 |
| cinematic-effects.test.ts | 21 | presenter-ui.test.tsx | 9 |
| charts.test.tsx | 19 | text-shaper.test.ts | 8 |
| typography.test.tsx | 17 | spotlight-ui.test.tsx | 8 |
| spotlight.test.ts | 16 | gallery.test.tsx | 8 |
| chalkboard.test.ts | 15 | chalkboard-ui.test.tsx | 8 |
| distilbook-ui.test.tsx | 12 | navigation.test.ts | 7 |
| archetypes.test.tsx | 12 | effects.test.tsx | 7 |
| presenter.test.ts | 11 | cinematic-effects-ui.test.tsx | 5 |
| cinematic-ui.test.tsx | 11 | | |
| recipes.test.tsx | 10 | distilbook-motion.test.ts | 10 |

**أمثلة ضمانات الاختبار:** الخصوصية السلبية للملاحظات (لا نص للطلاب)، جمع فترات المؤقت، طبقات Esc بالترتيب، الالتفاف بحدود المسرح، البديل الآمن بلا WebGL، انعكاس RTL في كل مكتبات الرسوم، وتعطّل الحركة مع `prefers-reduced-motion`.

**حلول بيئة jsdom الموثقة:** mock لـ @tsparticles/react، بديل OffscreenCanvas، مكوك getBoundingClientRect وهمي، `@vitest-environment jsdom` لملفات التخزين، واختبار المفاتيح داخل Presentation لا الهارنيس العاري.

---

## 7. مهارات الوكيل (19)

`presentation-motion-director` · `gsap-react-timelines` · `framer-motion-recipes` · `gallery-components` · `data-charts-motion` · `lottie-and-media` · `arabic-typography-motion` · `kinetic-typography` · `calligraphy-draw-on` · `numbers-and-counters` · `svg-diagram-animation` · `cinematic-flyover` · `motion-showreel` · `cinematic-effects` · `distilbook-motion` · `chalkboard-annotation` · `zoom-spotlight` · `presenter-notes` · `animation-qa`

كل مهارة: وصف إنجليزي يلتقط عبارات الطلب + وصفة سريعة + قواعد + قائمة مراجعة — ليعيد الوكيل إنتاج الحزمة دون إعادة اكتشاف.

---

## 8. حالة المستودع والخادم

- **سلسلة الالتزامات فوق الخط الأساس:** `af6d114` → `053946e` → `55a5c18` → `8293830` → `32b1de4` → `009c12f` → `ce633db` → `a7d2c95` → `8193740` → `f629b75` — كلها مدفوعة على `arena/5af2c897-powerpoint`.
- **آخر فحص كامل (`npm run check`):** typecheck ✅ + 278/278 ✅ + build 16.1s ✅.
- **خادم التطوير يعمل** على المنفذ 5173 وكل مساراته تُجيب 200 (الجذر + المختبرات).

---

## 9. سجل الحزم البرمجية (Dependencies)

**الإجمالي:** 93 حزمة مباشرة (77 إنتاجاً + 16 تطويراً) تجرّ معها 895 مدخلاً مثبّتاً في `node_modules` (مباشر + متعدٍّ). النسخ أدناه هي المثبّتة فعلياً من `package-lock.json`.

### 9.1 حزم الإنتاج (77) مصنّفة

| الفئة | الحزمة | النسخة | الرخصة | الدور |
|---|---|---|---|---|
| **الأساس** | `react` / `react-dom` | 19.3.1 | MIT | إطار الواجهة |
| | `clsx` / `tailwind-merge` | 2.1.1 / 3.7.0 | MIT | دمج الأصناف والأنماط |
| | `tw-animate-css` | 1.4.0 | MIT | حركات Tailwind جاهزة |
| | `lucide-react` | 0.577.0 | ISC | الأيقونات |
| **الحركة** | `framer-motion` | 12.43.0 | MIT | حركة المكوّنات والتخطيط |
| | `gsap` + `@gsap/react` | 3.15.0 / 2.1.2 | GSAP Standard (مجاني) | خطوط زمنية متقدمة وuseGSAP |
| | `@formkit/auto-animate` | 0.10.0 | MIT | حركة إدراج تلقائية |
| | `react-type-animation` | 3.2.0 | MIT | كتابة آلية |
| | `@number-flow/react` | 0.6.2 | MIT | أرقام متدحرجة |
| | `rough-notation` | 0.5.1 | MIT | تعليقات شبيهة بالرسم اليدوي |
| | `canvas-confetti` | 1.9.4 | ISC | احتفالات |
| | `@tsparticles/react` + `engine` + `slim` | 4.4.0 | MIT | جزيئات الخلفية |
| | `lottie-react` | 3.1.2 | MIT | تشغيل Lottie |
| **ثلاثي الأبعاد** | `three` | 0.186.1 | MIT | WebGL |
| | `lenis` | 1.3.27 | MIT | تمرير انسيابي |
| | `react-parallax-tilt` | 1.7.347 | MIT | ميلان وبارالاكس |
| **نماذج reveal.js** | `reveal.js` | 6.0.2 | MIT | مرجع نماذج Zoom/Notes (بلا استيراد مباشر) |
| | `reveal.js-plugins` | 4.6.0 | MIT | مرجع نموذج chalkboard (بلا استيراد مباشر) |
| **الرسوم البيانية** | `d3-array` / `interpolate` / `scale` / `shape` | 3.2.4 / 3.0.1 / 4.0.2 / 3.2.0 | ISC | حسابات الرسوم المخصّصة |
| | `recharts` | 3.10.1 | MIT | غلاف مكوّنات React |
| | `@nivo/*` (12 حزمة: core, bar, line, pie, radar, bump, funnel, heatmap, sankey, treemap, waffle, radial-bar, theming) | 0.99.0 | MIT | رسوم جاهزة بسمة القالب |
| | `chart.js` + `react-chartjs-2` + `chartjs-plugin-datalabels` | 4.5.1 / 5.3.1 / 2.2.0 | MIT | Canvas |
| | `echarts` + `echarts-for-react` | 6.1.0 / 3.0.6 | Apache-2.0 / MIT | رسوم غنية |
| **الخطوط (29)** | متغيرة (17): `alexandria` `baloo-bhaijaan-2` `cairo` `changa` `el-messiri` `inter` `kufam` `lemonada` `marhey` `markazi-text` `noto-kufi-arabic` `noto-naskh-arabic` `noto-sans-arabic` `readex-pro` `reem-kufi` `rubik` `vazirmatn` | 5.3.0 | OFL-1.1 | خطوط عربية/لاتينية متغيرة |
| | ثابتة (12): `almarai` `amiri` `aref-ruqaa` `fira-code` `harmattan` `ibm-plex-sans-arabic` `jetbrains-mono` `jomhuria` `katibeh` `rakkas` `scheherazade-new` `tajawal` | 5.3.0 | OFL-1.1 | خطوط كلاسيكية ومكملة |
| **النص العربي** | `harfbuzzjs` | 1.6.3 | MIT | تشكيل النص (Shaping) |
| | `fitty` | 2.4.2 | MIT | ملاءمة الحجم تلقائياً |

### 9.2 حزم التطوير (16)

| الفئة | الحزمة | النسخة | الرخصة |
|---|---|---|---|
| البناء | `vite` / `@vitejs/plugin-react` | 7.3.7 / 5.2.0 | MIT |
| الأنماط | `tailwindcss` / `@tailwindcss/vite` | 4.3.3 | MIT |
| اللغة | `typescript` | 5.9.3 | Apache-2.0 |
| الاختبار | `vitest` / `jsdom` | 3.2.7 / 30.1.3 | MIT |
| الأنواع | `@types/react` / `react-dom` / `node` / `three` / `canvas-confetti` / `d3-array` / `d3-interpolate` / `d3-scale` / `d3-shape` | 19.3.0 … 22.20.5 | MIT |

### 9.3 ملخص الرخص (93 حزمة مباشرة)

| الرخصة | العدد | ملاحظات |
|---|---|---|
| MIT | 54 | الغالبية — بما فيها React وThree.js وreveal.js وVite |
| OFL-1.1 | 29 | كل الخطوط (SIL Open Font License) |
| ISC | 6 | d3 الأربع + canvas-confetti + lucide-react |
| Apache-2.0 | 2 | echarts + typescript |
| GSAP Standard License | 2 | `gsap` و`@gsap/react` — **مجانية للاستخدام** لكنها ليست MIT؛ الاستيراد الوحيد عبر useGSAP |

> **ملاحظتان:** (1) `reveal.js` و`reveal.js-plugins` تُستعملان **مراجع قراءة فقط** — نُقلت نماذجها (Zoom/Notes/chalkboard) يدوياً إلى حزم القالب لتبقى متوافقة RTL ومالكة الكود، لذا لا استيراد مباشر منها في `src/`. (2) لا توجد أي حزمة برخصة مقيدة (GPL/AGPL أو Copyleft) — الشجرة كلها رخص متساهلة.

---

## 10. توصيات للخطوة القادمة (مرتبة بالقيمة)

1. **مؤقت عكسي لكل شريحة** في نافذة المعلم (زمن مخطط لكل شريحة + تحذير تجاوز) — امتداد طبيعي للحزمة 7.
2. **تصدير/استيراد رسومات السبورة** (PNG + localStorage لاستئناف الجلسة) — إكمال الحزمة 5.
3. **وضع البروفة (Rehearsal)**: تسجيل الزمن الفعلي لكل شريحة وعرضه لاحقاً في نافذة المعلم.
4. **تصدير PDF/مطوية (Handout)** من شرائح القالب الحية.
5. **تحكم عن بُعد** (جوال كمقدّم) عبر مزامنة بسيطة — بذرية من بنية نافذة المعلم الجاهزة.
