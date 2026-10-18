---
name: presentation-motion-director
description: Plan and apply motion/animation for a presentation built from this template (title, preface, map, slides, final). Use when asked to design, improve, polish, or "make more animated" any slide or screen, or to choose which animation library/effect fits a slide. Arabic-first (RTL) rules — words never letters — and a one-dominant-effect-per-slide discipline. تخطيط حركة العرض التقديمي واختيار المؤثر المناسب لكل شريحة.
metadata:
  short-description: مخرج الحركة — أي مؤثر لأي شريحة ولماذا
---

# مخرج الحركة (Presentation Motion Director)

أنت تعمل داخل قالب عرض تقديمي عربي (React + framer-motion + مكتبات إضافية مثبتة). هذه المهارة تجيب عن سؤال واحد: **ما الحركة المناسبة لهذه الشريحة، وكيف أطبّقها دون كسر القواعد؟**

## قبل أي شيء: ما الموجود جاهزاً

| الطبقة | المسار | متى |
|---|---|---|
| الأساس (يعمل تلقائياً) | `src/components/ui/motion.ts`, `Stagger`, `WordReveal`, `Card` | كل شريحة — لا تُعد كتابته |
| مغلّفات المكتبات | `src/components/effects/` (`Typewriter`, `Annotate`, `GsapReveal`, `TiltCard`, `LottiePlayer`, `ParticlesBackground`, `ConfettiOnMount`, `AutoAnimate`) | مؤثر مهيمن واحد عند الحاجة |
| معرض المكونات المستعارة | `src/components/gallery/` (Magic UI + motion-primitives: `AnimatedBeam`, `NumberTicker`, `TextAnimate`, `OrbitingCircles`, `Terminal`, `Marquee`, `BorderBeam`…) | عناصر بصرية جاهزة لأنماط محددة |
| GSAP مُهيّأ | `src/lib/gsap.ts` (`useGSAP`, `splitWords`, Flip, MotionPath, TextPlugin) | تسلسل زمني معقّد داخل الشريحة |
| وصفات مُختبَرة | `src/recipes/` | انسخ وعدّل — كل وصفة تمرّ في `npm run check` |

الكتالوج: `docs/ANIMATION_LIBRARIES.md` و`docs/ANIMATION_PROJECTS.md`.

## القواعد غير القابلة للتفاوض

1. **مؤثر مهيمن واحد لكل شريحة.** الحركة الأساسية (دخول الشاشة + stagger) موجودة دائماً؛ أضف فوقها مؤثراً واحداً يخدم الفكرة، لا أكثر.
2. **النص العربي يتحرك بالكلمات أو الأسطر — لا بالحروف.** `WordReveal`, `splitWords`, `TextAnimate by="word"`. ممنوع: `SplitText type:'chars'`, `by="character"`, HyperText/FlipText/Scramble. (TextAnimate يحمي العربية تلقائياً، لكن لا تعتمد على ذلك.)
3. **الحركة تخدم القراءة:** الترتيب الزمني = ترتيب القراءة (يمين ← يسار، أعلى ← أسفل في RTL). الإزاحات الأفقية تُعكس: «من اليمين» = `x: 24` موجب في RTL.
4. **المدة:** دخول عنصر 0.4–0.7 ث؛ stagger 0.06–0.12 ث؛ الشريحة كاملة تستقر خلال ≤ 1.5 ث (المُقدِّم يتكلم فوراً). المؤثرات المستمرة (جسيمات، marquee، orbit) هادئة وبطيئة.
5. **الخلفيات بلا تفاعل** (`pointer-events-none`) وتباين النص محفوظ فوقها.
6. **احترام `prefers-reduced-motion`** — المغلّفات تفعل؛ في الحركة اليدوية استعمل `prefersReducedMotion()` أو `useReducedMotion()`.
7. **لا تعدّل المكونات الأساسية** (`screens/`, `archetypes/`, `hooks/`) لإضافة حركة لشريحة واحدة — ضع الحركة في `content` الشريحة داخل `src/data/`.
8. **الأداء:** حرّك `transform` و`opacity` فقط؛ لا `width/height/top/left`؛ لا أكثر من خلفية canvas واحدة في الشاشة.

## جدول القرار: الشاشة/النمط ← المؤثر المهيمن المقترح

| الشاشة / النمط | الحركة الأساسية (موجودة) | مؤثر مهيمن مقترح (اختر واحداً) |
|---|---|---|
| **العنوان** | WordReveal للعنوان + stagger | `meta.background: 'stars'` (جسيمات) **أو** `<Meteors/>`/`<DotPattern/>` خلفية، أو `TextAnimate animation="blurInUp"` للعنوان |
| **المقدمة** (سياق/إشكالية/أهداف/منهجية) | stagger الخطوات | الإشكالية: `<Typewriter>` للسؤال **أو** `<Annotate type="circle">` على الكلمة المفتاحية |
| **الخريطة** | stagger البطاقات | لا شيء إضافي (الخريطة أداة تنقّل) — أقصى حد `TiltCard` |
| **تمهيد الفصل** | WordReveal + outline | `GsapReveal` للمخطط، أو `<ParticlesBackground preset="network" density={0.5}>` خلف التمهيد |
| profile (بطاقة تعريف) | stagger الحقائق | `BorderBeam`/`ShineBorder` حول البطاقة، أو `TiltCard` |
| bullets (نقاط) | stagger | `AnimatedList` (ظهور متتابع) أو `BlurFade` لكل نقطة |
| timeline (خط زمني) | stagger المحطات | رسم الخط بـ `pathLength` (framer) + ظهور المحطات بعده — وصفة `TimelineDraw` |
| tree (هيكل شجري) | stagger المستويات | `AnimatedBeam` بين العقد **أو** `OrbitingCircles` للأنظمة الدائرية |
| comparison (مقارنة) | عمودان متقابلان | `ImageComparison` للصور قبل/بعد، أو `TransitionPanel` للتبديل |
| process (سير إجراء) | stagger الخطوات مع الأسهم | `AnimatedBeam` متسلسل بين الخطوات، أو `GsapReveal` بمحور x |
| table (جدول) | stagger الصفوف | `Annotate type="highlight"` على الخلية الحاسمة فقط |
| relation (مخطط علائقي) | stagger العقد | `AnimatedBeam` (أشعة بين المكونات) — وصفة `RelationBeams` |
| code (كود) | ظهور الكتلة | `Terminal` + `TypingAnimation` لسطرين–أربعة أسطر **أو** `CodeBlock` ثابت + `Annotate` |
| stats (إحصائيات) | عدّادات | `NumberTicker` + `AnimatedCircularProgressBar` — وصفة `StatsCountUp` |
| **خلاصة الفصل** | stagger النقاط | لا شيء إضافي |
| **الخاتمة** | WordReveal + stagger | `final.celebrate: true` (قصاصات) — `false` للمناقشات الرسمية |

## سير العمل

1. **اقرأ الشريحة كفكرة**: ما العنصر الذي يجب أن يتذكره الجمهور؟ الحركة تُوجَّه إليه فقط.
2. **اختر من الجدول** مؤثراً واحداً. إن لم يُضف معنى → لا تضف شيئاً.
3. **نفّذ داخل `content`** في `src/data/chapters/chN.tsx` (أو انسخ وصفة من `src/recipes/`).
4. **اضبط التوقيت** حسب القاعدة 4. تأكّد أن `delay` المؤثر يأتي بعد استقرار الحركة الأساسية (≈ 0.4–0.8 ث).
5. **راجع**: `npm run check` ثم قائمة `animation-qa`.

## نماذج قرار سريعة

- «اجعل شريحة النتائج مبهرة» → `StatsCountUp` (NumberTicker + حلقة تقدم) — وليس قصاصات.
- «أبرز الإشكالية» → `Typewriter` للسؤال + `Annotate circle` على كلمة واحدة بعد انتهاء الكتابة (`delay` ≥ مدة الكتابة).
- «شريحة الفريق» → `AvatarCircles` أو بطاقات مع `TiltCard`؛ لا جسيمات.
- «المعمارية التقنية» → `RelationBeams`؛ إذا كانت دائرية (نظام ومكوناته) → `OrbitingCircles`.
- «عرض تطبيق جوّال/ويب» → `Iphone`/`Safari` مع لقطة شاشة + `BlurFade`.
- «قبل/بعد التحسين» → `ImageComparison` للصور؛ للأرقام → `Comparison` + `NumberTicker`.

## المراجع داخل المهارة
- `references/choreography.md` — ستوريبورد زمني لكل شاشة (ماذا يظهر في أي ثانية) ورموز التوقيت.
