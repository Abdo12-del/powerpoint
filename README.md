# قالب العرض التقديمي المهيكل — Presentation Template

قالب **فارغ وجاهز للتعبئة** لأي عرض تقديمي (مذكرة، تقرير، دورة، منتج، دراسة حالة)، يعمل في المتصفح ويطبّق [المواصفة القياسية](docs/PRESENTATION_TEMPLATE_SPEC.md):

```
العنوان ─(ابدأ)─▶ المقدمة (3–4 خطوات) ─▶ خريطة الفصول ─▶ الفصول / الشرائح ─▶ الخاتمة
```

- **React 19 + Vite 7 + TypeScript + Tailwind CSS 4** مع `framer-motion` للحركة و`lucide-react` للأيقونات.
- **RTL أصلاً**: واجهة عربية كاملة بخط Cairo افتراضياً، والشفرة/المعرّفات LTR تلقائياً.
- **29 خطاً عربياً مثبتاً دون اتصال** مصنّفة حسب النوع (كوفي، نسخ، رقعة، حديث، مدوّر، زخرفي + لاتيني وكود) مع **10 اقترانات جاهزة** تُبدَّل من سطر واحد في `src/data/typography.ts`، ومختبر حي `/?lab=fonts`، ومكونات حركة نص آمنة للعربية — [الدليل](docs/TYPOGRAPHY.md).
- **الأنماط العشرة** (§5) كمكونات عامة تستقبل بيانات فقط — [المرجع مع مقتطفات الاستعمال](docs/ARCHETYPES.md).
- **خريطة الفصول تُبنى آلياً** من مصفوفة الفصول، مع تمييز الفصل الحالي ونقطة الاستئناف والشرائح المزارة والشرائح الفارغة.
- **عقد التحكم** كاملاً: أسهم / Enter / Space / Esc / M / F، شريط تقدّم، عدّاد «الشريحة 5 / 12»، فأرة ولمس.
- **تحقق آلي** من قائمة Definition of Done (§10): معرفات فريدة ببادئة الفصل، تمهيد/خلاصة لكل فصل، 3–5 فصول، 4–8 شرائح، عناوين ≤ 6 كلمات، وقائمة بالشرائح التي ما تزال فارغة.
- **عدّة حركة كاملة مثبتة مسبقاً** (GSAP، Lottie، confetti، tsParticles، آلة كاتبة، rough-notation، tilt، auto-animate، tw-animate-css) مع مغلّفات جاهزة في `src/components/effects/` — [الكتالوج](docs/ANIMATION_LIBRARIES.md).
- **موجز للوكلاء** في [`AGENTS.md`](AGENTS.md): كل ما يحتاجه وكيل برمجي ليحوّل القالب إلى عرض مكتمل (مذكرة تخرج، تقرير، دورة…).
- **11 مهارة (Agent Skills)** في `.agents/skills/` (مخرج الحركة، GSAP، framer-motion، المعرض، المخططات، Lottie/الوسائط، الطباعة العربية، حركة النص، الخط يُكتب، الأرقام، مراجعة الجودة) + **معرض 42 مكوّناً** مستعاراً من Magic UI وmotion-primitives (MIT) في `src/components/gallery/` + **8 وصفات** جاهزة في `src/recipes/` — [الدليل](docs/ANIMATION_PROJECTS.md).
- **مشاريع حركة الخطوط مثبّتة**: HarfBuzz (wasm كسول) لمؤثر «الخط يُكتب» بمسارات SVG حقيقية للعربية (`CalligraphyText`، 10 خطوط قابلة للرسم)، number-flow للأرقام المتدحرجة (`NumberRoll`)، fitty للعناوين التي تملأ الشاشة (`FitText`)، و5 مكونات نصية جديدة في المعرض — [الدليل](docs/TEXT_ANIMATION_PROJECTS.md).

## ماذا يوجد في القالب الفارغ؟

`src/data/` هي **استمارات** بنصوص نائبة واضحة — لا محتوى حقيقياً:

| الملف | ما يحتويه | ما تفعله |
|---|---|---|
| `src/data/presentation.tsx` | شاشة العنوان (`meta`)، المقدمة (4 خطوات `Placeholder`)، الخاتمة (`final`) | استبدل النصوص والـ `<Placeholder />` |
| `src/data/chapters/ch1.tsx` … `ch3.tsx` | فصل = تمهيد + محوران `placeholder` + خلاصة | املأ العناوين، أضف/احذف محاور، استبدل كل `<Placeholder />` بنمط |
| `src/data/chapters/index.ts` | مصفوفة الفصول | أضف `ch4`/`ch5` إن لزم (الحد 3–5) |

عند التشغيل يظهر العرض كاملاً بشكله النهائي مع كتل «شريحة فارغة — ضع المحتوى هنا» تعدّد الأنماط العشرة، ويطبع التحقق في وحدة تحكم المتصفح قائمة الشرائح المتبقية.

## التشغيل

```bash
npm install
npm run dev        # http://localhost:5173
```

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | خادم التطوير (يطبع تقرير التحقق في وحدة تحكم المتصفح) |
| `npm run build` | فحص الأنواع + بناء الإنتاج في `dist/` |
| `npm run preview` | معاينة البناء |
| `npm test` | 82 اختباراً: التحقق والتدفق وعرض كل شاشة/شريحة والأنماط العشرة والمؤثرات والمعرض والوصفات والخطوط |
| `npm run check` | أنواع + اختبارات + بناء (قبل الدمج) |

## بدء عرض جديد من القالب (الوصفة — §7)

1. **انسخ المستودع** (أو «Use this template» على GitHub) وثبّت الحزم.
2. **استخرج 3–5 أسئلة** يجيب عنها العرض ← كل سؤال فصل: املأ `title`/`subtitle`/`icon` في `chN.tsx` (انسخ `ch3.tsx` لفصل إضافي وغيّر `id` وبادئة معرفات شرائحه).
3. **قسّم كل فصل إلى 4–8 محاور** ← كل محور شريحة؛ انسخ كتلة «المحور»، وحدّث `outline` في `ChapterPreface`.
4. **صنّف كل شريحة** بنمط من العشرة: غيّر `archetype: 'placeholder'` إلى المفتاح المناسب واستبدل `<Placeholder />` بالمكوّن ([المقتطفات](docs/ARCHETYPES.md)).
5. **اكتب الأغلفة**: `id` ببادئة الفصل (`ch2-kpis`)، `title` اسم من 3–6 كلمات، `subtitle` اختياري، `icon` دالة.
6. **املأ الشاشات الثابتة** في `presentation.tsx`: `meta` (شاشة العنوان)، `preface` (سياق ← إشكالية كسؤال واحد ← أهداف ← منهجية)، `final` (3–4 جمل تلخيص + دعوة تأمل + شكر). اختر `meta.background` (خلفية جسيمات) و`final.celebrate` (قصاصات الخاتمة؛ `false` للمناقشات الرسمية).
7. **شغّل `npm run check`** — لا يُعدّ العرض مكتملاً ما دام التحقق يحذّر من `slide.placeholder`.

### الحد الأدنى لشريحة

```tsx
{
  id: 'ch1-profile',
  chapterId: 'ch1',
  title: 'التعريف بالمؤسسة',
  subtitle: 'بطاقة تعريف مؤسسة الدراسة',
  icon: Building2,
  archetype: 'profile',
  content: (
    <ProfileCard
      name="…"
      description="…"
      facts={[{ label: 'التأسيس', value: '2012' }, /* 3–4 حقائق */]}
    />
  ),
}
```

## مكتبات الحركة المثبتة

لا تحتاج إلى تثبيت شيء لبناء عرض غني بالحركة — كل ما يلي في `package.json` وله مغلّف في `src/components/effects/` ([الكتالوج الكامل مع جدول القرار والأمثلة](docs/ANIMATION_LIBRARIES.md)):

| المكتبة | الدور | المغلّف |
|---|---|---|
| `framer-motion` | انتقالات الشاشات، stagger، عدّادات، كشف الكلمات | `Stagger`, `WordReveal`, `motion.*` |
| `gsap` + `@gsap/react` (كل الإضافات: SplitText, Flip, TextPlugin, MotionPath) | تسلسلات زمنية معقّدة داخل الشريحة | `useGSAP`, `GsapReveal`, `splitWords` |
| `canvas-confetti` | احتفال في الخاتمة / إعلان نتيجة | `ConfettiOnMount`, `fireConfetti` — يُفعَّل بـ `final.celebrate` |
| `@tsparticles/react` + `slim` | خلفية نجوم/شبكة/ثلج/فقاعات | `ParticlesBackground` — يُفعَّل بـ `meta.background` |
| `lottie-react` | رسوم Lottie (JSON) دون اتصال | `LottiePlayer` (تحميل كسول) |
| `react-type-animation` | نص يُكتب أمام الجمهور | `Typewriter` |
| `rough-notation` | تحديد/تدوير/تظليل كلمة بخط اليد (RTL) | `Annotate` |
| `react-parallax-tilt` | بطاقة تميل مع المؤشر | `TiltCard` |
| `@formkit/auto-animate` | قوائم تتحرك عند الإضافة/الحذف | `AutoAnimate` |
| `tw-animate-css` | أصناف `animate-in fade-in slide-in-from-bottom-4 …` | مستورد في `index.css` |

```tsx
import { ConfettiOnMount, Typewriter, Annotate, GsapReveal } from '@/components/effects';
```

الثقيل منها (Lottie ≈ 300KB، tsParticles ≈ 80KB) يُحمَّل كسولاً فلا يدخل الحزمة الأساسية إلا عند الاستعمال. القاعدة §9.5 سارية على الجميع: النص العربي يتحرك بالكلمات لا بالحروف.

## المهارات والمعرض والوصفات

| ما هو | أين | الاستعمال |
|---|---|---|
| **مهارات الوكلاء** (8) | `.agents/skills/<name>/SKILL.md` (و`.claude/skills` رابط) | يحمّلها Claude Code / Codex / Cursor / Copilot تلقائياً؛ أو اطلب «اقرأ مهارة presentation-motion-director» |
| **معرض المكونات** (42، MIT) | `src/components/gallery/` | `import { AnimatedBeam, NumberTicker, TextAnimate, TextEffect, TextLoop, MorphingText, Terminal, Marquee, Meteors, Safari } from '@/components/gallery'` |
| **الوصفات** (8) | `src/recipes/` | `import { StatsCountUp, RelationBeams, TimelineDraw, CodeTerminal } from '@/recipes'` — انسخ وعدّل |
| **كتالوج المشاريع** | `docs/ANIMATION_PROJECTS.md` | مشاريع GitHub للاستعارة لاحقاً مع الرخص وملاحظات العربية |

## الخطوط وأنواعها وحركتها

| ما هو | أين | الاستعمال |
|---|---|---|
| **سجل الخطوط** (29: 11 حديث، 3 كوفي، 5 نسخ، 1 رقعة، 3 زخرفي، 3 مدوّر، Inter، 2 كود؛ 17 منها متغيّرة) | `src/fonts/registry.ts` | `FONTS[id]`, `fontStack()`, `ensureFontLoaded()` — تحميل كسول لكل خط |
| **الاقترانات** (10) | `src/fonts/presets.ts` | `default` · `academic` · `modern-tech` · `corporate` · `editorial` · `heritage` · `kufi-bold` · `friendly` · `geometric` · `maghrebi` |
| **إعداد العرض** | `src/data/typography.ts` | `{ preset: 'academic', display: 'katibeh', latin: 'inter', scale: 1.05 }` — الأدوار: heading (h1–h3) / body / display (`font-display`) / mono |
| **حركة النص** | `src/components/typography/` | `KineticHeadline`, `VariableText` (محاور wght/wdth/slnt/HEXP), `ClipReveal`, `HighlightSweep`, `FancyText`, `FontSpecimen`, **`CalligraphyText`** (الخط يُكتب — HarfBuzz)، **`NumberRoll`** (number-flow)، **`FitText`** (fitty) |
| **مشاريع حركة الخطوط** | `src/lib/text-shaper.ts`, `src/fonts/calligraphy.ts` + `@/components/gallery` | HarfBuzz wasm كسول (≈430KB خارج الحزمة الأساسية)، 10 خطوط قابلة للرسم، و`TextEffect`/`TextLoop`/`TextShimmer`/`MorphingText`/`LineShadowText` — [`docs/TEXT_ANIMATION_PROJECTS.md`](docs/TEXT_ANIMATION_PROJECTS.md) + مهارات `kinetic-typography`, `calligraphy-draw-on`, `numbers-and-counters` |
| **المختبر** | `/?lab=fonts` | الكتالوج حسب النوع + الاقترانات مع تطبيق حي + عروض الحركة (كسول، خارج حزمة العرض) |
| **الدليل والقواعد** | `docs/TYPOGRAPHY.md` + مهارة `arabic-typography-motion` | لا `letter-spacing`/مائل اصطناعي على العربية، حركة بالكلمات والمحاور فقط، أحجام وارتفاعات السطر |

## التحكم أثناء العرض

| المفتاح | الفعل |
|---|---|
| `→` / `Enter` / `Space` | الشريحة التالية |
| `←` | الشريحة السابقة |
| `↓` / `M` / `Esc` | خريطة الفصول (ومن الخريطة `Esc` يعود إلى شاشة العنوان) |
| `F` | ملء الشاشة |
| `?` / `H` | نافذة الاختصارات |

الأحرف العربية المقابلة على نفس المفاتيح مدعومة (`ة` للخريطة، `ب` لملء الشاشة). السحب يميناً/يساراً على اللمس ينقل بين الشرائح. كل المفاتيح في `src/config/controls.ts`.

## بنية المشروع

```
src/
├── types/presentation.ts        # العقود: PresentationData, ChapterData, SlideData, PrefaceStep, FinalData
├── data/                        # ← الاستمارات التي تُملأ لكل عرض (فارغة افتراضياً)
│   ├── presentation.tsx         #    شاشة العنوان + المقدمة + الخاتمة
│   ├── typography.ts            #    اقتران الخطوط للعرض (preset + تجاوزات)
│   └── chapters/ch1..ch3.tsx    #    الفصول والشرائح
├── fonts/                       # سجل 29 خطاً (registry.ts) + 10 اقترانات (presets.ts) + applyTypography (apply.ts)
├── components/
│   ├── Presentation.tsx         # يربط آلة الحالة بالشاشات والتحكم
│   ├── screens/                 # الشاشات الخمس: Title, Preface, Map, Slide, Final
│   ├── archetypes/              # الأنماط العشرة + ChapterPreface + ChapterSummary
│   ├── chrome/                  # ProgressBar, ControlBar, SlideHeader, KeyboardHelp
│   ├── ui/                      # Card, Badge/Num/Term, WordReveal (بالكلمات لا بالحروف), Stagger, Placeholder
│   ├── effects/                 # مغلّفات مكتبات الحركة: Confetti, ParticlesBackground, LottiePlayer, Typewriter, Annotate, TiltCard, GsapReveal, AutoAnimate
│   ├── typography/              # حركة النص العربي: KineticHeadline, VariableText, ClipReveal, HighlightSweep, FancyText, FontSpecimen + FontLab (?lab=fonts)
│   └── gallery/                 # 42 مكوّناً مستعاراً (Magic UI + motion-primitives, MIT) + UPSTREAM.md + LICENSES/
├── recipes/                     # 8 وصفات جاهزة لأنماط الشرائح (تُنسخ إلى content)
├── styles/gallery.css           # إطارات الحركة (@keyframes) لمكونات المعرض
├── hooks/                       # usePresentation (التدفق), useKeyboardControls, useFullscreen, useSwipe
├── lib/                         # navigation.ts, validate.ts (Definition of Done), gsap.ts (GSAP مُهيّأ + splitWords), motion-prefs.ts, cn.ts (clsx + tailwind-merge)
├── config/controls.ts           # خريطة المفاتيح
└── __tests__/                   # validate, navigation, render, archetypes, effects, gallery, recipes, typography
.agents/skills/                   # 11 مهارة (Agent Skills) — .claude/skills رابط رمزي إليها
docs/
├── PRESENTATION_TEMPLATE_SPEC.md # المواصفة الكاملة (البنية، التدفق، الأنماط، الوصفة، القواعد)
├── ARCHETYPES.md                 # مرجع خصائص المكونات + مقتطف استعمال لكل نمط
├── ANIMATION_LIBRARIES.md        # كتالوج مكتبات الحركة: جدول القرار + مثال لكل مكتبة
├── ANIMATION_PROJECTS.md         # المهارات + المعرض + الوصفات + كتالوج مشاريع GitHub
├── TYPOGRAPHY.md                 # الخطوط حسب النوع + الاقترانات + قواعد الطباعة العربية + حركة النص
└── TEXT_ANIMATION_PROJECTS.md    # مشاريع حركة الخطوط المثبّتة (HarfBuzz, number-flow, fitty) + المكونات النصية + ما رُفض
AGENTS.md                         # موجز لأي وكيل برمجي يُطلب منه إنتاج عرض من هذا القالب
```

## قواعد لا تُكسر (§9)

- فكرة واحدة لكل شريحة؛ العنوان اسم لا جملة (≤ 6 كلمات).
- الأرقام والمصطلحات تُبرز بـ `<Num>` / `<Term>` / `<Badge>` لا في نص سائب.
- النص العربي لا يُقسَّم إلى حروف في أي حركة — `WordReveal` يقسّم بالكلمات فقط؛ ولا `letter-spacing` ولا مائل اصطناعي على العربية.
- معرفات الشرائح فريدة وببادئة الفصل؛ الخريطة والتنقل يعتمدان عليها.
- الخاتمة تلخّص ولا تُدخل معلومة جديدة.
