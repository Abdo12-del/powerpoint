# قالب العرض التقديمي المهيكل — Presentation Template

قالب **فارغ وجاهز للتعبئة** لأي عرض تقديمي (مذكرة، تقرير، دورة، منتج، دراسة حالة)، يعمل في المتصفح ويطبّق [المواصفة القياسية](docs/PRESENTATION_TEMPLATE_SPEC.md):

```
العنوان ─(ابدأ)─▶ المقدمة (3–4 خطوات) ─▶ خريطة الفصول ─▶ الفصول / الشرائح ─▶ الخاتمة
```

- **React 19 + Vite 7 + TypeScript + Tailwind CSS 4** مع `framer-motion` للحركة و`lucide-react` للأيقونات.
- **RTL أصلاً**: واجهة عربية كاملة بخط Cairo (مُضمَّن محلياً)، والشفرة/المعرّفات LTR تلقائياً.
- **الأنماط العشرة** (§5) كمكونات عامة تستقبل بيانات فقط — [المرجع مع مقتطفات الاستعمال](docs/ARCHETYPES.md).
- **خريطة الفصول تُبنى آلياً** من مصفوفة الفصول، مع تمييز الفصل الحالي ونقطة الاستئناف والشرائح المزارة والشرائح الفارغة.
- **عقد التحكم** كاملاً: أسهم / Enter / Space / Esc / M / F، شريط تقدّم، عدّاد «الشريحة 5 / 12»، فأرة ولمس.
- **تحقق آلي** من قائمة Definition of Done (§10): معرفات فريدة ببادئة الفصل، تمهيد/خلاصة لكل فصل، 3–5 فصول، 4–8 شرائح، عناوين ≤ 6 كلمات، وقائمة بالشرائح التي ما تزال فارغة.
- **عدّة حركة كاملة مثبتة مسبقاً** (GSAP، Lottie، confetti، tsParticles، آلة كاتبة، rough-notation، tilt، auto-animate، tw-animate-css) مع مغلّفات جاهزة في `src/components/effects/` — [الكتالوج](docs/ANIMATION_LIBRARIES.md).
- **موجز للوكلاء** في [`AGENTS.md`](AGENTS.md): كل ما يحتاجه وكيل برمجي ليحوّل القالب إلى عرض مكتمل (مذكرة تخرج، تقرير، دورة…).

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
| `npm test` | اختبارات التحقق والتدفق وعرض كل شاشة/شريحة والأنماط العشرة |
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
│   └── chapters/ch1..ch3.tsx    #    الفصول والشرائح
├── components/
│   ├── Presentation.tsx         # يربط آلة الحالة بالشاشات والتحكم
│   ├── screens/                 # الشاشات الخمس: Title, Preface, Map, Slide, Final
│   ├── archetypes/              # الأنماط العشرة + ChapterPreface + ChapterSummary
│   ├── chrome/                  # ProgressBar, ControlBar, SlideHeader, KeyboardHelp
│   ├── ui/                      # Card, Badge/Num/Term, WordReveal (بالكلمات لا بالحروف), Stagger, Placeholder
│   └── effects/                 # مغلّفات مكتبات الحركة: Confetti, ParticlesBackground, LottiePlayer, Typewriter, Annotate, TiltCard, GsapReveal, AutoAnimate
├── hooks/                       # usePresentation (التدفق), useKeyboardControls, useFullscreen, useSwipe
├── lib/                         # navigation.ts, validate.ts (Definition of Done), gsap.ts (GSAP مُهيّأ + splitWords), motion-prefs.ts
├── config/controls.ts           # خريطة المفاتيح
└── __tests__/                   # validate, navigation, render, archetypes, effects
docs/
├── PRESENTATION_TEMPLATE_SPEC.md # المواصفة الكاملة (البنية، التدفق، الأنماط، الوصفة، القواعد)
├── ARCHETYPES.md                 # مرجع خصائص المكونات + مقتطف استعمال لكل نمط
└── ANIMATION_LIBRARIES.md        # كتالوج مكتبات الحركة: جدول القرار + مثال لكل مكتبة
AGENTS.md                         # موجز لأي وكيل برمجي يُطلب منه إنتاج عرض من هذا القالب
```

## قواعد لا تُكسر (§9)

- فكرة واحدة لكل شريحة؛ العنوان اسم لا جملة (≤ 6 كلمات).
- الأرقام والمصطلحات تُبرز بـ `<Num>` / `<Term>` / `<Badge>` لا في نص سائب.
- النص العربي لا يُقسَّم إلى حروف في أي حركة — `WordReveal` يقسّم بالكلمات فقط.
- معرفات الشرائح فريدة وببادئة الفصل؛ الخريطة والتنقل يعتمدان عليها.
- الخاتمة تلخّص ولا تُدخل معلومة جديدة.
