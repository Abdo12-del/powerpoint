# الخطوط وأنواعها وحركتها — Typography Guide

> مرجع كامل لخطوط القالب: **29 خطاً** مثبتاً دون اتصال (حزم [Fontsource](https://fontsource.org)) مصنّفة حسب نوع الخط العربي، **10 اقترانات جاهزة**، طريقة التبديل من ملف واحد، قواعد الطباعة العربية، و**6 مكونات لحركة النص** تحترم اتصال الحروف.
> معاينة حية لكل شيء: شغّل `npm run dev` وافتح `http://localhost:5173/?lab=fonts`.

## 0. الخلاصة في 30 ثانية

```ts
// src/data/typography.ts — الملف الوحيد الذي تغيّره لتبديل خطوط العرض كله
export const typography: TypographyConfig = {
  preset: 'academic',       // اقتران جاهز (انظر §2)
  display: 'katibeh',       // تجاوز اختياري لدور واحد
  latin: 'inter',           // خط لاتيني مرافق يُضاف إلى المكدس (اختياري)
  scale: 1.0,               // مضاعف حجم عام للتعويض بين الخطوط (اختياري)
};
```

- الأدوار الأربعة: **heading** (كل `h1/h2/h3` تلقائياً) · **body** (النص، = `font-sans`) · **display** (صنف `font-display` للاقتباسات والأرقام الكبيرة والشارات) · **mono** (`font-mono` للكود والمعرّفات).
- يُحمَّل CSS الخطوط المختارة فقط (استيراد كسول) ويُضبط على `:root` قبل أول رسم؛ الخطوط غير المختارة لا تدخل حزمة العرض.
- الافتراضي `default` = Cairo + JetBrains Mono — مظهر القالب لا يتغيّر ما لم تختر غيره.

## 1. الكتالوج حسب النوع

كل المعرّفات أدناه تُستعمل في `TypographyConfig` وفي `FONTS[id]` (`src/fonts/registry.ts`). «متغيّر» = خط Variable يدعم حركة الوزن/المحاور عددياً.

### 1.1 حديث (سانس) — `modern`

| المعرّف | الاسم | الأوزان | متغيّر/محاور | الأدوار | متى |
|---|---|---|---|---|---|
| `cairo` | القاهرة — Cairo | 200–1000 | ✔ wght (+slnt عبر `slnt.css`) | heading, body, display | **الافتراضي**؛ واضح في كل الأحجام |
| `tajawal` | تجوال — Tajawal | 400/500/700/800 | ثابت | body, heading | نص جارٍ أنيق للعروض المؤسسية |
| `almarai` | المراعي — Almarai | 300/400/700/800 | ثابت | heading, body | عناوين مؤسسية نظيفة |
| `changa` | تشانغا — Changa | 200–800 | ✔ wght | heading, display | عناوين قوية مضغوطة (أكاديمي) |
| `el-messiri` | المسيري — El Messiri | 400–700 | ✔ wght | heading, display | عناوين بلمسة خطّية |
| `readex-pro` | ريدكس برو — Readex Pro | 160–700 | ✔ wght + **HEXP** 0–100 | heading, body | قراءة ميسّرة؛ محور تمدّد فريد |
| `ibm-plex-sans-arabic` | IBM Plex Sans Arabic | 300/400/500/700 | ثابت | body, heading | تقني محايد بلاتيني متناسق |
| `noto-sans-arabic` | نوتو سانس عربي | 100–900 | ✔ wght + **wdth** 62.5–100 | body, heading | محور عرض لحركة «تمدّد» |
| `vazirmatn` | وزيرمتن — Vazirmatn | 100–900 | ✔ wght | body, heading | نص واجهات ممتاز؛ بديل Cairo |
| `alexandria` | الإسكندرية — Alexandria | 100–900 | ✔ wght | heading, body | هندسي عريض للعناوين الكبيرة |
| `rubik` | روبيك — Rubik | 300–900 | ✔ wght | body, heading | زوايا مدوّرة؛ ثنائي اللغة |

### 1.2 كوفي — `kufi`

| المعرّف | الاسم | الأوزان | متغيّر | الأدوار | متى |
|---|---|---|---|---|---|
| `noto-kufi-arabic` | نوتو كوفي | 100–900 | ✔ | heading, body, display | كوفي حديث للشاشات الكبيرة |
| `reem-kufi` | ريم كوفي | 400–700 | ✔ | display, heading | عناوين قصيرة وشعارات (ليس للنص) |
| `kufam` | كوفام | 400–900 | ✔ | display, heading | كوفي معاصر بشخصية قوية |

### 1.3 نسخ — `naskh`

| المعرّف | الاسم | الأوزان | متغيّر | الأدوار | متى |
|---|---|---|---|---|---|
| `amiri` | أميري — Amiri | 400/700 | ثابت | display, body, heading | نسخ كلاسيكي (بولاق): اقتباسات، آيات، أكاديمي رصين |
| `noto-naskh-arabic` | نوتو نسخ | 400–700 | ✔ | body, heading | نسخ حديث للقراءة الطويلة |
| `scheherazade-new` | شهرزاد — Scheherazade New | 400/700 | ثابت | body, display | نسخ تقليدي واسع التغطية (SIL) |
| `markazi-text` | مركزي — Markazi Text | 400–700 | ✔ | heading, body, display | نسخ تحريري عصري |
| `harmattan` | هرمتان — Harmattan | 400/700 | ثابت | body, display | أسلوب مغاربي/ورش |

### 1.4 رقعة — `ruqaa`

| المعرّف | الاسم | الأوزان | متغيّر | الأدوار | متى |
|---|---|---|---|---|---|
| `aref-ruqaa` | عارف رقعة | 400/700 | ثابت | display | عناوين قصيرة، اقتباسات، توقيعات — **بحجم كبير فقط** |

### 1.5 زخرفي / عناوين — `display`

| المعرّف | الاسم | الأوزان | متغيّر | متى |
|---|---|---|---|---|
| `katibeh` | كاتبة — Katibeh | 400 | ثابت | عناوين تراثية كبيرة (شاشة العنوان، الفواصل) |
| `rakkas` | رقّاص — Rakkas | 400 | ثابت | كلمة أو كلمتان بتباين عالٍ (أرقام كبيرة، شعار) |
| `jomhuria` | جمهورية — Jomhuria | 400 | ثابت | ملصقات مضغوطة ثقيلة — بحجم كبير فقط |

### 1.6 مدوّر / ودود — `rounded`

| المعرّف | الاسم | الأوزان | متغيّر | متى |
|---|---|---|---|---|
| `baloo-bhaijaan-2` | بالو بهاي جان 2 | 400–800 | ✔ | تعليم، أطفال، منتجات ودودة |
| `lemonada` | ليمونادة — Lemonada | 300–700 | ✔ | شارات ودعوات وعبارات قصيرة |
| `marhey` | مرحى — Marhey | 300–700 | ✔ | كلمة احتفالية أو عنوان فعالية |

### 1.7 لاتيني مرافق — `latin` · أحادي المسافة — `mono`

| المعرّف | الاسم | الأوزان | متغيّر | متى |
|---|---|---|---|---|
| `inter` | Inter | 100–900 | ✔ wght + opsz | مقاطع لاتينية طويلة؛ يُضاف عبر `latin: 'inter'` |
| `jetbrains-mono` | JetBrains Mono | 400/600/700 | ثابت | **الافتراضي** للكود والمعرّفات والأرقام |
| `fira-code` | Fira Code | 400/600 | ثابت | كود بروابط حروف `=> !== ->` |

> **لماذا هذه المجموعة؟** كلها مفتوحة المصدر (OFL/Apache) على Google Fonts وتُثبَّت من npm فلا تعتمد على اتصال أثناء العرض، وتغطي الأنواع الخمسة للخط العربي المستعملة في الشاشات (سانس/كوفي/نسخ/رقعة/زخرفي) مع أغلبية **متغيّرة** (17/29) لأن حركة الخط العربي الآمنة تمرّ عبر محاور الخط لا عبر تقطيع الحروف.

## 2. الاقترانات الجاهزة (Presets)

| `preset` | عناوين | نص | عرضي | كود | يناسب |
|---|---|---|---|---|---|
| `default` | Cairo | Cairo | Cairo | JetBrains Mono | كل شيء؛ لا يغيّر المظهر |
| `academic` | Changa | Cairo | Amiri | JetBrains Mono | مناقشات التخرج والرسائل والمحاضرات |
| `modern-tech` | Readex Pro | IBM Plex Sans Arabic | Reem Kufi | Fira Code | منتجات وبرمجيات وشركات ناشئة |
| `corporate` | Almarai | Tajawal | El Messiri | JetBrains Mono | تقارير الشركات والجهات الرسمية |
| `editorial` | Markazi Text | Noto Naskh Arabic | Aref Ruqaa | JetBrains Mono | صحافة وأدب وعلوم إنسانية |
| `heritage` | Amiri | Scheherazade New | Katibeh | JetBrains Mono | تاريخ ودين ولغة وتراث |
| `kufi-bold` | Noto Kufi Arabic | Noto Sans Arabic | Kufam | JetBrains Mono | هوية بصرية قوية وشاشات كبيرة |
| `friendly` | Baloo Bhaijaan 2 | Vazirmatn | Lemonada | Fira Code | تعليم الأطفال والفعاليات |
| `geometric` | Alexandria | Rubik | Marhey | JetBrains Mono | تصميم وتسويق وعلامات تجارية |
| `maghrebi` | El Messiri | Harmattan | Aref Ruqaa | JetBrains Mono | ثقافة وتراث المغرب العربي |

قواعد الاقتران التي بُنيت عليها (اتبعها إن ألّفت اقتراناً جديداً):

1. **تباين النوع لا التشابه**: عنوان سانس ثقيل + نص نسخ، أو عنوان كوفي + نص سانس. لا تجمع خطّي نسخ متقاربين.
2. **النص الجاري من خطوط `roles` تتضمن `body`** فقط (ارتفاع x كافٍ، أوزان 400 و700 حقيقية).
3. **الخط العرضي لكلمة أو سطر**، لا لفقرة — خاصة الرقعة والزخرفي.
4. **كود واحد** لكل العرض؛ لا تخلط JetBrains Mono وFira Code.
5. اختبر الاقتران على شاشة العنوان، شريحة `bullets`، وشريحة `table` قبل الاعتماد.

## 3. كيف يعمل (للمطوّر/الوكيل)

```
src/fonts/registry.ts   FONTS[id] = { family, label, category, variable, weights, axes, roles, bestFor, lineHeight, fallback, load() }
src/fonts/presets.ts    TYPOGRAPHY_PRESETS + TypographyConfig + resolveRoles()
src/fonts/apply.ts      applyTypography(config) → يحمّل CSS الخطوط كسولاً ويضبط المتغيرات على :root
src/data/typography.ts  الإعدادات التي يحرّرها المستخدم/الوكيل
src/main.tsx            await applyTypography(typography) → warmUpFonts → render(App)   |   ?lab=fonts → FontLab
src/index.css           @theme static { --font-heading / --font-body / --font-display / --font-mono } + h1,h2,h3 { font-family: var(--font-heading) }
```

المتغيرات التي تُضبط: `--font-heading`, `--font-body`, `--font-display`, `--font-mono`, `--leading-body`, `--leading-heading`, `--type-scale`، و`data-typography="<preset>"` على `<html>`.

استعمال مباشر داخل مكوّن:

```tsx
import { FONTS, fontStack, ensureFontLoaded } from '@/fonts';

// خط لمرة واحدة في شريحة (مثلاً اقتباس بخط أميري داخل عرض تقني)
useEffect(() => { void ensureFontLoaded('amiri'); }, []);
<blockquote style={{ fontFamily: fontStack(FONTS.amiri) }} className="text-3xl leading-loose">…</blockquote>

// أو عبر الأدوار (الأفضل): الصنف font-display يأخذ خط الدور display من الاقتران
<p className="font-display text-4xl text-amber-300">٩٥٪</p>
```

إضافة خط جديد: `npm install @fontsource-variable/<name>` (أو `@fontsource/<name>` للثابت) ← أضف مدخلة في `FONT_IDS` و`FONTS` (الحزم الثابتة: `index.css` = وزن 400 فقط، استورد `/700.css` صراحة) ← `npm run check` (الاختبارات تتحقق من سلامة السجل).

## 4. قواعد الطباعة العربية في الشاشات

| القاعدة | لماذا | في القالب |
|---|---|---|
| **لا `letter-spacing`** على العربية (ولا `tracking-*`) | يكسر اتصال الحروف ويولّد فجوات | `html[dir=rtl] { letter-spacing: 0 }`؛ استعمل `tracking-*` على الأرقام/الكود فقط |
| **لا مائل اصطناعي ولا عريض اصطناعي** | تشويه ثابت للحروف المتصلة | `font-synthesis: none`؛ للميل استعمل محور `slnt` (Cairo) أو لوناً/وزناً للتأكيد |
| **لا تقسيم إلى حروف** في الحركة | يقطع الاتصال والتشكيل | كل المكونات تقسّم بالكلمات؛ `TextAnimate by="character"` يتحوّل تلقائياً إلى كلمات |
| **ارتفاع سطر أعلى من اللاتيني**: 1.6–1.9 للنص، 1.2–1.4 للعناوين | الصواعد والنوازل والتشكيل | `--leading-body` من `lineHeight` الخط المختار |
| **الأحجام**: نص ≥ 24px على 1080p، عنوان 44–64px، كلمة عرضية حتى 120px | المسافة من الجمهور | `scale` للتعويض عند خط صغير بصرياً (نسخ ≈ 1.05–1.1) |
| **الأرقام**: عربية غربية `0123` داخل `<Num>`/`font-mono` و`tabular-nums`؛ أو هندية `٠١٢٣` بثبات واحد | اتساق الأعمدة والعدّادات | `Num`, `NumberTicker` داخل `dir="ltr"` |
| **اللاتيني داخل العربي** قصير ومعزول (`<Term>`, `<code>`) | لتجنّب قفزات الاتجاه | وأطول من ذلك: `latin: 'inter'` في الإعدادات |
| **الخطوط العرضية بحجم كبير فقط** (رقعة/كاتبة/رقّاص ≥ 40px) | تفاصيلها تضيع في الصغير | لا تضعها في `body` أبداً |
| **ميزات OpenType**: `liga` و`calt` مفعّلتان؛ `kern` افتراضي | اتصال وتشكيل سياقي صحيح | في `body` بـ `font-feature-settings` |
| **حمّل قبل الرسم** | لا وميض خط في شاشة العنوان | `applyTypography` + `warmUpFonts` (مهلة 1.5 ث) |

## 5. حركة النص (`@/components/typography`)

> المبدأ: الكلمة وحدة لا تتجزأ. تتحرك **خصائص الخط** (الوزن/العرض/الميل)، أو **قناع** فوق النص، أو **خلفية** خلفه — لا الحروف.

| المكوّن | ماذا يفعل | يحتاج خطاً متغيّراً؟ | مثال |
|---|---|---|---|
| `VariableText` | يحرّك محور خط عددياً (`wght` / `wdth` / `slnt` / `HEXP`) بأوضاع `once` / `loop` / `hover` | ✔ | `<VariableText as="h1" from={300} to={800}>عنوان</VariableText>` |
| `KineticHeadline` | كلمات تدخل تباعاً (صعود + إزالة ضبابية) ووزنها ينمو؛ `highlight` لإبراز كلمات | ✔ (يعمل بلا حركة وزن على الثابت) | `<KineticHeadline as="h1" text="…" highlight={['المطاعم']} />` |
| `ClipReveal` | كشف بقناع `clip-path` من اليمين (RTL) أو أي جهة؛ النص كتلة واحدة | ✘ | `<ClipReveal as="h2">عنوان طويل بالنسخ</ClipReveal>` |
| `HighlightSweep` | تظليل «قلم فسفوري» يُمسح من اليمين خلف الكلمة المهمة (`marker` / `underline`) | ✘ | `نسبة <HighlightSweep>٩٥٪</HighlightSweep>` |
| `FancyText` | أنماط ثابتة آمنة: `gradient` (ثابت/متحرك) · `outline` · `glow` · `shadow3d` · `emboss` | ✘ | `<FancyText variant="gradient" animated>تخرّج ٢٠٢٦</FancyText>` |
| `FontSpecimen` | بطاقة عيّنة لخط من السجل (يستعملها المختبر) | — | `<FontSpecimen font={FONTS.amiri} />` |
| `CalligraphyText` | «الخط يُكتب»: تشكيل HarfBuzz إلى مسارات SVG حقيقية تُرسم بالقلم من اليمين ثم تُملأ (10 خطوط قابلة للرسم) | ✘ (ملفات `.woff` ثابتة) | `<CalligraphyText text="بسم الله الرحمن الرحيم" font="aref-ruqaa" size={96} />` |
| `NumberRoll` | رقم تتدحرج خاناته (number-flow) بحسب المحلية، نسب/عملات، داخل `dir="ltr"` | ✘ | `<NumberRoll value={1284} suffix=" خرّيجاً" locales="ar-DZ" />` |
| `FitText` | العنوان يملأ عرض حاويته (fitty) ويعيد القياس بعد تحميل الخط | ✘ | `<FitText as="h1" minSize={32} maxSize={220}>{meta.title}</FitText>` |

تكمّلها الموجودة سابقاً: `WordReveal` (`@/components/ui`) للكشف الأساسي، `TextAnimate`/`WordRotate`/`AuroraText`/`SparklesText`/`AnimatedShinyText` + الجديدة `TextEffect`/`TextLoop`/`TextShimmer`/`MorphingText`/`LineShadowText` (`@/components/gallery`)، `Typewriter` (`@/components/effects`)، و`splitWords()` + GSAP للتسلسلات الدقيقة (مهارة `gsap-react-timelines`). تفاصيل المشاريع المثبّتة لحركة النص وما استُبعد منها: [`TEXT_ANIMATION_PROJECTS.md`](TEXT_ANIMATION_PROJECTS.md).

### متى أستعمل ماذا؟

| الموقف | الاختيار |
|---|---|
| عنوان الشريحة الافتراضي | لا شيء إضافي — `SlideHeader` يستعمل `WordReveal` |
| شاشة العنوان / عنوان فصل مهم | `KineticHeadline` (خط متغيّر) أو `ClipReveal` (خط نسخ/رقعة) |
| رقم أو نتيجة حاسمة | `HighlightSweep` حول الرقم، أو `FancyText variant="glow"` مع `font-display` |
| كلمة واحدة «تتنفس» في الخلفية أو شعار | `VariableText mode="loop"` |
| عنوان بمحور عرض (Noto Sans Arabic) أو تمدّد (Readex Pro) | `VariableText axis="wdth"` / `axis="HEXP"` |
| تدرّج احتفالي (تخرّج، إطلاق) | `FancyText variant="gradient" animated` + `ConfettiOnMount` |
| بسملة / اقتباس / عنوان «يُكتب بالقلم» (≤ 6 كلمات) | `CalligraphyText` (مهارة `calligraphy-draw-on`) |
| رقم بطل يتغيّر أو يظهر | `NumberRoll` (مهارة `numbers-and-counters`) |
| عنوان يملأ الشاشة / كلمة تتبدّل / كلمات تتحوّل | `FitText` / `TextLoop` / `MorphingText` (مهارة `kinetic-typography`) |

كلها تحترم `prefers-reduced-motion` (تقفز إلى الحالة النهائية) ولا تستعمل `letter-spacing`.

## 6. مختبر الخطوط — `?lab=fonts`

`npm run dev` ثم `http://localhost:5173/?lab=fonts`:

- **الاقترانات**: بطاقة لكل اقتران مع عنوان/فقرة/كلمة عرضية/كود بخطوطه، زر **«طبّق على الصفحة»** يبدّل متغيرات `:root` حياً، ومقتطف `typography.ts` جاهز للنسخ.
- **حركات النص**: عرض حي للمكونات الستة مع زر إعادة.
- **الخط يُكتب**: نص قابل للتحرير، اختيار الخط من العشرة القابلة للرسم، الأوضاع الثلاثة، وإعادة الكتابة.
- **مشاريع حركة النص المثبّتة**: `NumberRoll` (غيّر القيمة)، `FitText`، `TextEffect`، `TextLoop`، `TextShimmer`، `LineShadowText`، `MorphingText`.
- **الكتالوج**: كل الخطوط حسب النوع، نص اختبار قابل للتحرير، حجم، تشغيل «تنفّس الوزن» على كل الخطوط المتغيرة، وتصفية حسب النوع.

المختبر يُحمَّل كسولاً (`React.lazy`) فلا يؤثر في حزمة العرض.

## 7. قائمة فحص الطباعة قبل التسليم

- [ ] `src/data/typography.ts` يحدّد اقتراناً مقصوداً (أو `default` عن وعي).
- [ ] العناوين ≤ 6 كلمات وتُقرأ من آخر الصف في الخط المختار (اختبر `npm run preview` بملء الشاشة).
- [ ] لا `tracking-*` على نص عربي؛ لا `italic` على عربي.
- [ ] الخطوط العرضية في كلمات/أسطر مفردة بحجم كبير فقط.
- [ ] كود/معرّفات/أرقام في `font-mono` و`dir="ltr"`.
- [ ] حركة النص بالكلمات أو بالمحاور أو بالقناع — لا حروف.
- [ ] `npm run check` يمرّ (اختبارات `typography.test.tsx` تتحقق من السجل والاقترانات والمكونات).
