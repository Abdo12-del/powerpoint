---
name: arabic-typography-motion
description: Arabic typography and text animation for this presentation template — choosing a font pairing (preset) or individual Arabic typefaces by type (Kufi, Naskh, Ruqaa, modern sans, rounded, display) from the installed Fontsource catalogue, switching fonts via src/data/typography.ts, Arabic typographic rules (no letter-spacing, no synthetic italic/bold, word-level motion only, line-height, sizes), and the text-motion components VariableText, KineticHeadline, ClipReveal, HighlightSweep, FancyText. Use when asked to change fonts, pick a typeface for a mood/audience, animate a title or a key word, fix broken Arabic letter joins, or review typography before delivery. اختيار الخطوط العربية واقتراناتها وحركة النص الآمنة.
metadata:
  short-description: الخطوط العربية — أنواعها، اقتراناتها، وحركة النص بالكلمات والمحاور
---

# الخطوط العربية وحركة النص

الدليل الكامل: `docs/TYPOGRAPHY.md`. المعاينة الحية: `npm run dev` ← `/?lab=fonts`. السجل: `src/fonts/registry.ts` (29 خطاً). الإعداد الوحيد الذي يغيّر العرض كله: `src/data/typography.ts`.

## 1. قرار الخط في 4 خطوات

1. **حدّد طابع العرض** ← اختر `preset` من الجدول (ثم أكّد في المختبر):

   | الطابع | `preset` | ملاحظة |
   |---|---|---|
   | مناقشة تخرج / محاضرة | `academic` | عناوين Changa، نص Cairo، اقتباسات Amiri |
   | منتج / برمجيات | `modern-tech` | Readex Pro + IBM Plex Sans Arabic + Fira Code |
   | شركة / جهة رسمية | `corporate` | Almarai + Tajawal |
   | صحافة / أدب / إنسانيات | `editorial` | Markazi Text + Noto Naskh |
   | تاريخ / دين / لغة | `heritage` | Amiri + Scheherazade + Katibeh |
   | هوية قوية / شاشات ضخمة | `kufi-bold` | Noto Kufi + Noto Sans Arabic (wdth) |
   | أطفال / فعاليات | `friendly` | Baloo Bhaijaan 2 + Vazirmatn |
   | تصميم / تسويق | `geometric` | Alexandria + Rubik |
   | تراث مغاربي | `maghrebi` | El Messiri + Harmattan (ورش) |
   | لا طابع خاصاً | `default` | Cairo — لا تغيّر شيئاً |

2. **تجاوز دوراً واحداً** عند الحاجة فقط: `{ preset: 'academic', display: 'katibeh' }`. الأدوار: `heading` (كل h1–h3)، `body` (النص = `font-sans`)، `display` (صنف `font-display`: اقتباس/رقم/شارة)، `mono` (كود).
3. **لاتيني كثير؟** أضف `latin: 'inter'`. **الخط يبدو صغيراً؟** `scale: 1.05` (النسخ عادة).
4. **تحقق**: شاشة العنوان، شريحة `bullets`، شريحة `table` بملء الشاشة؛ ثم `npm run check`.

```ts
// src/data/typography.ts
export const typography: TypographyConfig = { preset: 'academic', display: 'katibeh', latin: 'inter' };
```

## 2. أنواع الخط العربي — متى يصلح كلٌّ منها

| النوع | المعرّفات | يصلح لـ | لا تستعمله لـ |
|---|---|---|---|
| حديث (سانس) | `cairo` `tajawal` `almarai` `changa` `el-messiri` `readex-pro` `ibm-plex-sans-arabic` `noto-sans-arabic` `vazirmatn` `alexandria` `rubik` | النص والعناوين في كل العروض | — |
| كوفي | `noto-kufi-arabic` `reem-kufi` `kufam` | عناوين، شعارات، شاشات كبيرة | نص طويل (إلا نوتو كوفي) |
| نسخ | `amiri` `noto-naskh-arabic` `scheherazade-new` `markazi-text` `harmattan` | قراءة طويلة، اقتباسات، نصوص دينية/أدبية | عناوين سانس ثقيلة، أحجام < 20px |
| رقعة | `aref-ruqaa` | كلمة/سطر عرضي ≥ 40px | نص جارٍ، جداول |
| زخرفي | `katibeh` `rakkas` `jomhuria` | شاشة العنوان، فواصل، رقم ضخم | أي فقرة |
| مدوّر | `baloo-bhaijaan-2` `lemonada` `marhey` | تعليم، أطفال، فعاليات | عروض رسمية |
| لاتيني / كود | `inter` · `jetbrains-mono` `fira-code` | مصطلحات طويلة · كود/معرّفات/أرقام | العربية |

قاعدة الاقتران: **تباين** (سانس ثقيل + نسخ، أو كوفي + سانس)؛ خط عرضي واحد؛ كود واحد.

## 3. قواعد لا تُكسر

- **لا `letter-spacing`/`tracking-*` على العربية** (يقطع الاتصال). `html[dir=rtl]` يضبطه 0؛ استعمله على الأرقام/الكود فقط.
- **لا `italic` ولا عريض اصطناعي** (`font-synthesis: none` مفعّل). للتأكيد: وزن أعلى، لون، `HighlightSweep`، أو محور `slnt` في Cairo.
- **الحركة بالكلمات أو بالمحاور أو بالقناع — لا حروف.** `splitWords()` لا `SplitText chars`؛ `TextAnimate by="word"`.
- **ارتفاع السطر** 1.6–1.9 للنص، 1.2–1.4 للعناوين (يُضبط تلقائياً من `lineHeight` الخط).
- **الأحجام على 1080p**: نص ≥ 24px، عنوان 44–64px، كلمة عرضية حتى 120px.
- **الأرقام** داخل `<Num>`/`font-mono` مع `tabular-nums`؛ نمط واحد (غربي `0123` أو هندي `٠١٢٣`) في العرض كله.
- **الخط المتغيّر فقط** يتحرك وزنه؛ على خط ثابت تظهر قفزة بين وزنين (استعمل `ClipReveal`/`HighlightSweep` بدلاً).

## 4. حركة النص — الاختيار والمقتطفات

```tsx
import { VariableText, KineticHeadline, ClipReveal, HighlightSweep, FancyText } from '@/components/typography';
```

| الموقف | المكوّن | مقتطف |
|---|---|---|
| شاشة العنوان / عنوان فصل (خط متغيّر) | `KineticHeadline` | `<KineticHeadline as="h1" className="text-5xl" text={meta.title} highlight={['المطاعم']} />` |
| عنوان بخط نسخ/رقعة (لا تقسيم) | `ClipReveal` | `<ClipReveal as="h2" direction="start">…</ClipReveal>` |
| رقم/نتيجة حاسمة | `HighlightSweep` | `بلغت الدقة <HighlightSweep>٩٥٪</HighlightSweep>` |
| كلمة تتنفس / شعار | `VariableText` | `<VariableText mode="loop" from={200} to={900}>الابتكار</VariableText>` |
| تمدّد/عرض (Noto Sans Arabic / Readex Pro) | `VariableText axis` | `<VariableText axis="wdth" from={62.5} to={100} style={{ fontFamily: fontStack(FONTS['noto-sans-arabic']) }}>` |
| تدرّج احتفالي / توهج | `FancyText` | `<FancyText variant="gradient" animated className="font-display">تخرّج ٢٠٢٦</FancyText>` |
| كشف أساسي للعناوين | `WordReveal` (موجود في `SlideHeader`) | لا تضف فوقه مؤثراً ثانياً |

خط خاص بشريحة واحدة: `useEffect(() => { void ensureFontLoaded('amiri'); }, [])` ثم `style={{ fontFamily: fontStack(FONTS.amiri) }}`.
التوقيت: استقرار العنوان ≤ 1.2 ث؛ مؤثر نصي واحد مهيمن لكل شريحة؛ كل المكونات تحترم `prefers-reduced-motion`.

## 5. أعطال شائعة وإصلاحها

| العرض | السبب | الإصلاح |
|---|---|---|
| حروف منفصلة أو فجوات | `tracking-*` / تقسيم حروف / `SplitText chars` | احذف التباعد؛ قسّم بالكلمات |
| الوزن لا يتحرك | خط ثابت | خط `variable: true` أو `ClipReveal` |
| وميض خط عند أول شاشة | الخط غير محمّل قبل الرسم | `applyTypography` يحمّله؛ تأكد أن الخط في الاقتران لا في `style` فقط |
| تشكيل يطفو بعيداً عن الحرف | خط لا يدعم `mark` جيداً بحجم صغير | كبّر الحجم أو انتقل إلى Noto Naskh/Amiri |
| لاتيني بخط مختلف وغير متناسق | المكدس يسقط على خط النظام | `latin: 'inter'` أو خط عربي يحتوي لاتينياً (`rubik`, `ibm-plex-sans-arabic`) |
| الرقعة/كاتبة غير مقروءة | حجم صغير | ≥ 40px وكلمات قليلة |

## 6. قبل التسليم

- [ ] `typography.ts` يحمل اقتراناً مقصوداً ومعاينته تمت في `?lab=fonts`.
- [ ] لا `tracking-*`/`italic` على عربي؛ الأرقام والكود `font-mono dir="ltr"`.
- [ ] مؤثر نصي واحد لكل شريحة، بالكلمات/المحاور/القناع.
- [ ] `npm run check` أخضر.
