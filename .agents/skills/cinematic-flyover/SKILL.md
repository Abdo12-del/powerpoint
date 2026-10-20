---
name: cinematic-flyover
description: Build or customize a 3D website flyover / cinematic showreel from a landing page (Playwright capture → WebGL2 scene → camera flyover → final brand card). Use when asked for "3D website flyover", "cinematic showreel", "page flythrough", "parallax depth scene", "camera path", or "frame preview / storyboard". Arabic-first and RTL-safe. عرض سينمائي ثلاثي الأبعاد لصفحة هبوط بكاميرا متحركة وبطاقة ختامية.
metadata:
  short-description: العرض السينمائي ثلاثي الأبعاد — التقاط، كاميرا، عمق، ختام
---

# العرض السينمائي ثلاثي الأبعاد (Cinematic Flyover)

حزمة جاهزة في القالب: `src/cinematic/` (المحرّك) + `src/components/cinematic/` (الواجهة) + `scripts/capture-landing.mjs`.
الدليل الكامل: `docs/CINEMATIC_FLYOVER.md`. المختبر: `/?lab=cinematic`.

## متى تستعملها

| الطلب | المكوّن |
|---|---|
| «حوّل صفحة الهبوط إلى مشهد ثلاثي الأبعاد» | `CinematicShowreel` (طبقات Playwright أو تجريبية) |
| «أضف العرض إلى شريحة/صفحة أخرى» | `<FlyoverCanvas layers config />` + `FlyoverHandle` |
| «معاينة إطارات/storyboard» | `FrameStrip` أو `getFrameAt(t)` |
| «بطاقة ختامية باسم العلامة» | `FinalCard` + `config.finalCard` |
| «كاميرا أبطأ/أعمق/أقرب» | لوحة `CameraControls` أو `FlyoverConfig` مباشرة |

## خطوات التنفيذ

1. **حدّد المصدر**
   - صفحة حقيقية: `npm i -D playwright && npx playwright install chromium` ثم
     `npm run capture -- --url <URL> --out public/captures/landing --fullPage`
     (أضف `data-flyover="hero|card|image|logo"` إلى عناصر الصفحة لضبط الطبقات).
   - بلا Playwright: `buildDemoLayers()` تولّد صفحة عربية كاملة على canvas.
2. **اضبط الهوية**: `finalCard.brand` و`finalCard.tagline` (عربية، قصيرة) و`logoSrc` إن وُجد.
3. **اختر المسار**: `generatePresetPath('flyover' | 'orbit' | 'dolly' | 'crane' | 'lateral')`
   أو حرّر `keyframes` (`t`, `position`, `target`, `fov`, `roll`).
4. **اضبط العمق**: `depth.parallaxStrength` (0.4–0.9)، `cardLift` (20–45)، `cardStagger` (0.05–0.12).
5. **عمق الميدان**: `dof.focusRange` أوسع = أوضح؛ `intensity` 0.4–0.8؛ أوقفه للعروض الرسمية الصارمة.
6. **المدة**: 14–24 ث للعرض التعريفي؛ الانتقال يبدأ عند 84% تلقائياً.
7. **شغّل** `npm run check` واختبر `?lab=cinematic` + `FrameStrip` (9 إطارات تكفي للـ storyboard).

## القواعد

- **الأبعاد مثبتة**: لا تتلاعب بأبعاد الصفحة أثناء الطيران؛ غيّر `config.dimensions` فقط قبل التشغيل.
- **النص العربي في DOM لا في canvas**: البطاقة الختامية تكشف العبارة **كلمةً كلمة** — لا تقسيم حروف ولا `letter-spacing`.
- **مؤثر واحد مهيمن**: المشهد نفسه هو المؤثر؛ لا تضف جسيمات/confetti فوق الختام.
- **احترم `prefers-reduced-motion`**: أبقِ `respectReducedMotion: true` (يخفّض parallax والرفع والجزيئات).
- **الأداء**: 5–8 طبقات، دقة قصوى 2× DPR، ولا تعِد تهيئة المصيّر عند تغيير إعداد (يكفي `setConfig`).
- **الأصول الثقيلة خارج Git**: `captures/` و`public/captures/` مستثناة.
- **الوصول**: `aria-label` على المسرح، أزرار بأسماء، اختصارات Space/←/→/R/F.

## واجهات سريعة

```tsx
const stage = useRef<FlyoverHandle>(null);
<FlyoverCanvas ref={stage} layers={layers} config={config} playing={playing} onTime={(s, tl) => …} />
stage.current?.seekTo(9.5);
stage.current?.seekT(0.42);
const thumb = await stage.current?.getFrameAt(12, 640); // لا تشغّل الحركة
const png = stage.current?.captureFrame();
```
