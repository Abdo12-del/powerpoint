# مشاريع ومهارات تحسين الحركة (Animation Projects & Skills)

هذا الملف يكمّل [`ANIMATION_LIBRARIES.md`](ANIMATION_LIBRARIES.md) (المكتبات المثبتة). هنا ثلاثة أشياء إضافية جاهزة في المستودع:

1. **المهارات** (`.agents/skills/`) — معرفة إجرائية يقرأها أي وكيل عند الحاجة.
2. **معرض المكونات المستعارة** (`src/components/gallery/`) — 37 مكوّناً من مشاريع مفتوحة MIT مُكيَّفة ومُختبَرة.
3. **الوصفات** (`src/recipes/`) — 8 تركيبات جاهزة لأنماط الشرائح.

وفي الأخير كتالوج **مشاريع GitHub** يمكن الاستعارة منها لاحقاً مع ملاحظات الرخصة والعربية.

---

## 1. المهارات (Agent Skills)

بصيغة [Agent Skills المفتوحة](https://agentskills.io) (`SKILL.md` + مراجع). المسار القياسي `.agents/skills/` تقرأه Codex وCursor وCopilot وGemini CLI وOpenCode وغيرها، و`.claude/skills` رابط رمزي إليه لـ Claude Code.

| المهارة | متى تُستدعى | ما تقدّمه |
|---|---|---|
| `presentation-motion-director` | «حسّن الحركة»، «اجعل الشريحة أجمل»، اختيار مؤثر | جدول الشاشة/النمط ← المؤثر، القواعد، ميزانية الحركة، ستوريبورد زمني (`references/choreography.md`) |
| `gsap-react-timelines` | تسلسل زمني دقيق، مسار، Flip، SplitText | نمط `useGSAP` القياسي، 6 وصفات، قواعد RTL والتنظيف |
| `framer-motion-recipes` | دخول/خروج، stagger، layout، pathLength | 10 وصفات بالرموز المشتركة في `ui/motion.ts` |
| `gallery-components` | «استعمل Magic UI»، عنصر بصري جاهز، استعارة مكوّن جديد | دليل الشريحة ← المكوّن، القيود، خطوات الاستعارة، المهارة الرسمية لـ Magic UI كمرجع |
| `svg-diagram-animation` | مخططات، روابط، خط زمني، شجرة | `AnimatedBeam`، `pathLength`، نبض على الروابط، ترتيب القراءة RTL |
| `lottie-and-media` | رسوم Lottie، لقطات شاشة، فيديو، إطارات أجهزة | أين توضع الملفات، اختيار Lottie، بدائل dotLottie/Rive، الصور والفيديو |
| `arabic-typography-motion` | «غيّر الخط»، اختيار خط لطابع العرض، تحريك عنوان/كلمة، حروف عربية منفصلة | جدول الطابع ← الاقتران، أنواع الخط العربي ومتى يصلح كلٌّ، قواعد لا تُكسر، مقتطفات `@/components/typography`، أعطال وإصلاحها (`docs/TYPOGRAPHY.md`) |
| `animation-qa` | مراجعة نهائية، «الحركة بطيئة/متقطعة» | فحوص آلية + 12 بنداً لكل شريحة + إصلاحات شائعة |

إذا كان وكيلك لا يكتشف المهارات تلقائياً: اطلب منه صراحة «اقرأ `.agents/skills/<name>/SKILL.md`» — أو انظر `AGENTS.md` الذي يشير إليها.

## 2. معرض المكونات المستعارة (`src/components/gallery/`)

```tsx
import { AnimatedBeam, NumberTicker, TextAnimate, WordRotate, BlurFade, OrbitingCircles, AnimatedList, Marquee,
         Terminal, TypingAnimation, BorderBeam, ShineBorder, MagicCard, NeonGradientCard, GlowEffect, ShimmerButton,
         Meteors, Ripple, DotPattern, GridPattern, AnimatedGridPattern, FlickeringGrid, WarpBackground,
         Safari, Iphone, AvatarCircles, ImageComparison, TransitionPanel, AnimatedCircularProgressBar,
         AnimatedShinyText, AnimatedGradientText, AuroraText, SparklesText } from '@/components/gallery';
```

| العائلة | المكونات | المصدر |
|---|---|---|
| نصوص | `TextAnimate` (كلمات/أسطر؛ يمنع تفكيك العربية)، `WordRotate`، `BlurFade`، `AnimatedShinyText`، `AnimatedGradientText`، `AuroraText`، `SparklesText` | Magic UI |
| أرقام | `NumberTicker`، `AnimatedCircularProgressBar` | Magic UI |
| مخططات | `AnimatedBeam`، `OrbitingCircles`، `AnimatedList`، `Marquee`، `TransitionPanel`، `ImageComparison` | Magic UI / motion-primitives |
| بطاقات | `BorderBeam`، `ShineBorder`، `MagicCard`، `NeonGradientCard`، `GlowEffect`، `ShimmerButton` | Magic UI / motion-primitives |
| خلفيات | `Meteors`، `Ripple`، `DotPattern`، `GridPattern`، `AnimatedGridPattern`، `FlickeringGrid`، `WarpBackground` | Magic UI |
| كود/أجهزة/أشخاص | `Terminal` + `TypingAnimation` + `AnimatedSpan`، `Safari`، `Iphone`، `AvatarCircles` | Magic UI |

- المصدر والالتزام والرخصة والتعديلات لكل ملف: [`src/components/gallery/UPSTREAM.md`](../src/components/gallery/UPSTREAM.md).
- إطارات الحركة (`@keyframes`) في `src/styles/gallery.css`.
- اختبار عرض لكل مكوّن في `src/__tests__/gallery.test.tsx`.

## 3. الوصفات (`src/recipes/`)

| الوصفة | النمط | التركيبة |
|---|---|---|
| `StatsCountUp` | stats | `NumberTicker` + `AnimatedCircularProgressBar` + `BlurFade` |
| `RelationBeams` | relation / process | عقد بأيقونات + `AnimatedBeam` بتأخير تراكمي |
| `TitleHero` | العنوان / تمهيد فصل | `DotPattern` + `TextAnimate blurInUp` + `WordRotate` + `ShimmerButton` |
| `CodeTerminal` | code | `Terminal` + `TypingAnimation` + `AnimatedSpan` (LTR) |
| `TimelineDraw` | timeline | خط SVG يُرسم يميناً ← يساراً (`pathLength`) + محطات بنابض |
| `EcosystemOrbit` | tree / relation دائري | مركز + حلقتا `OrbitingCircles` |
| `GsapTitleTimeline` | أي شريحة تحتاج تسلسلاً | `useGSAP` + `splitWords` + خط + عناصر + شارة |
| `BeforeAfterCompare` | comparison (صور) | `ImageComparison` + تسميتان |

كل وصفة تقبل بيانات عبر props (لا محتوى مضمّناً) وتمرّ في `npm run check` (`src/__tests__/recipes.test.tsx`). انسخها إلى `content` الشريحة أو استوردها مباشرة من `@/recipes`.

---

## 4. كتالوج مشاريع GitHub للاستعارة (غير مثبتة — مرجع)

الأرقام من GitHub API بتاريخ 2026-10-18. **MIT** = يمكن نسخ الكود مع الإبقاء على الرخصة. راجع عمود «العربية» قبل الاستعارة.

### مجموعات مكونات متحركة (انسخ ملفاً وكيّفه كما في `UPSTREAM.md`)

| المشروع | ⭐ | الرخصة | ما يستحق الاستعارة | العربية/RTL |
|---|---|---|---|---|
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | 22.7k | MIT | 80+ مكوّناً (استعرنا 29). متبقٍ مفيد: `globe` (+cobe)، `file-tree`، `arc-timeline`، `bento-grid`، `lens`، `pixel-image`، `light-rays` | تجنّب `hyper-text`/`flip-text`/`morphing-text`/`spinning-text` |
| [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | 6.7k | MIT | `morphing-dialog` (تكبير صورة)، `sliding-number`، `animated-number`، `text-loop`، `in-view`، `spotlight`، `border-trail`، `magnetic`، `progressive-blur`، `carousel` | تجنّب `text-morph`/`text-roll`/`text-scramble` |
| [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | 49.6k | MIT + Commons Clause | خلفيات مذهلة (Aurora, Silk, Beams, Threads, Dither)، `CountUp`، `SpotlightCard`، `TiltedCard`، `Stepper`، `Carousel` | رخصة خاصة (لا بيع المكوّن ذاته) — مقبولة للعروض؛ تجنّب مكونات الحروف (`SplitText`, `BlurText` بالحروف، `DecryptedText`) |
| [codse/animata](https://github.com/codse/animata) | 3.0k | MIT | بطاقات وأزرار ورسوم بيانية صغيرة (`bar-chart`, `progress`), `typing-text` | معظمها آمن؛ افحص `text` قبل النسخ |
| [Aceternity UI](https://ui.aceternity.com) | — | مجاني (بدون مستودع كامل) | `background-beams`, `sparkles`, `lamp`, `tracing-beam`, `card-stack` | انسخ من الموقع؛ `text-generate-effect` بالكلمات (آمن) |
| [uiverse.io](https://github.com/uiverse-io/galaxy) | — | MIT | أزرار/بطاقات CSS خالصة | آمن |

### محركات ومكتبات بديلة (ثبّت عند الحاجة فقط)

| المشروع | ⭐ | الرخصة | متى |
|---|---|---|---|
| [motiondivision/motion](https://github.com/motiondivision/motion) | 34.3k | MIT | هي نفسها framer-motion 12 (`motion/react`) — لا داعي لتثبيتها |
| [greensock/GSAP](https://github.com/greensock/GSAP) | 29.4k | Standard (مجانية كلياً) | مثبتة؛ إضافات إضافية: `DrawSVGPlugin`, `MorphSVGPlugin`, `ScrambleTextPlugin` (الأخيرة ليست للعربية) |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) | 73.7k | MIT | anime.js v4 — خفيفة، timelines وstagger شبكي؛ بديل GSAP إن لزم |
| [pmndrs/react-spring](https://github.com/pmndrs/react-spring) | 29.2k | MIT | فيزياء نوابض؛ `useTrail` للقوائم |
| [barvian/number-flow](https://github.com/barvian/number-flow) | 7.8k | MIT | `@number-flow/react` — أرقام تتدحرج بأناقة (بديل NumberTicker) |
| [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) | 9.0k | MIT | مثبتة؛ إعدادات مسبقة إضافية: `@tsparticles/preset-*` (confetti, fireworks, links, sea-anemone) |
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | 32.2k | MIT | مثبتة عبر lottie-react |
| [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) | 0.9k | MIT | `.lottie` مضغوط + WASM أسرع: `@lottiefiles/dotlottie-react` |
| [rive-app/rive-react](https://github.com/rive-app/rive-react) | 1.2k | MIT | رسوم تفاعلية بآلة حالة (`@rive-app/react-canvas`) |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | 33.1k | MIT | مشاهد 3D (+`drei`) — ثقيل؛ لشريحة واحدة استثنائية |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | 12.8k | Apache-2.0 | محرر حركة زمني بواجهة — لتصميم تسلسل معقّد ثم تصديره |
| [formkit/auto-animate](https://github.com/formkit/auto-animate) | 13.9k | MIT | مثبتة |
| [rough-stuff/rough-notation](https://github.com/rough-stuff/rough-notation) | 9.7k | MIT | مثبتة |
| [catdad/canvas-confetti](https://github.com/catdad/canvas-confetti) | 12.8k | ISC | مثبتة |
| [Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | 0.8k | MIT | مثبتة (بديل animate.css المتوافق مع Tailwind 4؛ animate.css نفسها برخصة Hippocratic غير OSI) |

### أطر عروض للاستلهام (ليست للتثبيت هنا)

| المشروع | ⭐ | ما نستلهمه |
|---|---|---|
| [hakimel/reveal.js](https://github.com/hakimel/reveal.js) | 72.4k | `auto-animate` بين شريحتين (مطابقة العناصر بالـ id — عندنا `layoutId`)، fragments (كشف تدريجي) |
| [slidevjs/slidev](https://github.com/slidevjs/slidev) | 49.1k | `v-click`/`v-motion` (كشف بالنقر داخل الشريحة)، انتقالات `slide-left`/`fade-out` |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | 64.9k | تحويل العرض إلى فيديو برمجياً إذا طُلب تسجيل |

### مهارات خارجية ذات صلة

| المصدر | ما فيه |
|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | `frontend-design` (جماليات واجهات متميّزة)، `canvas-design`، `algorithmic-art` (p5.js)، `pptx` (ملفات PowerPoint فعلية إن طُلب تصدير) |
| [magicuidesign/magicui/skills](https://github.com/magicuidesign/magicui/tree/main/skills) | المهارة الرسمية لـ Magic UI (نسخة في `gallery-components/references/`) |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | `npx skills add <repo>` لتثبيت مهارات من أي مستودع في المسارات الصحيحة لكل وكيل |

---

## كيف تضيف مشروعاً/مكوّناً جديداً إلى المستودع

1. تحقق من الرخصة (MIT/ISC/Apache مقبولة؛ Commons Clause مقبولة للاستعمال لا لإعادة البيع؛ GPL لا).
2. انسخ الملف إلى `src/components/gallery/` وطبّق التكييف القياسي (مهارة `gallery-components`، القسم «استعارة مكوّن جديد»).
3. افحص العربية: لا تفكيك حروف، `dir="ltr"` حيث تلزم الإحداثيات.
4. سجّل المصدر في `UPSTREAM.md` وأضف اختبار عرض.
5. `npm run check`.
