import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { applyTypography, warmUpFonts } from '@/fonts';
import { typography } from '@/data/typography';

const root = createRoot(document.getElementById('root')!);
const params = new URLSearchParams(window.location.search);

if (params.get('lab') === 'fonts') {
  // مختبر الخطوط: ?lab=fonts — كتالوج الخطوط والاقترانات وحركات النص (لا يدخل حزمة العرض)
  const FontLab = lazy(() => import('@/components/typography/FontLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <FontLab />
      </Suspense>
    </StrictMode>,
  );
} else if (params.get('lab') === 'charts') {
  // مختبر الرسوم البيانية: ?lab=charts — الرسوم الحركية والمكتبات الأربع بسمة واحدة (لا يدخل حزمة العرض)
  const ChartLab = lazy(() => import('@/components/charts/lab/ChartLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <ChartLab />
      </Suspense>
    </StrictMode>,
  );
} else if (params.get('lab') === 'diagrams') {
  // مختبر المخططات والكود: ?lab=diagrams — Mermaid، Shiki، React Flow/Dagre، وExcalidraw (كلها كسولة)
  const DiagramsLab = lazy(() => import('@/components/diagrams/lab/DiagramsLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <DiagramsLab />
      </Suspense>
    </StrictMode>,
  );
} else if (params.get('lab') === 'media') {
  // مختبر الصور والفيديو: ?lab=media — الصور lazy، معرض RTL، التكبير وإطارات الأجهزة والفيديو
  const MediaLab = lazy(() => import('@/components/media/MediaLab').then((module) => ({ default: module.MediaLab })));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <MediaLab />
      </Suspense>
    </StrictMode>,
  );
} else if (params.get('lab') === 'maps') {
  // مختبر الخرائط: ?lab=maps — خرائط العالم والعالم العربي وولايات الجزائر مع طبقات البيانات والعلامات المتحركة
  const MapLab = lazy(() => import('@/components/maps/lab/MapLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <MapLab />
      </Suspense>
    </StrictMode>,
  );
} else if (params.get('lab') === 'math') {
  // مختبر الرياضيات والعلوم: ?lab=math — KaTeX/mhchem مع عزل LTR وMafs للرسم التفاعلي
  const MathLab = lazy(() => import('@/components/math/lab/MathLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <MathLab />
      </Suspense>
    </StrictMode>,
  );
} else if (params.get('lab') === 'themes') {
  // مختبر السمات والهوية: ?lab=themes — أوضاع الضوء/الظلام/المؤسسة والخلفيات ولوحات الفصول
  const ThemeLab = lazy(() => import('@/components/themes/ThemeLab'));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <ThemeLab />
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
