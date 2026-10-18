import { useId } from 'react';
import { motion } from 'framer-motion';
import { scaleLinear, scalePoint } from 'd3-scale';
import { area as d3Area, curveMonotoneX, line as d3Line } from 'd3-shape';
import { cn } from '@/lib/cn';
import { CHART_COLORS, CHART_SEMANTIC } from '../theme';
import { useChartMotion, type ChartMotionProps } from './shared';

export interface SparklineProps extends ChartMotionProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  /** تعبئة خفيفة تحت الخط */
  area?: boolean;
  /** نقطة على آخر قيمة */
  endDot?: boolean;
  strokeWidth?: number;
  className?: string;
}

/**
 * خط مصغّر بلا محاور يُرسم من اليمين إلى اليسار — يُلصق بجانب رقم (NumberRoll) داخل بطاقة إحصائية.
 * اللون الافتراضي: إيجابي/سلبي حسب اتجاه آخر قيمة مقارنة بالأولى.
 */
export function Sparkline({
  values,
  width = 140,
  height = 40,
  color,
  area = true,
  endDot = true,
  strokeWidth = 2.5,
  className,
  ...motionProps
}: SparklineProps) {
  const uid = useId().replace(/:/g, '');
  const { reduced, delay, duration, rtl } = useChartMotion(motionProps);
  const trendUp = values.length > 1 ? values[values.length - 1] >= values[0] : true;
  const stroke = color ?? (trendUp ? CHART_SEMANTIC.positive : CHART_SEMANTIC.negative) ?? CHART_COLORS[0];
  const pad = strokeWidth * 2;
  const x = scalePoint<number>()
    .domain(values.map((_, i) => i))
    .range(rtl ? [width - pad, pad] : [pad, width - pad]);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const y = scaleLinear()
    .domain([lo === hi ? lo - 1 : lo, lo === hi ? hi + 1 : hi])
    .range([height - pad, pad]);
  const d =
    d3Line<number>()
      .x((_, i) => x(i) ?? 0)
      .y((v) => y(v))
      .curve(curveMonotoneX)(values) ?? '';
  const a =
    d3Area<number>()
      .x((_, i) => x(i) ?? 0)
      .y0(height)
      .y1((v) => y(v))
      .curve(curveMonotoneX)(values) ?? '';
  const last = values.length - 1;

  return (
    <svg
      role="img"
      aria-label="خط اتجاه مصغّر"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('inline-block overflow-visible align-middle', className)}
      style={{ direction: 'ltr' }}
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area && (
        <motion.path
          d={a}
          fill={`url(#${uid}-g)`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: delay + duration * 0.5 }}
        />
      )}
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration, delay, ease: 'easeOut' }}
      />
      {endDot && last >= 0 && (
        <motion.circle
          cx={x(last) ?? 0}
          cy={y(values[last])}
          r={strokeWidth * 1.4}
          fill={stroke}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + duration }}
        />
      )}
    </svg>
  );
}
