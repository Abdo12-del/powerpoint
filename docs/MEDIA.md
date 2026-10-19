# الصور والفيديو — Images & Video Toolkit

مكونات وسائط عربية RTL، قابلة للتركيب داخل أي شريحة من الأنماط العشرة من دون إضافة archetype جديد. المختبر التفاعلي: `/?lab=media`. الأصول المحلية في `public/media/` وتُشار بمسارات مثل `/media/screens/dashboard.webp`؛ المساعد `resolveMediaUrl()` يضيف `BASE_URL` تلقائياً كي تعمل المسارات محلياً وعلى GitHub Pages.

## المكونات

| المكوّن | الغرض | الاعتماد |
|---|---|---|
| `MediaImage` | `<img>` كسول، `decoding="async"`، مساحة/نسبة أبعاد اختيارية، تلاشي من خلفية ضبابية أو متدرجة | native |
| `ZoomImage` | تكبير حواري متاح بلوحة المفاتيح، و`zoomSrc` اختياري للنسخة الكبيرة | `react-medium-image-zoom` 5.4.9 — BSD-3-Clause، يدعم React 19 |
| `PanZoomImage` | سحب/تكبير باللمس وعجلة الفأرة وأزرار عربية | `react-zoom-pan-pinch` 4.2.0 — MIT، يدعم React 19 |
| `MediaGallery` | سحب وأزرار ونقاط تنقّل، مع دعم RTL وتقليل الحركة | `embla-carousel-react` 8.6.0 — MIT، يدعم React 19 |
| `DeviceFrame` | لقطة شاشة في إطار متصفح/هاتف/لوحي | محلي + `MediaImage` |
| `MediaVideo` | فيديو محلي أو YouTube؛ يقتصر على هذين المزوّدين لتجنّب حزم لا نحتاجها | `react-player` 3.4.0 — MIT، يدعم React 19 |

المكتبات الأربع المطلوبة مثبتة مباشرة في `package.json`، وملفاتها المعلنة تثبت الرخصة ونطاق React 19 قبل التثبيت. يُنشأ مشغّل ReactPlayer عبر واجهة `createReactPlayer` مع موفّري HTML/YouTube فقط (ومكوّن `youtube-video-element` التابع لـReactPlayer، MIT)، حتى لا تدخل تبعيات HLS/DASH/Mux/Vimeo/Twitch/TikTok/Spotify/Wistia غير المستخدمة في عملية البناء. أجزاء التكبير والتحريك والمعرض والمشغّل تُحمّل كسولاً عند عرضها.

## أمثلة

```tsx
import {
  DeviceFrame,
  MediaGallery,
  MediaImage,
  MediaVideo,
  PanZoomImage,
  ZoomImage,
} from '@/components/media';

<MediaImage
  src="/media/screens/dashboard.webp"
  alt="لوحة تحكم تعرض مؤشرات المخزون"
  width={1600}
  height={900}
  blurDataURL="data:image/webp;base64,…"
  className="rounded-2xl"
/>

<ZoomImage
  src="/media/screens/dashboard-small.webp"
  zoomSrc="/media/screens/dashboard.webp"
  alt="لوحة تحكم تعرض مؤشرات المخزون"
  aspectRatio="16/9"
/>

<PanZoomImage
  src="/media/diagrams/architecture.svg"
  alt="مخطط البنية التقنية"
  viewerHeight={480}
/>

<MediaGallery
  direction="rtl"
  zoomable
  items={[
    { src: '/media/screens/step-1.webp', alt: 'الخطوة الأولى', caption: 'تجهيز البيانات' },
    { src: '/media/screens/step-2.webp', alt: 'الخطوة الثانية', caption: 'مراجعة النتائج' },
  ]}
/>

<DeviceFrame
  device="phone"
  src="/media/screens/mobile.webp"
  alt="لقطة شاشة تطبيق الهاتف"
  caption="نسخة الهاتف"
/>

<MediaVideo
  src="/media/video/short-demo.mp4"
  poster="/media/posters/short-demo.webp"
  label="عرض قصير للمنتج"
/>
```

`aspectRatio` أو `width`/`height` يحجز مساحة قبل اكتمال تحميل الصورة. أرسل `blurDataURL` صغيرة اختيارياً؛ من دونه تظهر خلفية متدرجة. `loading="lazy"` هو الافتراضي، و`loading="eager"` متاح لصورة البطل التي تظهر فوراً. `alt` وصفي بالعربية مطلوب دائماً، أما الصور الزخرفية فقط فاستعمل `alt=""`.

## دورة حياة الفيديو في العرض

لا يعتمد التشغيل على `visibility`, `IntersectionObserver`، أو على فك التركيب وحده. `Presentation.tsx` ينشر معرف الشريحة النشطة عبر `ActiveSlideIdContext`، و`SlideScreen` يغلّف محتوى الشريحة بـ`SlideMediaScope`. يقرأ `MediaVideo` هذا النشاط مباشرةً:

1. عند دخول الشريحة يصبح `playing=true` افتراضياً (ما لم يُضبط `autoPlay={false}`).
2. عند الانتقال لشريحة أخرى أو شاشة الخريطة/الخاتمة، يصبح المصدر غير نشط فوراً: `playing=false` ويُستدعى `pause()` على عنصر الفيديو.
3. يبقى هذا صحيحاً أثناء حركة الخروج؛ لأن `AnimatePresence mode="wait"` يبقي الشريحة المغادرة مركّبة مؤقتاً.
4. خارج العرض، يعمل `MediaVideo` مستقلاً باعتباره نشطاً افتراضياً. يمكن تجاوز السياق بـ`active={false}`، مثلاً لإيقاف معاينة مؤقتة.

```tsx
// يعمل عند دخول الشريحة ويقف عند مغادرتها، بما فيها مرحلة الخروج.
<MediaVideo src="https://www.youtube.com/watch?v=VIDEO_ID" />

// تشغيل يدوي عبر عناصر التحكم فقط.
<MediaVideo src="/media/video/interview.mp4" autoPlay={false} muted={false} />
```

الصوت مكتوم افتراضياً ليسمح للمتصفح بالتشغيل التلقائي؛ أزل `muted` فقط عندما يبدأ المشاهد التشغيل بنفسه. أبقِ عناصر التحكم ظاهرة، وأضف `poster` محلياً للفيديوهات، ولا تضع أكثر من فيديو واحد يشتغل تلقائياً على الشريحة نفسها.

## الأوزان وصيغ الملفات

| الأصل | قاعدة المستودع |
|---|---|
| صورة نقطية (WebP/AVIF/JPEG) | الهدف ≤250KB؛ الحد المعتاد 500KB للصورة الواحدة. لقطة البطل حتى 500KB، وإجمالي الصور المرئية في الشريحة ≤1MB. استخدم WebP/AVIF للصور الفوتوغرافية. |
| SVG | ≤100KB؛ بسّط المسارات، أزل بيانات التحرير غير اللازمة، ولا تضمّن صوراً نقطية Base64. SVG مناسب للشعارات والرسوم/الواجهات المتجهة. |
| فيديو محلي قصير | MP4/H.264 (مع `playsInline`) حتى 20 ثانية و≤5MB داخل Git. اضغطه، واجعل الصوت اختيارياً لا تلقائياً. إن تجاوز 5MB أو طال، استضفه على YouTube أو CDN ولا تودعه في Git. |
| ملصق الفيديو | WebP/JPEG/SVG ≤100KB؛ استخدم `poster` للحالة قبل تشغيل الملف. |
| `blurDataURL` | بيانات معاينة مصغّرة ≤1KB، من دون تضمين النسخة الكاملة؛ يمكن حذفها إذا لم تضف فائدة. |

لا ترفع ملفات وسائط أكبر من 1MB إلى Git إلا فيديو محلياً ضرورياً وضمن سقف 5MB. احذف بيانات EXIF غير المطلوبة واضغط الأصول قبل إضافتها. `public/media/README.md` يحفظ هذه القواعد بجانب الأصول.

## المختبر والاختبارات

- `/?lab=media`: صور SVG محلية، التكبير، التحريك، معرض Embla RTL، إطارات الأجهزة، ومدخل اختياري لفيديو محلي/YouTube.
- اختبارات `src/__tests__/media.test.tsx`: خصائص التحميل الكسول/النص البديل، حل المسار تحت `BASE_URL`، إطارات الجهاز، وإشارة نشاط الشريحة.
- يشمل `npm run check` فحص الأنواع والاختبارات وبناء الإنتاج.
