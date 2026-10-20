import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { applyTypography, warmUpFonts } from '@/fonts';
import { typography } from '@/data/typography';

const root = createRoot(document.getElementById('root')!);
const params = new URLSearchParams(window.location.search);
const lab = params.get('lab');

if (lab === 'fonts') {
  // مختبر الخطوط: ?lab=fonts — كتالوج الخطوط والاقترانات وحركات النص (لا يدخل حزمة العرض)
  const FontLab = lazy(() => import('@/components/typography/FontLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <FontLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'cinematic') {
  // مختبر العرض السينمائي ثلاثي الأبعاد: ?lab=cinematic (اختياري: &captures=/captures/landing/manifest.json)
  const CinematicLab = lazy(() => import('@/components/cinematic/CinematicShowreel'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <CinematicLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'charts') {
  // مختبر الرسوم البيانية: ?lab=charts — الرسوم الحركية والمكتبات الأربع بسمة واحدة (لا يدخل حزمة العرض)
  const ChartLab = lazy(() => import('@/components/charts/lab/ChartLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <ChartLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'flyover') {
  // المختبر السينمائي المستقل: ?lab=flyover — WebGL2 + Playwright (لا يدخل حزمة العرض)
  const FlyoverLab = lazy(() => import('@/cinematic/lab/FlyoverLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <FlyoverLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'showreel' || lab === 'motion') {
  // مختبر الموشن الشورييل: ?lab=showreel — Motion Canvas + GSAP (لا يدخل حزمة العرض)
  const ShowreelLab = lazy(() => import('@/showreel/lab/ShowreelLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <ShowreelLab />
      </Suspense>
    </StrictMode>,
  );
} else {
  // تحميل خطوط الاقتران المختار (src/data/typography.ts) قبل أول رسم لتفادي وميض الخط في شاشة العنوان
  const timeout = new Promise<void>((r) => setTimeout(r, 1500));
  applyTypography(typography)
    .then((t) => Promise.race([warmUpFonts(Object.values(t.roles).map((f) => f.family)), timeout]))
    .catch(() => undefined)
    .finally(() =>
      root.render(
        <StrictMode>
          <App />
        </StrictMode>,
      ),
    );
}
