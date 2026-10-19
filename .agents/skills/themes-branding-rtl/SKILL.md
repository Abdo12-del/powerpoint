---
name: themes-branding-rtl
description: Use when configuring light/dark/corporate presentation themes, CSS-variable colors, chapter palettes, decorative backdrops, or university branding/footer in the Arabic RTL slide template.
---

# السمات والهوية للعروض العربية RTL

اقرأ `docs/THEMES_BRANDING.md` قبل تغيير السمة أو إضافة هوية.

## الاختيار

1. حدّد سياق المشاهدة: `dark` الافتراضي للعرض، `light` للخلفية الورقية، و`corporate` للهوية المؤسسية/الجامعية. لا تغيّر سمة كل شريحة؛ عيّنها في `PresentationData.theme`.
2. اختر خلفية واحدة هادئة: `aurora`, `mesh`, `grid`, `noise`, أو `none`. خلفية العرض (`theme.backdrop`) منفصلة عن جسيمات شاشة العنوان (`meta.background`). اجعلها ثانوية للنص.
3. لكل فصل، حدّد `brandColor` صالحاً؛ استخدم `deriveChapterPalette()` و`chapterPaletteStyle()` من `@/components/themes` بدلاً من نسخ درجات عشوائية. Culori يولّد تدرجات OKLCH ومكمّلات الفصل لكل وضع.
4. لا تضف نمط شريحة جديداً لتخصيص اللون. نطاق الفصل `<article>` في `SlideScreen` يوفّر متغيرات `--chapter-*` للمحتوى الداخلي.
5. اجعل `branding` اختيارياً. عند استعمال شعار حقيقي حدّد `logoSrc` محلياً و`logoAlt` وصفياً؛ العلامة `Landmark` الافتراضية مجرد مكان شاغر، وليست شعار جامعة.

## RTL وإتاحة الوصول

- لا تستخدم `letter-spacing` للعربية. اترك `dir="rtl"` على العرض، واعزل الشفرة أو الصيغ LTR فقط عند الحاجة.
- اختر خلفية منخفضة التباين خلف النص، ولا تضع زخارف فوق طبقة المحتوى. استخدم اللون المتباين الذي تنتجه اللوحة لنص شارة الفصل.
- حافظ على `prefers-reduced-motion`: aurora تتوقف، والخلفيات الأخرى ثابتة. تجنّب الوميض/الحركة السريعة.
- الرأس والذيل ثابتان داخل `presentation-shell` ولا يغطّيان المحتوى أو شريط التحكم؛ اختبر الشاشات الصغيرة وملء الشاشة.
- اترك `branding` غير معرّف في قالب فارغ؛ لا تملأ اسماً أو شعاراً أو ذيلاً من عندك.

## التحقق

- اعرض `/?lab=themes` وبدّل الأوضاع والخلفيات.
- اختبر palette من عدة درجات، ولوناً غير صالح كحالة fallback، ونص الشعار البديل.
- شغّل `npx vitest run src/components/themes/themes.test.tsx` ثم `npm run check` و`git diff --check`.
- لا تثبّت حزم ألوان إضافية: `culori@4.0.2` MIT موجودة؛ TypeScript يستخدم `@types/culori@4.0.1` MIT.
