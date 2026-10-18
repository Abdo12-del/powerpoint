import { Suspense, lazy } from 'react';
import type { ChartType } from 'chart.js';
import { ChartSkeleton } from '../lazy';
import type { ChartJsCanvasProps } from './internal/ChartJsCanvas';

const Canvas = lazy(() => import('./internal/ChartJsCanvas'));

export type ChartJsProps<T extends ChartType = ChartType> = ChartJsCanvasProps<T>;

/**
 * مغلّف كسول لـ Chart.js (canvas) بسمة القالب وRTL جاهز: <ChartJs type="bar" data={data} options={{ scales: chartJsRtlScales, ...chartJsStagger() }} />
 * مناسب للبيانات الكثيرة (مئات النقاط) وللرسوم المختلطة bar+line. المكتبة تُحمَّل عند أول استعمال فقط.
 */
export function ChartJs<T extends ChartType = ChartType>(props: ChartJsProps<T>) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height ?? 320} className={props.className} />}>
      <Canvas {...(props as ChartJsCanvasProps<ChartType>)} />
    </Suspense>
  );
}
