# قالب العرض التقديمي المهيكل — Presentation Template

قالب عرض تقديمي يعمل في المتصفح يطبّق [المواصفة القياسية للعرض التقديمي](docs/PRESENTATION_TEMPLATE_SPEC.md):

```
العنوان ─(ابدأ)─▶ المقدمة (3–4 خطوات) ─▶ خريطة الفصول ─▶ الفصول / الشرائح ─▶ الخاتمة
```

- **React 19 + Vite 7 + TypeScript + Tailwind CSS 4** مع `framer-motion` للحركة و`lucide-react` للأيقونات.
- **RTL أصلاً**: واجهة عربية كاملة بخط Cairo، والشفرة/المعرّفات LTR تلقائياً.
- **الأنماط العشرة** (§5) كمكونات عامة تستقبل بيانات فقط — [المرجع](docs/ARCHETYPES.md).
- **خريطة الفصول تُبنى آلياً** من مصفوفة الفصول، مع تمييز الفصل الحالي ونقطة الاستئناف والشرائح المزارة.
- **عقد التحكم** كاملاً: أسهم / Enter / Space / Esc / M / F، شريط تقدّم، عدّاد «الشريحة 5 / 20»، فأرة ولمس.
- **تحقق آلي** من قائمة Definition of Done (§10): معرفات فريدة ببادئة الفصل، تمهيد/خلاصة لكل فصل، 3–5 فصول، 4–8 شرائح، عناوين ≤ 6 كلمات…
- مثال تعبئة مكتمل: **«دراسة تحسين أداء مطعم النخيل»** (3 فصول، 20 شريحة، يغطي الأنماط العشرة).

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
| `npm test` | اختبارات التحقق والتدفق وعرض كل الشرائح |
| `npm run check` | أنواع + اختبارات + بناء (قبل الدمج) |

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
├── data/
│   ├── presentation.tsx         # شاشة العنوان + المقدمة + الخاتمة (المثال)
│   └── chapters/ch1..ch3.tsx    # الفصول والشرائح (المثال)
├── components/
│   ├── Presentation.tsx         # يربط آلة الحالة بالشاشات والتحكم
│   ├── screens/                 # الشاشات الخمس: Title, Preface, Map, Slide, Final
│   ├── archetypes/              # الأنماط العشرة + ChapterPreface + ChapterSummary
│   ├── chrome/                  # ProgressBar, ControlBar, SlideHeader, KeyboardHelp
│   └── ui/                      # Card, Badge/Num/Term, WordReveal (بالكلمات لا بالحروف), Stagger
├── hooks/                       # usePresentation (التدفق), useKeyboardControls, useFullscreen, useSwipe
├── lib/                         # navigation.ts (التسلسل/التالي/السابق/Esc), validate.ts (Definition of Done)
├── config/controls.ts           # خريطة المفاتيح
└── __tests__/                   # validate, navigation, render (smoke لكل شريحة)
docs/
├── PRESENTATION_TEMPLATE_SPEC.md # المواصفة الكاملة (البنية، التدفق، الأنماط، الوصفة، القواعد)
└── ARCHETYPES.md                 # مرجع خصائص المكونات
```

## كيف تملأ القالب بمشروعك (الوصفة المختصرة)

1. **استخرج 3–5 أسئلة** يجيب عنها العرض ← كل سؤال فصل (`src/data/chapters/chN.tsx`).
2. **قسّم كل فصل إلى 4–8 محاور** ← كل محور شريحة؛ افتتح بـ `ChapterPreface` واختم بـ `ChapterSummary`.
3. **صنّف كل شريحة** بنمط من العشرة (`archetype`) واستعمل مكوّنه من `@/components/archetypes`.
4. **اكتب الأغلفة**: `id` ببادئة الفصل (`ch2-kpis`)، `title` اسم من 3–6 كلمات، `subtitle` اختياري، `icon` دالة.
5. **املأ الشاشات الثابتة** في `src/data/presentation.tsx`: `meta` (شاشة العنوان)، `preface` (3–4 خطوات: سياق ← إشكالية كسؤال ← أهداف ← منهجية)، `final` (3–4 جمل تلخيص + دعوة تأمل + شكر).
6. **شغّل `npm run check`** — يفحص المعرفات والبادئات وعدد الفصول/الشرائح وطول العناوين ويعرض كل شريحة.

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

## قواعد لا تُكسر (§9)

- فكرة واحدة لكل شريحة؛ العنوان اسم لا جملة (≤ 6 كلمات).
- الأرقام والمصطلحات تُبرز بـ `<Num>` / `<Term>` / `<Badge>` لا في نص سائب.
- النص العربي لا يُقسَّم إلى حروف في أي حركة — `WordReveal` يقسّم بالكلمات فقط.
- معرفات الشرائح فريدة وببادئة الفصل؛ الخريطة والتنقل يعتمدان عليها.
- الخاتمة تلخّص ولا تُدخل معلومة جديدة.
