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
} else if (lab === 'effects') {
  // مختبر المؤثرات السينمائية: ?lab=effects — Three.js + Lenis + تشوهات بصرية (لا يدخل حزمة العرض)
  const EffectsLab = lazy(() => import('@/effects/lab/EffectsLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <EffectsLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'presenter' || lab === 'notes') {
  // مختبر ملاحظات المعلم والمؤقت: ?lab=presenter — نموذج Reveal Notes (لا يدخل حزمة العرض)
  const PresenterLab = lazy(() => import('@/presenter/lab/PresenterLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <PresenterLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'spotlight' || lab === 'zoom') {
  // مختبر التكبير والتركيز: ?lab=spotlight — نموذج RevealZoom + ليزر وتسليط ضوء (لا يدخل حزمة العرض)
  const SpotlightLab = lazy(() => import('@/spotlight/lab/SpotlightLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <SpotlightLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'chalkboard' || lab === 'board') {
  // مختبر السبورة والتعليق: ?lab=chalkboard — رسم وكتابة حرة فوق الشرائح (لا يدخل حزمة العرض)
  const ChalkboardLab = lazy(() => import('@/chalkboard/lab/ChalkboardLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <ChalkboardLab />
      </Suspense>
    </StrictMode>,
  );
} else if (lab === 'distilbook' || lab === 'research') {
  // مختبر الموشن جرافيك البحثي: ?lab=distilbook — شورييل Distilbook القصصي (لا يدخل حزمة العرض)
  const DistilbookLab = lazy(() => import('@/distilbook/lab/DistilbookLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <DistilbookLab />
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
