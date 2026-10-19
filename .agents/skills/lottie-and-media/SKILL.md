---
name: lottie-and-media
description: Add Lottie animations, lazy images, RTL galleries, zoom/pan interactions, device-frame screenshots and local/YouTube video to slides. Covers asset placement, blur placeholders, file-weight rules, licenses, ReactPlayer and active-slide playback. Use whenever a slide needs an illustration, screenshot, animated icon, or video. إضافة رسوم Lottie والصور والفيديو للشرائح.
metadata:
  short-description: Lottie والصور والمعارض والفيديو وإطارات الأجهزة
---

# Lottie والصور والفيديو

اقرأ [دليل الصور والفيديو](../../../docs/MEDIA.md) وحدّث القواعد هناك إذا تغيّرت الواجهة أو حدود الأوزان. المختبر الحي: `/?lab=media`.

## مكان الأصول والأوزان

| النوع | المكان | الاستخدام |
|---|---|---|
| Lottie صغير (<300KB) | `src/assets/lottie/<name>.json` | `import anim from '@/assets/lottie/name.json'` → `LottiePlayer src={anim}` |
| صور، لقطات، SVG، ملصقات، وفيديو صغير | `public/media/…` | مسار `/media/...` إلى `MediaImage`/`MediaVideo`؛ `resolveMediaUrl()` يراعي GitHub Pages `BASE_URL` |
| لقطة جهاز جديدة | `public/media/screens/…` | `DeviceFrame device="browser|phone|tablet"` |

قواعد الحجم: صور WebP/AVIF ≤250KB مستهدفة و500KB حد معتاد؛ SVG ≤100KB؛ فيديو MP4/H.264 محلي ≤20 ثانية و5MB؛ ملصق ≤100KB؛ و`blurDataURL` ≤1KB. استضف ما زاد عن 5MB أو طال على YouTube/CDN. مجموع الصور الظاهرة في الشريحة ≤1MB. لا تودع Lottie أكبر من 1MB في Git. القواعد الكاملة في `public/media/README.md` و`docs/MEDIA.md`.

## صور lazy وضبابية

```tsx
import { MediaImage, ZoomImage, PanZoomImage } from '@/components/media';

<MediaImage
  src="/media/screens/dashboard.webp"
  alt="لوحة تحكم تعرض مؤشرات المخزون"
  width={1600}
  height={900}
  blurDataURL="data:image/webp;base64,…" // اختياري، ≤1KB
/>

<ZoomImage src="/media/screens/dashboard-small.webp" zoomSrc="/media/screens/dashboard.webp" alt="لوحة التحكم" />
<PanZoomImage src="/media/diagrams/architecture.svg" alt="مخطط البنية" viewerHeight={480} />
```

- `MediaImage` يستخدم `loading="lazy"`, `decoding="async"`، ويقبل `aspectRatio` أو `width`/`height` لحجز مكان الصورة قبل اكتمالها. لا يحتاج إلى المكتبة الخارجية.
- `ZoomImage` يضيف زر تكبير/إغلاق متاحاً، ويفصل `react-medium-image-zoom` (BSD-3-Clause) وCSS في chunk كسول.
- `PanZoomImage` يدعم السحب/اللمس والعجلة وأزراراً عربية، ويحمّل `react-zoom-pan-pinch` (MIT) كسولاً.
- `alt` عربي وصفي إلزامي؛ للصورة الزخرفية استخدم `alt=""`. لا تترك صورة كبيرة بلا `aspectRatio` أو أبعاد إذا كان ذلك يسبب قفز التخطيط.
- المسارات المحلية تبدأ بـ`/media/...`; URLs وdata/blob URLs تمرّ كما هي. لا تستعمل `localhost` في أصل سيُعرض للمستخدم.

## المعرض وإطارات الأجهزة

```tsx
import { DeviceFrame, MediaGallery } from '@/components/media';

<MediaGallery direction="rtl" zoomable items={[
  { src: '/media/screens/step-1.webp', alt: 'الخطوة الأولى', caption: 'إعداد الطلب' },
  { src: '/media/screens/step-2.webp', alt: 'الخطوة الثانية', caption: 'مراجعة النتيجة' },
]} />

<DeviceFrame
  device="phone" // browser | phone | tablet
  src="/media/screens/mobile.webp"
  alt="لقطة شاشة تطبيق الهاتف"
  caption="نسخة الهاتف"
/>
```

`MediaGallery` RTL افتراضياً، يدعم اللمس والأسهم والنقاط، ويخفض حركة الانتقال مع `prefers-reduced-motion`. الصور lazy، والتكبير اختياري. `DeviceFrame` يحجز النسب 16:9 للمتصفح، 9:19.5 للهاتف، و4:3 للوحّي. إطارات `Safari` و`Iphone` القديمة ما زالت متاحة في `@/components/gallery`؛ استخدم `DeviceFrame` عند الحاجة إلى تحميل كسول وسلوك صورة متوافق مع هذه القواعد.

## فيديو محلي أو YouTube

```tsx
import { MediaVideo } from '@/components/media';

<MediaVideo src="/media/video/demo.mp4" poster="/media/posters/demo.webp" label="عرض المنتج" />
<MediaVideo src="https://www.youtube.com/watch?v=VIDEO_ID" />
```

`react-player` v3 (MIT) يستخدم `src` و`playing` ويدعم React 19. يبدأ `MediaVideo` عند دخول الشريحة (الافتراضي `autoPlay={true}` و`muted={true}`)، ويتوقف فور مغادرتها. لا تعتمد على unmount: `Presentation` يحدّث `ActiveSlideIdContext`، و`SlideScreen` يقدّم نشاطاً خاصاً لمحتوى الشريحة. هذا مهم لأن `AnimatePresence mode="wait"` يُبقي الشريحة الخارجة مركّبة أثناء حركتها. يصبح الفيديو غير نشط فور التنقل إلى أي شريحة أخرى أو خريطة/خاتمة، ويُفرض `playing={false}` ويُستدعى `pause()`.

- اترك الصوت مكتوماً للتشغيل التلقائي؛ اجعل `controls` ظاهرة (افتراضياً) أو استخدم `autoPlay={false}` للتشغيل اليدوي.
- `active={false}` متاح للتجاوز في المعاينات المستقلة؛ خارج العرض النشط افتراضياً.
- لا تضع عدة فيديوهات autoplay على شريحة واحدة. استخدم `poster`، اضغط الملف، واستضف الطويل/الكبير خارج Git.
- لا تستخدم `<video autoPlay>` مباشرة في إطارات Safari/Iphone القديمة؛ سلوكها الحالي غير مربوط بدورة حياة شريحة العرض.

## LottiePlayer

```tsx
import { LottiePlayer } from '@/components/effects';
import success from '@/assets/lottie/success.json';

<LottiePlayer src={success} loop={false} className="h-56 w-56" />
<LottiePlayer src="/media/lottie/data-flow.json" speed={0.8} className="h-72 w-full" />
```

- `loop={false}` للأيقونة التعبيرية، و`true` للزخرفة الهادئة؛ الحجم دائماً بـ`className`.
- يُحمّل `lottie-web` كسولاً. لا تستخدم Lottie كزينة بلا معنى، ولا تضمّن صوراً نقطية Base64 داخل JSON.
- احترم `prefers-reduced-motion`: أوقف الرسوم الزخرفية أو اجعلها ساكنة. الحركة ليست بديلاً عن شرح الفكرة.

## التحقق قبل التسليم

1. استخدم المكتبات المثبتة فقط: `react-medium-image-zoom` (BSD-3)، `react-zoom-pan-pinch` (MIT)، `embla-carousel-react` (MIT)، `react-player` (MIT)، و`lottie-react`.
2. حافظ على RTL، alt عربي، أبعاد محجوزة، lazy loading، وأوزان `docs/MEDIA.md`.
3. تحقق أن الفيديو يتوقف عند مغادرة الشريحة، بما في ذلك أثناء `AnimatePresence` exit.
4. لا تغيّر شرائح العرض العشر لمجرد إدخال صورة/فيديو؛ ركّب المكوّن داخل محتوى الشريحة المناسب.
5. شغّل `npm run check` وافتح `/?lab=media` لمراجعة التكبير، السحب، الإطارات، ومسار YouTube/الملف المحلي عند توفّره.
