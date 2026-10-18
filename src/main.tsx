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
