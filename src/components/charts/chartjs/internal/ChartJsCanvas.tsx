import { Chart as ReactChart } from 'react-chartjs-2';
import type { ChartData, ChartOptions, ChartType, Plugin } from 'chart.js';
import { ChartDataLabels, setupChartJs } from '../setup';

setupChartJs();

export interface ChartJsCanvasProps<T extends ChartType = ChartType> {
  type: T;
  data: ChartData<T>;
  options?: ChartOptions<T>;
  /** تفعيل تسميات القيم (chartjs-plugin-datalabels) */
  dataLabels?: boolean;
  plugins?: Plugin<T>[];
  height?: number;
  className?: string;
  redraw?: boolean;
  ariaLabel?: string;
}

/** الرسم الفعلي على canvas (يُحمَّل كسولاً من ChartJs.tsx) */
export default function ChartJsCanvas<T extends ChartType>({
  type,
  data,
  options,
  dataLabels = false,
  plugins = [],
  height = 320,
  className,
  redraw,
  ariaLabel,
}: ChartJsCanvasProps<T>) {
  const all = dataLabels ? [ChartDataLabels as unknown as Plugin<T>, ...plugins] : plugins;
  const merged = { ...options, plugins: { ...(dataLabels ? {} : { datalabels: { display: false } }), ...options?.plugins } } as ChartOptions<T>;
  return (
    <div dir="ltr" className={className} style={{ position: 'relative', height, width: '100%' }}>
      <ReactChart type={type} data={data} options={merged} plugins={all} redraw={redraw} aria-label={ariaLabel ?? 'رسم بياني'} role="img" />
    </div>
  );
}
