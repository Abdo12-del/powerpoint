# العرض السينمائي ثلاثي الأبعاد — 3D Website Flyover & Cinematic Showreel

> Playwright لالتقاط صفحة الهبوط وطبقاتها → WebGL2 لمشهد ثلاثي الأبعاد بكاميرا متحركة باستمرار، مع Depth of Field وParallax ورفع البطاقات، إضاءة وظلال ناعمة، وانتقال سينمائي إلى بطاقة ختامية.

## المختبر الحي

```bash
npm run dev
# افتح:
# http://localhost:5173/?lab=flyover
# أو
# http://localhost:5173/?lab=cinematic
```

## ما الذي يفعله؟

| المرحلة | الأداة | التفاصيل |
|---------|--------|----------|
| **الالتقاط** | Playwright | يثبّت الأبعاد عند `1920×1080 @2x`، يلتقط الصفحة كاملة + كل طبقة بشفافية (`background`, `hero`, `card`, `image`, `logo`)، ويصدّر `public/cinematic/manifest.json` |
| **المشهد ثلاثي الأبعاد** | WebGL2 | شيدرات vertex/fragment: Depth of Field (9-tap blur حسب المسافة عن المستوى البؤري)، Parallax، رفع البطاقات مع تموج، إضاءة Blinn-Phong، ظلال ناعمة PCF |
| **الكاميرا** | Catmull-Rom spline | مسار منحني من 7 نقاط تحكم، سرعة قابلة للتعديل، زاوية ميل (roll)، وتغيير FOV سينمائي مع اهتزاز handheld طفيف |
| **الختام** | CSS + GSAP | في الثواني الأخيرة يخفت المشهد ويظهر كارت الختام مع اسم العلامة وعبارة متحركة (typewriter/glow) |
| **المعاينة** | Frame Preview | شريط زمني + نقاط معاينة عند 0s/2.5s/5s/8s/11s/14s/الختام — انقر للانتقال الفوري، مع تصدير الإطار كـ PNG |

## تثبيت أبعاد الصفحة

```ts
// src/cinematic/types.ts
viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }
```

- يُطبق في Playwright: `browser.newPage({ viewport, deviceScaleFactor })`
- يُطبق في WebGL: نسبة العرض إلى الارتفاع ثابتة في مصفوفة الإسقاط
- يمنع قفزات التخطيط ويضمن سلاسة الحركة (طلب المواصفة)

## التقاط الطبقات (Playwright)

```bash
# تثبيت أول مرة فقط
npm i -D playwright
npx playwright install chromium

# التقاط من الخادم المحلي
npm run capture -- --url http://localhost:5173 --out public/cinematic

# أو مباشرةً
node scripts/capture-flyover.mjs --url http://localhost:5173 --out public/cinematic
```

**المخرجات:**

```
public/cinematic/
├── fullpage.png          # الصفحة كاملة
├── layers/
│   ├── background-0.png  # خلفية
│   ├── hero-0.png        # عنوان البطل
│   ├── card-0.png        # بطاقة 1
│   ├── card-1.png        # بطاقة 2
│   └── logo-0.png        # شعار
└── manifest.json         # وصف الطبقات والعمق والحدود
```

**بدون Playwright:** المشهد يعمل فوراً في وضع تجريبي (demo) — يولّد بطاقات إجرائياً على Canvas بدون الحاجة للالتقاط.

## مشهد WebGL2

### الشيدرات

- **Vertex:** يطبّق Parallax (الطبقات الأبعد أبطأ) + رفع البطاقات (`elevation`) مع تموج جيبي، ويحسب ضباب المسافة
- **Fragment:** عزل Depth of Field (تشويش حسب `|depth - focus| * aperture`)، إضاءة اتجاهية + محیط + specular، ظل ناعم تحت البطاقات المرفوعة، توهج على الحواف

### API

```tsx
import { FlyoverCanvas } from '@/cinematic/flyover/FlyoverCanvas';

<FlyoverCanvas
  demo // بدون التقاط خارجي
  config={{
    duration: 18,
    speed: 1.2,
    depthIntensity: 0.85, // شدة Parallax
    aperture: 0.045,       // فتحة العدسة
    focusDistance: 4.5,
    softShadows: true,
    finale: { brand: 'اسم العلامة', tagline: 'العبارة المتحركة', duration: 3.5 },
    path: [ /* CameraKeyframe[] */ ],
  }}
  frameAt={5.2} // معاينة إطار ثابت عند 5.2s
  autoPlay
/>
```

### Fallback

عند عدم توفر WebGL2 يُعرض بديل CSS 3D بنفس التأثير (parallax + رفع + ظلال) بدون شيدرات.

## كمكون شريحة

```tsx
import { FlyoverScene } from '@/components/cinematic/FlyoverScene';

export const slide: SlideData = {
  id: 'ch1-flyover',
  chapterId: 'ch1',
  title: 'جولة سينمائية',
  icon: Camera,
  archetype: 'relation',
  content: <FlyoverScene brand="قالب العرض" tagline="حكاية تُروى بحركةٍ سينمائية" />,
};
```

## مهارة الوكيل

`.agents/skills/cinematic-flyover/SKILL.md` — يحمّلها Claude Code / Codex تلقائياً.

## الملفات

```
src/cinematic/
├── types.ts                     # العقود والافتراضيات (viewport, config, layers)
├── capture/
│   ├── capture.ts               # captureLayers() + captureLayersFromDOM()
│   └── playwright.config.ts     # إعداد Playwright
├── flyover/
│   ├── shaders.ts               # شيدرات WebGL2 (DOF + إضاءة)
│   ├── camera.ts                # مسار Catmull-Rom + lookAt/perspective
│   ├── layers.ts                # تحويل CapturedLayer → SceneLayer + طبقات تجريبية
│   ├── renderer.ts              # محرك WebGL2 (FlyoverRenderer)
│   ├── FlyoverCanvas.tsx        # مكون React + fallback CSS
│   └── useFlyoverTimeline.ts    # خطاف التحكم بالزمن
├── lab/
│   └── FlyoverLab.tsx           # ?lab=flyover — المختبر الكامل
└── components/cinematic/
    └── FlyoverScene.tsx         # مغلّف شريحة جاهز
scripts/capture-flyover.mjs      # سكربت Node للالتقاط
```
