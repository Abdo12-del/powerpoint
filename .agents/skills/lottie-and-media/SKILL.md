---
name: lottie-and-media
description: Add Lottie animations, images, video, screenshots and device mockups to slides — sourcing free Lottie JSON (LottieFiles, licenses), placing assets (src/assets vs public), LottiePlayer usage and sizing, lazy loading, recoloring, dotLottie/Rive alternatives, autoplay muted video, Safari/Iphone frames and ImageComparison. Use whenever a slide needs an illustration, animated icon, screenshot, or video. إضافة رسوم Lottie والوسائط للشرائح.
metadata:
  short-description: Lottie والصور والفيديو وإطارات الأجهزة داخل الشرائح
---

# Lottie والوسائط

## أين توضع الملفات
| النوع | المكان | الاستيراد |
|---|---|---|
| Lottie JSON صغير (< 300KB) | `src/assets/lottie/<name>.json` | `import anim from '@/assets/lottie/<name>.json'` → `src={anim}` |
| Lottie كبير / فيديو / صور كثيرة | `public/media/…` | `src="/media/<name>.json"` أو `<img src="/media/x.png">` |
| لقطات شاشة التطبيق | `public/screens/` | `Safari imageSrc="/screens/dashboard.png"` |

لا تضف إلى Git ملفات > 1MB بلا ضرورة (فيديو خاصة) — استعمل روابط أو `public/` مع ذكرها في README الخاص بالعرض.

## LottiePlayer (مغلّف كسول)
```tsx
import { LottiePlayer } from '@/components/effects';
import success from '@/assets/lottie/success.json';

<LottiePlayer src={success} loop={false} className="h-56 w-56" />
<LottiePlayer src="/media/data-flow.json" speed={0.8} className="h-72 w-full" />
```
- `loop`: `false` للأيقونات التعبيرية (تشغيل مرة)، `true` للزخارف الهادئة.
- الحجم بـ `className` دائماً (الافتراضي 12rem).
- lottie-web يُحمَّل كسولاً (≈ 300KB مرة واحدة) — أول شريحة تستعمله قد تتأخر 100–300 مللي ثانية؛ ضعه بعد `BlurFade delay={0.2}`.
- تحكم متقدم (تشغيل عند حدث، مقاطع إطارات): `import { useLottie } from 'lottie-react'`.

## اختيار ملفات Lottie
1. المصدر: lottiefiles.com (فلتر Free) — تحقق من الرخصة (Lottie Simple License تسمح بالاستعمال التجاري مع منع إعادة البيع).
2. الأسلوب: خطّي/مسطّح بلون أو لونين يطابق لوحة القالب (كهرماني `#fbbf24`، سماوي `#38bdf8`، أبيض على داكن). تجنّب الرسوم بخلفية بيضاء صلبة.
3. المدة: 1–3 ث للتعبيرية، حلقات ≤ 6 ث للزخرفية.
4. إعادة التلوين: عدّل قيم `"c":{"k":[r,g,b,1]}` في JSON (قيم 0–1) أو استعمل محرّر LottieFiles قبل التنزيل.
5. الحجم: صدّر بدون صور نقطية مضمّنة (`assets` فارغة)؛ احذف الطبقات غير المستعملة.

## بدائل
- **dotLottie** (`.lottie` مضغوط): `npm i @lottiefiles/dotlottie-react` → `<DotLottieReact src="/media/x.lottie" loop autoplay />` (غير مثبت افتراضياً).
- **Rive** (تفاعلي وأخف): `npm i @rive-app/react-canvas` → `useRive({ src: '/media/x.riv', autoplay: true })`.
- أيقونات lucide متحركة بـ framer-motion (`motion(Icon)`) تكفي غالباً بدل Lottie لأيقونة واحدة.

## الصور ولقطات الشاشة
```tsx
import { Safari, Iphone, BlurFade, ImageComparison, ImageComparisonImage, ImageComparisonSlider } from '@/components/gallery';

<BlurFade delay={0.3} inView={false}>
  <Safari url="app.example.dz" imageSrc="/screens/dashboard.png" className="w-full" />
</BlurFade>

<Iphone src="/screens/mobile.png" className="h-[480px]" />

<ImageComparison className="aspect-video rounded-2xl" dir="ltr">
  <ImageComparisonImage src="/screens/before.png" alt="قبل" position="left" />
  <ImageComparisonImage src="/screens/after.png" alt="بعد" position="right" />
  <ImageComparisonSlider className="w-1 bg-amber-400" />
</ImageComparison>
```
- لقطات بنسبة 16:10 (Safari) أو 9:19.5 (Iphone)؛ ضغط WebP ≤ 300KB.
- `alt` عربي وصفي دائماً.

## الفيديو
```tsx
<video src="/media/demo.mp4" autoPlay muted loop playsInline className="w-full rounded-2xl" />
```
- `muted` إلزامي للتشغيل التلقائي. ≤ 20 ث، H.264، ≤ 5MB. لا صوت في العروض (المُقدِّم يتكلم).
- `Safari videoSrc` / `Iphone videoSrc` لعرض الفيديو داخل إطار جهاز.

## قواعد
- وسيلة بصرية واحدة لكل شريحة (Lottie **أو** لقطة **أو** فيديو).
- الرسوم تدعم الفكرة ولا تزيّن فقط — إن لم تشرح شيئاً فاحذفها.
- احترم `prefers-reduced-motion`: Lottie زخرفي → `autoplay={!prefersReducedMotion()}`.
