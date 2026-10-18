---
name: numbers-and-counters
description: Animated numbers, counters, percentages and stats for this Arabic presentation template — NumberRoll (number-flow: locale-aware digit rolling, ar-EG Arabic-Indic vs ar-DZ/en Western digits, percent/compact/currency formats, prefix/suffix, trend), NumberTicker (count-up), AnimatedCircularProgressBar, the stats archetype and the <Num> badge, tabular-nums, dir="ltr" wrapping, one digit style per deck, timing, and testing. Use when asked to animate a KPI, count up a number, show a percentage/ratio, roll a date or score, or when numbers look reversed or jumpy in RTL. الأرقام والعدّادات المتحركة في RTL.
metadata:
  short-description: الأرقام والعدّادات — number-flow وNumberTicker في سياق RTL
---

# الأرقام والعدّادات المتحركة

```tsx
import { NumberRoll } from '@/components/typography';          // number-flow (MIT) — الخانات تتدحرج
import { NumberTicker, AnimatedCircularProgressBar } from '@/components/gallery'; // عدّ تصاعدي / حلقة نسبة
```

## 1. أيّهما؟

| الحاجة | المكوّن | لماذا |
|---|---|---|
| رقم بطل يتغيّر أو يظهر مرة (KPI، عدد الخريجين، السنة) | `NumberRoll` | كل خانة تتدحرج إلى قيمتها — لا أرقام عشوائية تومض؛ يدعم المحلية والنسب والعملات |
| شبكة 3–6 مؤشرات (الشريحة القياسية) | النمط `stats` (`StatCounters`) | عدّاد تصاعدي مدمج (`ar-DZ` غربي) مع أيقونة ووسم واتجاه — لا تعيد بناءه |
| «عدّ من 0 إلى N» لرقم واحد خارج النمط | `NumberTicker value delay` | بسيط؛ يبدأ من الصفر دائماً |
| نسبة مئوية كحلقة | `AnimatedCircularProgressBar value={72}` | قيمة واحدة بارزة |
| رقم داخل جملة بلا حركة | `<Num>` من `@/components/ui` أو `font-mono tabular-nums` | الأرقام شارات لا نصاً (قاعدة القالب) |

## 2. NumberRoll — الأساسيات

```tsx
<NumberRoll value={1284} suffix=" خرّيجاً" className="text-7xl font-black text-amber-300" />
<NumberRoll value={0.874} format={{ style: 'percent', maximumFractionDigits: 1 }} />           // ٨٧٫٤٪
<NumberRoll value={2026} format={{ useGrouping: false }} locales="ar-DZ" />                   // 2026 (غربي، بلا فاصل آلاف)
<NumberRoll value={3_500_000} format={{ notation: 'compact' }} locales="ar-EG" />            // ٣٫٥ مليون
<NumberRoll value={price} format={{ style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }} locales="ar-DZ" />
<NumberRoll value={score} trend={+1} />                                                      // يصعد دائماً (لوحة نتائج)
```

- **المحلية تحدّد شكل الأرقام**: `ar-EG` (الافتراضي) ← هندية `٠١٢٣`؛ `ar-DZ`/`ar-MA`/`ar-TN`/`en` ← غربية `0123`. اختر نمطاً واحداً للعرض كله (انظر `docs/TYPOGRAPHY.md`). الجزائر والمغرب العربي يستعملان الغربية عادة → `locales="ar-DZ"`.
- المكوّن مُغلَّف تلقائياً بـ `<span dir="ltr">` — الأرقام تُقرأ من اليسار حتى في الجملة العربية؛ البادئة/اللاحقة (`prefix`/`suffix`) تبقى داخل الغلاف فلا تنفصل عن الرقم.
- `value` يجب أن يكون رقماً (`number`) لا نصاً. التغيير يحرّك الخانات (0.75 ث)؛ الظهور الأول بلا حركة — إن أردت «دخولاً» من قيمة سابقة: حالة تبدأ من 0 ثم `setValue(N)` بعد `delay` (مثال §4).
- يحترم `prefers-reduced-motion` (الافتراضي `respectMotionPreference`). للتعطيل المؤقت أثناء السحب: `animated={false}`.
- يتجنّب تغيير التخطيط: العرض يتحرّك بسلاسة مع عدد الخانات؛ لا تضع `w-[Npx]` ثابتاً.

## 3. قواعد RTL والطباعة للأرقام

- `tabular-nums` (موجود في `NumberRoll`) حتى لا يهتز العرض بين 1 و8.
- الوحدة بعد الرقم مسافة ثم كلمة عربية داخل `suffix` (`" خرّيجاً"`)، أو اجعلها عنصراً منفصلاً بعد المكوّن.
- النسبة: `%` تأتي من `Intl` بالمحلية (`٪` للهندية) — لا تكتبها يدوياً مع `style:'percent'`.
- خط الأرقام: الخط الرئيسي (Cairo/Tajawal…) يحوي أرقاماً عربية وهندية جيدة؛ للكود/المعرّفات `font-mono`.
- لا `letter-spacing` إلا على الأرقام/الكود (مسموح: `tracking-tight` على رقم بطل ضخم).

## 4. وصفة شريحة إحصاء

```tsx
function HeroStat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 400); // بعد دخول العنوان
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="text-center">
      <NumberRoll value={v} suffix={suffix} locales="ar-DZ" className="text-8xl font-black text-amber-300" />
      <p className="mt-3 text-2xl text-slate-300">{label}</p>
    </div>
  );
}
// 3 أرقام كحدّ أقصى في الشريحة؛ فرق 150 مللي ثانية بين كل رقم (delay 400/550/700)
```
الرقم البطل الواحد يناسب شريحة `profile`/`bullets` بمحتوى حرّ أو شاشة الخاتمة؛ أما 3–6 مؤشرات فاستعمل النمط `stats` بـ `<StatCounters stats={[{ value, label, suffix, icon, trend }]} />` (عدّاده مدمج ويطابق أرقام القالب الغربية). للإحصاء المقارن (قبل/بعد) غيّر `value` في `NumberRoll` بزر داخلي أو عند دخول الشريحة — الخانات تتدحرج بين القيمتين.

## 5. اختبار وتحقّق

- `renderToStaticMarkup(<NumberRoll value={42} locales="ar-DZ" />)` يحتوي `42` و`dir="ltr"`؛ مع `ar-EG` يحتوي `٤٢` (انظر `src/__tests__/typography-projects.test.tsx`).
- يدوياً: غيّر القيمة مرتين بسرعة — لا قفزة في العرض ولا أرقام خاطئة؛ فعّل تقليل الحركة — القيمة النهائية مباشرة.
- مخالفة شائعة: خلط `١٢٣` و`123` في العرض نفسه → وحّد `locales` (اجعله ثابتاً في `src/data/typography.ts` إن أردت: `numerals: 'western' | 'arabic-indic'` كتعليق توجيهي للوكيل).
