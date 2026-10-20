# العرض السينمائي ثلاثي الأبعاد — 3D Website Flyover & Cinematic Showreel

حزمة تحوّل صفحة هبوط حقيقية (أو تجريبية) إلى **مشهد WebGL2 ثلاثي الأبعاد** بكاميرا متحركة:
طبقات الصفحة تفصلها مسافات عمق، البطاقات ترتفع، الظلال ناعمة، عمق الميدان يبدّل التركيز،
ثم يحدث **انتقال سينمائي** إلى بطاقة ختامية تحمل اسم العلامة وعبارة تتحرك كلمةً كلمة.

- **الرابط**: `/?lab=cinematic` — أو مع طبقات Playwright: `/?lab=cinematic&captures=/captures/landing/manifest.json`
- **الكود**: `src/cinematic/` (المحرّك) + `src/components/cinematic/` (الواجهة) + `scripts/capture-landing.mjs`
- **الاختبارات**: `src/__tests__/cinematic.test.ts` (22) و`src/__tests__/cinematic-ui.test.tsx` (11)

---

## 1. ما يراه المشاهد

| المرحلة | الزمن | ما يحدث |
|---|---|---|
| **التحليق** | `0 → 0.84` | كاميرا على مسار Catmull-Rom تقترب من الصفحة؛ كل طبقة تتحرك بسرعة مختلفة (parallax)، البطاقات والشعارات ترتفع مع تتابع وميل خفيف، والإضاءة/الظلال تُحسب لكل طبقة. |
| **الانتقال** | `0.84 → 1` | تتلاشى الصفحة في خلفية البطاقة الختامية تدريجياً مع تعتيق عام وتعتيم أطراف. |
| **الختام** | `1` | بطاقة دوم (نصّ حادّ) فوق خلفية WebGL: شعار، اسم العلامة، خط فاصل، ثم العبارة تُكشف كلمةً كلمة، ثم شكراً وزر إعادة. |

في كل لحظة تظهر شارة داخل المشهد: المرحلة، الزمن، أبعاد الصفحة المثبتة، FOV، و`t`.

---

## 2. البنية

```
src/cinematic/
├── types.ts       # كل العقود: PageDimensions, CaptureLayer, CameraKeyframe, DepthConfig,
│                  #   DepthOfFieldConfig, LightingConfig, FinalCardConfig, FlyoverConfig, FlyoverHandle
├── camera.ts      # تقييم المسار (Catmull-Rom + تخفيف سينمائي)، مسارات جاهزة، العمق والـ parallax، المراحل
├── shaders.ts     # مظللات GLSL ES 3.00: scene / shadow / particles / post / final card
├── renderer.ts    # FlyoverRenderer: تهيئة WebGL2، نُسج، FBO للمعالجة اللاحقة، دورة الرسم
├── capture.ts     # عقود الالتقاط + مولّد طبقات تجريبي + قراءة manifest.json + التقاط من DOM
├── utils.ts       # مصفوفات 4×4، lookAt/perspective، letterbox، تحويل الإحداثيات، ألوان، زمن
└── landing.ts     # رسم صفحة هبوط تجريبية كاملة (canvas 2D) كطبقات جاهزة للمشهد

src/components/cinematic/
├── FlyoverCanvas.tsx     # مسرح WebGL + حلقة زمن + FlyoverHandle (تشغيل/مسح/التقاط إطار)
├── CameraControls.tsx    # لوحة حيّة: المسار، النقاط، السرعة، العمق، DoF، الإضاءة، الختام
├── ShowreelControls.tsx  # شريط المشغّل: مسح زمني بدقة 0.25s، سرعة، تكرار، ملء شاشة
├── FrameStrip.tsx        # معاينة الإطارات عند نقاط محددة + تنزيل
├── FinalCard.tsx         # البطاقة الختامية (دوم) بكشف الكلمات
└── CinematicShowreel.tsx # الصفحة الكاملة (وCinematicLab لـ ?lab=cinematic)
```

**قاعدة الفصل**: React يدير الزمن والواجهة فقط؛ كل حالة WebGL والرسم داخل `FlyoverRenderer`.
لا إعادة تهيئة للمشهد عند تغيير إعداد — فقط `renderer.setConfig(config)`.

---

## 3. الاستعمال المباشر

```tsx
import { useRef } from 'react';
import { CinematicShowreel } from '@/components/cinematic';

export function Page() {
  return (
    <CinematicShowreel
      // طبقات جاهزة (اختياري) — وإلا تُولَّد صفحة تجريبية تلقائياً
      // layers={capture.layers}
      // manifestUrl="/captures/landing/manifest.json"
      initialConfig={{
        speed: { duration: 22, multiplier: 1 },
        depth: { scale: 1.1, perspective: 900, range: 1, parallaxStrength: 0.7, cardLift: 34, cardTilt: 5, cardStagger: 0.09 },
        finalCard: { brand: 'اسم العلامة', tagline: 'عبارة تترك أثراً', transition: 'parallax', transitionDuration: 1.3 },
      }}
    />
  );
}
```

أو المسرح وحده:

```tsx
const stage = useRef<FlyoverHandle>(null);

<FlyoverCanvas layers={layers} config={config} playing={playing} onTime={(s, tl) => setTime(s)} />

stage.current?.play();
stage.current?.seekTo(9.5);         // ثوانٍ
stage.current?.seekT(0.42);         // نسبة 0..1
const png = stage.current?.captureFrame();
const thumb = await stage.current?.getFrameAt(12, 640); // لا يشغّل الحركة
```

### `FlyoverHandle`

| الدالة | الوظيفة |
|---|---|
| `play/pause/toggle/restart` | تحكم التشغيل |
| `seekTo(seconds)` / `seekT(t)` | مسح دقيق (يوقف الحركة عند الإطار المطلوب) |
| `getTimeline()` | `{ currentTime, t, phase, playing, progress }` |
| `captureFrame()` | PNG كامل الدقة من الـ canvas الحالي |
| `getFrameAt(seconds, maxWidth=640)` | يُصيّر إطار الزمن المطلوب (دون تشغيل) ويعيده JPEG/PNG |
| `canvas` / `isReady` | مرجع الـ canvas وجاهزية المشهد |

---

## 4. الإعدادات (`FlyoverConfig`)

| الحقل | الافتراضي | الأثر |
|---|---|---|
| `dimensions` | `1440×900 @1` | **الأبعاد المثبتة**: كل الطبقات تُحسب نسبةً إليها؛ تمنع تذبذب الإطار |
| `camera.preset` | `flyover` | `flyover · orbit · dolly · crane · lateral · custom` |
| `camera.keyframes[]` | 6 نقاط | `t`, `position[x,y,z]`, `target[x,y,z]`, `fov`, `roll`, `speed` |
| `camera.easing` | `cinematic` | `linear · easeIn · easeOut · easeInOut · cinematic` (رتيب بلا قفزات) |
| `camera.handheld` | — | `{ amount, frequency }` تذبذب كاميرا محمولة |
| `speed.duration` | `18` | المدة الكلية (ثوانٍ) — الانتقال يبدأ عند 84% منها |
| `speed.multiplier` | `1` | مضاعف سرعة التشغيل |
| `speed.pauses[]` | — | `{ at, for }` وقفات مبرمجة |
| `depth.scale/range` | `1 / 1` | قوة فصل الطبقات في المحور Z |
| `depth.parallaxStrength` | `0.65` | مقدار انزياح الطبقات مع حركة الكاميرا |
| `depth.cardLift` | `28` | ارتفاع البطاقات/الصور/الشعارات |
| `depth.cardTilt` | `4` | ميل البطاقة عند الرفع (درجات) |
| `depth.cardStagger` | `0.08` | تتابع الرفع بين الطبقات |
| `dof` | مفعّل | `focusDistance`, `focusRange`, `intensity`, `maxBlur` — 12 عينة bokeh لكل طبقة |
| `lighting` | ناعم | `ambient`, `directional`, `fill`, `softShadows`, `shadowDarkness`, `shadowBlur` |
| `finalCard` | هوية | `brand`, `tagline`, `logoSrc`, `background`, `transition`, `transitionDuration` |
| `loop` / `autoplay` | `false / true` | إعادة تلقائية / بدء فوري |
| `respectReducedMotion` | `true` | تقليل parallax والرفع والجزيئات والضبابية وvignette عند `prefers-reduced-motion` |

كل هذه الحقول قابلة للتعديل من **لوحة الكاميرا** في الصفحة، وتُطبَّق حياً.

### تثبيت أبعاد الصفحة

`computeLetterbox(containerW, containerH, pageW, pageH)` يحسب مستطيل العرض مع الحفاظ على النسبة.
المسرح يستعمل `aspect-ratio` في CSS + `ResizeObserver` داخلي، والـ canvas يُعاد ضبط دقته عند تغيّر الحاوية فقط —
فلا تتغيّر مصفوفة الإسقاط أثناء الطيران.

---

## 5. الالتقاط الحقيقي بـ Playwright

### التثبيت (اختياري وقت الحاجة فقط)

```bash
npm i -D playwright
npx playwright install chromium
```

### الالتقاط

```bash
# الصفحة التجريبية/الخادم المحلي
npm run dev
npm run capture -- --url http://localhost:5173 --out public/captures/landing --fullPage

# أو موقع حقيقي
npm run capture -- --url https://example.com --out public/captures/landing --width 1440 --height 900 --dpr 2 --delay 1200
```

السكربت (`scripts/capture-landing.mjs`) ينفّذ فوريّة `page.screenshot({ fullPage: true })` ثم يلتقط كل عنصر مطابق للمحددات وحده
عبر `locator.screenshot()`، ويسجّل `bounds` و`depth` في `manifest.json`:

```json
{
  "dimensions": { "width": 1440, "height": 900, "devicePixelRatio": 2, "letterbox": true },
  "url": "https://example.com",
  "capturedAt": "2026-10-20T10:00:00.000Z",
  "fullPageFile": "full.png",
  "layers": [
    { "id": "card-0", "kind": "card", "file": "card-0.png",
      "bounds": { "x": 120, "y": 640, "width": 390, "height": 250 },
      "depth": 0.75, "liftable": true, "selector": ".card" }
  ]
}
```

### المحددات المدعومة

| السمة | النوع | العمق |
|---|---|---|
| `[data-flyover="hero"]` / `<header>` | `hero` | 0.15–0.2 |
| `[data-flyover="card"]` / `.card` / `[data-card]` | `card` | 0.7–0.75 (قابلة للرفع) |
| `[data-flyover="image"]` / `img[data-liftable]` | `image` | 0.65–0.72 |
| `[data-flyover="logo"]` | `logo` | 0.85 (قابلة للرفع) |

أضف السمة إلى صفحتك:

```html
<div data-flyover="card">…</div>
<img data-flyover="logo" src="…" />
```

### التحميل في المشهد

```tsx
<CinematicShowreel manifestUrl="/captures/landing/manifest.json" />
```

أو عبر الرابط: `?lab=cinematic&captures=/captures/landing/manifest.json`.

`loadCaptureManifest` يقرأ الملف ويحوّل مسارات الملفات إلى URLs نسبةً إلى مكان `manifest.json`،
ثم تُحمّل النُسج وتُرفع إلى WebGL. لا حاجة لأي خطوة بناء.

> **ملاحظة Git**: `captures/` و`public/captures/` مُستثناة من Git (لقطات ثقيلة). محلياً يخدمها Vite من `public/`.
> للنشر الدائم إمّا تضمّنها (force add) أو ضعها على تخزين خارجي وأعطِ رابط manifest مطلقاً.

### بديل بلا Playwright

`buildDemoLayers()` (في `src/cinematic/landing.ts`) يرسم صفحة عربية كاملة على canvas 2D —
شريط تنقل، بطل + لوحة بيانات، ثلاث بطاقات، شعارات — ويحوّلها إلى طبقات بنفس عقد `CaptureLayer`.
هذا ما يعمل تلقائياً حين لا يوجد manifest، وهو أيضاً مادة الاختبارات.

---

## 6. معاينة الإطارات

`FrameStrip` يطلب من المسرح تصيير إطارات عند نقاط زمنية (`0, 12%, 26%, …, 98%` من المدة) **دون تشغيل الحركة**:

- يوقف الحلقة مؤقتاً، يرسم الإطار المطلوب، ينتظر rAF واحداً، يلتقط، ثم يستعيد التشغيل.
- يصغّر إلى 640px وJPEG 86% لشريط المعاينة (رخصة الذاكرة)، مع تنزيل لكل إطار.
- النقر على أي إطار يمسح الخط الزمني إلى ذلك الزمن.

`getFrameAt` هو نفس المسار برمجياً — مفيد لتوليد storyboard أو صور مصغّرة للـ CMS.

---

## 7. الرياضيات باختصار

- **المسار**: Catmull-Rom يمر بكل نقاط التحكم (مواضع وأهداف) + استيفاء خطي لـ FOV/roll.
- **التخفيف السينمائي**: `0.86 × easeInOutCubic(t) + 0.14 × t` — رتيب، ناعم الطرفين، لا يتوقف في المنتصف.
- **العمق**: `z = (depth − 0.5) × range × 1.2` ثم تعويض منظور `(D_ref − z) / D_ref`
  حتى تبقى الطبقات متحاذية كصفحة واحدة عند بداية التحليق، ثم يظهر العمق تدريجياً مع اقتراب الكاميرا.
- **DoF**: `CoC = smoothstep(range×0.45, range, |depth − focus|) × intensity × maxBlur`
  والتركيز نفسه يتحرك قليلاً مع تقدّم الطيران (`focusDistance + (t−0.5)×0.22`).
- **الظل**: مستطيل نصف قطري أسفل البطاقة بمقدار يتناسب مع ارتفاع الرفع، ويُخفَّف مع `shadowBlur`.
- **المعالجة اللاحقة**: FBO → vignette + grain + انحراف لوني عند الأطراف + bloom تقريبي.

---

## 8. الأداء والوصول

- **حلقة واحدة** `requestAnimationFrame`، وتتوقف عند الإيقاف (إطار واحد فقط عند المسح اليدوي).
- دقة الـ canvas = حجم الحاوية × `devicePixelRatio` بحد أقصى 2، والمعالجة اللاحقة على FBO واحد.
- الطبقات تُحمَّل مرة واحدة؛ تغيير الإعداد لا يعيد بناء النُسج.
- `prefers-reduced-motion`: تقليل parallax (×0.3)، إلغاء الرفع والجزيئات والحبيبات، وتخفيف DoF والـ vignette.
- نصوص البطاقة الختامية **دوم** لا canvas → تُقرأ بوضوح، قابلة للنسخ، وتحترم قارئ الشاشة (`aria-label`).
- العربية تتحرك **بالكلمات** فقط في `FinalCard` — لا تقسيم حروف ولا `letter-spacing` (اتساقاً مع قواعد القالب).
- اختصارات: `Space` تشغيل/إيقاف، `←/→` ±0.25s، `R` إعادة، `F` ملء الشاشة.

---

## 9. الاختبارات

```bash
npm test -- cinematic
```

تغطي:
- مسارات جاهزة (بداية 0 ونهاية 1)، تطابق الطرفين، قص الزمن، رتابة التخفيف، التذبذب المحمول.
- المراحل، عمق الطبقات، letterbox (أفقي/عمودي)، تحويل البounds إلى مشهد، المصفوفات، الألوان، الزمن.
- الطبقات التجريبية: العدد، الترتيب بالعمق، القابلية للرفع، البقاء داخل أبعاد الصفحة.
- واجهات: البطاقة الختامية (كشف الكلمات، الشعار البديل)، لوحة الكاميرا، شريط التحكم، شريط الإطارات، المسرح، الصفحة الكاملة.

---

## 10. حدود معروفة

- يحتاج **WebGL2**؛ عند غيابه يظهر تنبيه واضح داخل المسرح بدل شاشة سوداء.
- الالتقاط الحقيقي يحتاج `playwright` + Chromium (غير مثبتين في `package.json` لتخفيف الحزمة)؛ البديل التجريبي يعمل دون أي تثبيت.
- نصوص الصفحة الملتقطة صورٌ نقطية — لا تُترجم ولا تُقرأ؛ تُقرأ فقط بطاقة الختام (دوم).
- `page.screenshot` للعناصر قد يخفق مع العناصر `position: fixed` أو المتحركة؛ جمّد الحركة (`--delay`) أو استخدم `data-flyover` على عناصر ثابتة.
- حتى 5–8 طبقات مثالية للأداء؛ الطبقات الأكثر تُدمج في خلفية واحدة.
