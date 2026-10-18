import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  BarChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  TreemapChart,
} from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  PolarComponent,
  RadarComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import { ECHARTS_THEME_NAME, echartsTheme } from '../theme';

// تسجيل الأجزاء المستعملة فقط (tree-shaking) + سمة القالب — مرة واحدة عند تحميل القطعة
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  GaugeChart,
  FunnelChart,
  SankeyChart,
  TreemapChart,
  SunburstChart,
  HeatmapChart,
  GraphChart,
  GridComponent,
  PolarComponent,
  RadarComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  SVGRenderer,
]);
echarts.registerTheme(ECHARTS_THEME_NAME, echartsTheme);

export { echarts };

export interface EChartCanvasProps {
  option: EChartsCoreOption;
  height?: number;
  className?: string;
  /** svg (الافتراضي: حادّ عند التكبير وملتقط للصور) أو canvas (أسرع مع آلاف النقاط) */
  renderer?: 'svg' | 'canvas';
  /** استبدال الخيار بالكامل بدل الدمج (مع universalTransition يُفضَّل false) */
  notMerge?: boolean;
  lazyUpdate?: boolean;
  /** مجموعة ربط (connect) بين رسوم متعددة */
  group?: string;
  onEvents?: Record<string, (params: unknown) => void>;
  onReady?: (instance: echarts.ECharts) => void;
  ariaLabel?: string;
}

/** الرسم الفعلي (يُحمَّل كسولاً من EChart.tsx) */
export default function EChartCanvas({
  option,
  height = 320,
  className,
  renderer = 'svg',
  notMerge = false,
  lazyUpdate = true,
  group,
  onEvents,
  onReady,
  ariaLabel,
}: EChartCanvasProps) {
  return (
    <div dir="ltr" className={className} role="img" aria-label={ariaLabel ?? 'رسم بياني'}>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        theme={ECHARTS_THEME_NAME}
        opts={{ renderer }}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        style={{ height, width: '100%' }}
        onEvents={onEvents}
        onChartReady={(instance: echarts.ECharts) => {
          if (group) instance.group = group;
          onReady?.(instance);
        }}
      />
    </div>
  );
}
