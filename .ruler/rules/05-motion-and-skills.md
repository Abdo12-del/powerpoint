# الحركة والمهارات المتخصصة

الحركة والمؤثرات مسموحة حين تخدم الرسالة، لكنها لا تحل محل التنوع البصري الموضح في `02-visual-design.md`. الأساس الحركي يعمل تلقائياً؛ أضف مؤثراً مهيمناً واحداً على الأكثر لكل شريحة عند الحاجة، واحترم `prefers-reduced-motion`.

قبل تنفيذ مهمة متخصصة، اقرأ ملف `SKILL.md` المناسب مباشرة من `.agents/skills/` (والرابط `.claude/skills/` يشير إلى المسار نفسه):

| المهارة | اقرأها عندما… |
|---|---|
| `presentation-motion-director` | تختار مؤثراً لشريحة أو يُطلب تحسين الحركة. |
| `gallery-components` | تحتاج عنصراً بصرياً جاهزاً أو تستعير مكوناً من Magic UI/motion-primitives. |
| `framer-motion-recipes` | تضيف دخولاً/خروجاً أو stagger أو layout أو pathLength. |
| `gsap-react-timelines` | تحتاج تسلسلاً زمنياً دقيقاً أو SplitText أو Flip أو مساراً. |
| `svg-diagram-animation` | تبني مخطط علاقات أو سير إجراء أو خطاً زمنياً أو شجرة. |
| `lottie-and-media` | تستخدم Lottie أو لقطات شاشة أو فيديو أو إطارات أجهزة. |
| `arabic-typography-motion` | تختار خطاً/اقتراناً أو تحرّك عنواناً عربياً أو تصلح تشكّل الحروف. |
| `kinetic-typography` | تحرّك نصاً أو عنواناً، تبدّل الكلمات، أو تستخدم لمعة/تحولاً/عنواناً يملأ الشاشة. |
| `calligraphy-draw-on` | تجعل البسملة/عنواناً/اقتباساً قصيراً يُكتب بالقلم أو تحوّل النص إلى مسارات. |
| `numbers-and-counters` | تعرض KPI أو نسبة أو عداداً متحركاً أو رقماً في RTL. |
| `data-charts-motion` | تختار أو تحرك رسماً بيانياً أو تصلح انعكاسه في RTL. |
| `cinematic-flyover` | تبني عرضاً سينمائياً ثلاثي الأبعاد أو تلتقط الصفحة بـPlaywright أو تضبط مسار كاميرا/عمق ميدان. |
| `motion-showreel` | يُطلب شورييل موشن جرافيك أو انتقالات Slide/Zoom أو تزامن BPM. |
| `cinematic-effects` | يُطلب مشهد Three.js أو Glitch/RGB/Grain أو انتقالات سينمائية أو Lenis. |
| `distilbook-motion` | تبني شورييل قصصياً لمنصة/منتج أو موشن بحثياً وشبكة استشهادات. |
| `chalkboard-annotation` | يُطلب رسم/كتابة حرة أو سبورة مستقلة أثناء العرض. |
| `zoom-spotlight` | يُطلب تكبير جزء من الشريحة أو ليزر أو تسليط ضوء. |
| `presenter-notes` | تُطلب ملاحظات متحدث أو نافذة معلم أو مؤقت وعرض مباشر. |
| `animation-qa` | قبل التسليم أو عند حركة بطيئة/متقطعة. |
| `thesis-presentation-routing` | تحوّل مذكرة تخرج/مشروعاً تطبيقياً إلى عرض وتختار المنهج حسب التخصص والدراسة. |

مراجع التنفيذ: `docs/ANIMATION_LIBRARIES.md`، `docs/ANIMATION_PROJECTS.md`، `docs/TYPOGRAPHY.md`، `docs/TEXT_ANIMATION_PROJECTS.md`، `docs/CINEMATIC_FLYOVER.md` و`docs/CHARTS.md`. استخدم الوحدات المشتركة في `src/components/` و`src/recipes/`. لا تفصل الحروف العربية؛ الحركة بالكلمات أو الأسطر فقط، ولا تستخدم `tracking-*` أو `italic` على النص العربي.
