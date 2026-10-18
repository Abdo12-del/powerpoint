import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { CHART_SEMANTIC, formatNumber, seriesColor } from '../theme';
import { ChartLegend, SvgText, safeMax, useChartMotion, type ChartMotionProps, type ChartSeries } from './shared';

export interface MotionRadarChartProps extends ChartMotionProps {
  /** المحاور (3 فأكثر) */
  axes: string[];
  series: ChartSeries[];
  size?: number;
  levels?: number;
  maxValue?: number;
  showLegend?: boolean;
  showLevelLabels?: boolean;
  fillOpacity?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * رادار (عنكبوتي) تتمدّد مضلّعاته من المركز إلى قيمها، سلسلةً بعد سلسلة — مناسب لمقارنة ملفّ من 4–8 معايير.
 * في RTL تُرتَّب المحاور عكس عقارب الساعة من الأعلى (أول محور فوق، الثاني إلى يساره).
 */
export function MotionRadarChart({
  axes,
  series,
  size = 320,
  levels = 4,
  maxValue,
  showLegend,
  showLevelLabels = false,
  fillOpacity = 0.22,
  className,
  ariaLabel,
  ...motionProps
}: MotionRadarChartProps) {
  const { reduced, delay, duration, rtl } = useChartMotion(motionProps);
  const legend = showLegend ?? series.length > 1;
  const max = safeMax(
    series.flatMap((s) => s.values),
    maxValue,
  );
  const c = size / 2;
  const R = c - 48;
  const n = Math.max(3, axes.length);
  const angleOf = (i: number) => -Math.PI / 2 + ((rtl ? -1 : 1) * (i * Math.PI * 2)) / n;
  const point = (i: number, v: number) => {
    const rr = (Math.max(0, Math.min(v, max)) / max) * R;
    return [c + rr * Math.cos(angleOf(i)), c + rr * Math.sin(angleOf(i))] as const;
  };
  const polygon = (values: number[]) => axes.map((_, i) => point(i, values[i] ?? 0));
  const toPath = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + ' Z';
  const zeroPath = toPath(axes.map(() => [c, c] as const));

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} dir="rtl">
      <svg
        role="img"
        aria-label={ariaLabel ?? `رسم رادار: ${series.map((s) => s.label).join('، ')}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ direction: 'ltr' }}
      >
        {Array.from({ length: levels }, (_, li) => {
          const v = (max * (li + 1)) / levels;
          return (
            <g key={li}>
              <path d={toPath(axes.map((_, i) => point(i, v)))} fill="none" stroke={CHART_SEMANTIC.grid} />
              {showLevelLabels && (
                <SvgText x={c + 6} y={c - (R * (li + 1)) / levels} anchor="start" size={10}>
                  {formatNumber(v)}
                </SvgText>
              )}
            </g>
          );
        })}
        {axes.map((label, i) => {
          const [x, y] = point(i, max);
          const lx = c + (R + 22) * Math.cos(angleOf(i));
          const ly = c + (R + 22) * Math.sin(angleOf(i));
          const cos = Math.cos(angleOf(i));
          return (
            <g key={i}>
              <line x1={c} y1={c} x2={x} y2={y} stroke={CHART_SEMANTIC.axis} />
              <SvgText x={lx} y={ly} anchor={cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle'} fill={CHART_SEMANTIC.textStrong} weight={600}>
                {label}
              </SvgText>
            </g>
          );
        })}
        {series.map((s, si) => {
          const color = seriesColor(si, s.color);
          const d = toPath(polygon(s.values));
          const t = { duration, delay: delay + si * duration * 0.6, ease: [0.22, 1, 0.36, 1] as const };
          return (
            <g key={si}>
              <motion.path
                d={d}
                fill={color}
                fillOpacity={fillOpacity}
                stroke={color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                initial={reduced ? false : { d: zeroPath, opacity: 0 }}
                animate={{ d, opacity: 1 }}
                transition={t}
              />
              {polygon(s.values).map(([x, y], i) => (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={2}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: t.delay + duration * 0.8 }}
                />
              ))}
            </g>
          );
        })}
      </svg>
      {legend && <ChartLegend items={series.map((s, i) => ({ label: s.label, color: seriesColor(i, s.color) }))} delay={delay + 0.3} />}
    </div>
  );
}
