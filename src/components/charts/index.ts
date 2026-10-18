/**
 * الرسوم البيانية وحركاتها — نقطة الدخول الخفيفة (لا تسحب أي مكتبة ثقيلة):
 * - السمة المشتركة: theme.ts (الألوان، formatNumber، configureCharts)
 * - الرسوم الحركية المخصّصة (framer-motion + d3): MotionBarChart, MotionLineChart, MotionDonutChart, MotionRadarChart, Sparkline, MotionBarList
 * - الإطار والتحميل الكسول: ChartFrame, ChartSkeleton, lazyChart
 * - مغلّفات كسولة: ChartJs (Chart.js) وEChart (Apache ECharts) — المكتبة تُحمَّل عند أول رسم
 * - مساعدات Recharts/Nivo الخفيفة (سمات وRTL) — مكوّنات Recharts نفسها من '@/components/charts/recharts' وNivo من '@nivo/*'
 * الدليل: docs/CHARTS.md — المختبر: ?lab=charts — المهارة: .agents/skills/data-charts-motion
 */
export * from './theme';
export { ChartFrame, type ChartFrameProps } from './ChartFrame';
export { ChartSkeleton, lazyChart, type ChartSkeletonProps } from './lazy';
export { ChartLegend, SvgText, useChartMotion, useChartSize, useContainerWidth, type ChartMotionProps, type ChartSeries } from './motion/shared';
export { MotionBarChart, type MotionBarChartProps } from './motion/MotionBarChart';
export { MotionLineChart, type MotionLineChartProps } from './motion/MotionLineChart';
export { MotionDonutChart, type MotionDonutChartProps, type DonutSlice } from './motion/MotionDonutChart';
export { MotionRadarChart, type MotionRadarChartProps } from './motion/MotionRadarChart';
export { Sparkline, type SparklineProps } from './motion/Sparkline';
export { MotionBarList, type MotionBarListProps, type BarListItem } from './motion/MotionBarList';
export { ChartJs, type ChartJsProps } from './chartjs/ChartJs';
export { chartJsColor, chartJsDataLabels, chartJsRtlHorizontalScales, chartJsRtlScales, chartJsStagger } from './chartjs/helpers';
export { EChart, type EChartProps } from './echarts/EChart';
export { echartsAnimation, echartsNumber, echartsRtl, echartsTheme, ECHARTS_THEME_NAME } from './echarts/theme';
export { rechartsAnimation, rechartsAxis, rechartsBarRadius, rechartsConfig, rechartsCursor, rechartsGrid, rechartsRtl } from './recharts/theme';
export { nivoColors, nivoMargin, nivoMotion, nivoRtlData, nivoTheme } from './nivo/theme';
