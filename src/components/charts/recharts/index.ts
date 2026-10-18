/**
 * طبقة Recharts (ثقيلة ~450KB): استوردها من ملف رسم مستقل يُحمَّل بـ lazyChart، لا من بيانات الشرائح مباشرة.
 *   import { ChartContainer, ChartTooltip, ChartTooltipContent, rechartsAxis, rechartsRtl } from '@/components/charts/recharts';
 *   import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
 */
export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig } from './chart';
export * from './theme';
