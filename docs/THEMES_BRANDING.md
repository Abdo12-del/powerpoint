# السمات والهوية (Themes & Branding)

توفر الحزمة ثلاث سمات قابلة للتبديل عبر متغيرات CSS، خلفيات زخرفية خفيفة، لوحات ألوان مشتقة لكل فصل، وهوية جامعية اختيارية. لا تضيف نمط شريحة جديداً؛ تبقى الأنماط العشرة كما هي.

## الإعداد من استمارة العرض

في `src/data/presentation.tsx`:

```ts
export const presentation: PresentationData = {
  // ...meta, preface, chapters, final
  theme: {
    mode: 'corporate',  // 'dark' | 'light' | 'corporate'
    backdrop: 'mesh',   // 'aurora' | 'mesh' | 'grid' | 'noise' | 'none'
  },
  branding: {
    university: 'جامعة المثال',
    unit: 'كلية العلوم والتقنية',
    logoSrc: '/branding/university.svg',
    logoAlt: 'شعار جامعة المثال',
    footer: 'الكلية · السنة الجامعية 2026',
  },
};
```

`theme` اختياري؛ الافتراضي `dark` مع `aurora` حفاظاً على المظهر الحالي. `meta.background` منفصل: يختار جسيمات شاشة العنوان (نجوم/شبكة/ثلج/…) ولا يغيّر خلفية العرض العامة.

| الوضع | لوحة القالب | الاستخدام المقترح |
|---|---|---|
| `dark` | أردوازي داكن وذهبي مع السماوي الثانوي | الوضع الافتراضي، قاعات العرض |
| `light` | خلفية ورقية، نص أردوازي، تمييز كهرماني | التقارير والطباعة والعروض المضيئة |
| `corporate` | خلفية مؤسسية فاتحة، أزرق رسمي وذهبي ثانوي | الجامعة/المؤسسة، مناقشة رسمية |

المتغيرات الأساسية في `.presentation-shell`: `--presentation-background`, `--presentation-foreground`, `--presentation-surface`, `--presentation-surface-raised`, `--presentation-muted`, `--presentation-border`, `--presentation-accent`, `--presentation-secondary`, `--presentation-on-accent`, و`--presentation-grid`. للوضعين الفاتح والمؤسسي، `--presentation-text-amber`, `--presentation-text-sky`, `--presentation-text-emerald`, `--presentation-text-rose`, `--presentation-text-violet`, و`--presentation-text-orange` تعطي النصوص الدلالية ألواناً داكنة مقروءة، مع إبقاء لوحة الشفرة الداكنة مستقلة. تعيد السمات أيضاً ربط درجات Tailwind `slate` و`white` و`amber` داخل مساحة العرض كي تستجيب المكونات القائمة دون تغيير بنية الشرائح.

## الخلفيات

الخلفيات CSS فقط، محلية ودون طلب شبكة:

- `aurora`: وهج لوني متدرّج بطيء؛ تتوقف الحركة مع `prefers-reduced-motion`.
- `mesh`: عدة تدرجات شعاعية ناعمة.
- `grid`: شبكة خطوط خافتة تتلاشى عند الأسفل.
- `noise`: نسيج SVG turbulence مضمن داخل CSS.
- `none`: لون السمة فقط.

## ألوان الفصول

أضف `brandColor` إلى `ChapterData` (قيمة لون حرفية يفهمها Culori، ويفضّل hex؛ لا تمرّر `var(...)`)، واترك `color` و`accent` القديمين للتوافق مع بيانات العروض الموجودة:

```ts
{
  id: 'ch1',
  title: 'الدراسة التمهيدية',
  brandColor: '#0ea5e9',
  color: 'from-sky-600/20 to-sky-400/10', // fallback للتوافق القديم
  accent: 'text-sky-200 border-sky-400/40',
  // ...slides
}
```

`deriveChapterPalette()` في `src/components/themes/palette.ts` يستخدم Culori في OKLCH لاشتقاق لون التمييز والدرجات المتجاورة والمكمّلة والثلاثية، ويختار نصاً متبايناً فوق لون الشارة. تُصدّر `chapterPaletteStyle()` متغيرات مستقلة للوضع الداكن والفاتح والمؤسسي؛ تختارها CSS حسب السمة من دون إعادة تركيب العرض. تُطبّق اللوحة على شارة الفصل وأيقونته وبطاقته وشريط تقدمه والعقدة الحالية، وتبقى متاحة لكتل المحتوى عبر نطاق `.chapter-palette-scope`.

```tsx
import { deriveChapterPalette, chapterPaletteStyle } from '@/components/themes';
const palette = deriveChapterPalette('#0ea5e9', 'corporate');
// accent, accentStrong, soft, gradientStart/End, analogous, complementary, triad, onAccent
```

## الهوية المؤسسية

`BrandChrome` يضيف رأساً ثابتاً داخل مساحة العرض وذيلًا ثابتاً فوق شريط التحكم. إذا لم تُمرّر هوية فلا يضيف أي DOM. `logoSrc` يقبل مساراً محلياً مثل `/branding/university.svg` (ضع الملف في `public/branding/`)؛ أضف نصاً بديلاً وصفياً عبر `logoAlt` (والافتراضي اسم الجامعة عند غيابه). عند غياب الصورة يعرض المكوّن علامة معمارية عامة كعنصر نائب، لا شعار جامعة فعلياً. يمكن استخدام `university` و`unit` دون ملف صورة.

## المختبر والتوافق والرخص

- المختبر الحي: `/?lab=themes` — بدّل الوضع والخلفية، وعاين لوحات فصول وشعاراً افتراضياً.
- المكتبة: `culori@4.0.2` — MIT؛ لا تعتمد على React ولا تفرض peer dependency له. تعريفات TypeScript من `@types/culori@4.0.1` — MIT.
- المتصفح: ألوان OKLCH واللوحة تُحوّل إلى sRGB بواسطة Culori؛ المؤثرات والخلفيات لا تعتمد على خدمة خارجية. تُحترم إعدادات تقليل الحركة.
- تحقق: `src/components/themes/themes.test.tsx`، `npm run typecheck`، و`npm run check`.

للمهارة الإجرائية: `.agents/skills/themes-branding-rtl/SKILL.md`.
