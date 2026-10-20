# مهارة: العرض السينمائي ثلاثي الأبعاد (Cinematic Flyover)

## متى تُستعمل

عندما يطلب المستخدم: تحويل صفحة هبوط إلى مشهد ثلاثي الأبعاد، كاميرا متحركة باستمرار، Depth of Field، Parallax، رفع البطاقات، إضاءة وظلال، انتقال سينمائي إلى بطاقة ختامية.

## المختبر

```
http://localhost:5173/?lab=flyover
http://localhost:5173/?lab=cinematic
```

## الوصفة السريعة

### 1. التقاط الطبقات (اختياري — وضع تجريبي بدونها)

```bash
npm i -D playwright && npx playwright install chromium
node scripts/capture-flyover.mjs --url http://localhost:5173 --out public/cinematic
```

### 2. مكون الشريحة

```tsx
import { FlyoverScene } from '@/components/cinematic/FlyoverScene';

content: <FlyoverScene brand="اسم العلامة" tagline="العبارة المتحركة" />
```

### 3. مكون WebGL2 المباشر

```tsx
import { FlyoverCanvas } from '@/cinematic/flyover/FlyoverCanvas';

<FlyoverCanvas demo autoPlay frameAt={5.2} config={{ speed: 1.2, depthIntensity: 0.9, aperture: 0.045 }} />
```

### 4. التحكم الدقيق

```ts
import { useFlyoverTimeline } from '@/cinematic/flyover/useFlyoverTimeline';
const tl = useFlyoverTimeline();
tl.setSpeed(1.5);
tl.setDepth(0.9);
tl.goToPreview(3); // إطار 8s
tl.seekProgress(0.5);
```

## القواعد

- الأبعاد مثبتة: `1920×1080 @2x` (في `src/cinematic/types.ts`)
- Fallback تلقائي إلى CSS 3D عند عدم توفر WebGL2
- بطاقة الختام تُظهر `brand` + `tagline` المتحركة في الثواني الأخيرة
- الدليل الكامل: `docs/CINEMATIC_FLYOVER.md`
