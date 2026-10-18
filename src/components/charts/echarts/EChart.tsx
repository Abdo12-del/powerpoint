import { Suspense, lazy } from 'react';
import { ChartSkeleton } from '../lazy';
import type { EChartCanvasProps } from './internal/EChartCanvas';

const Canvas = lazy(() => import('./internal/EChartCanvas'));

export type EChartProps = EChartCanvasProps;

/**
 * مغلّف كسول لـ Apache ECharts (echarts/core مع الأجزاء المسجّلة فقط) بسمة القالب:
 * <EChart option={echartsRtl({ xAxis: { type: 'category', data }, yAxis: {}, series: [{ type: 'bar', data: values, ...echartsAnimation() }] })} />
 * يدعم التحوّل الشامل (universalTransition) بين خيارين: غيّر option مع نفس dataGroupId فيتحوّل العمود إلى شريحة فطيرة.
 */
export function EChart(props: EChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height ?? 320} className={props.className} />}>
      <Canvas {...props} />
    </Suspense>
  );
}
