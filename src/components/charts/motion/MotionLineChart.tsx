import { useId } from 'react';
import { motion } from 'framer-motion';
import { scaleLinear, scalePoint } from 'd3-scale';
import { area as d3Area, curveLinear, curveMonotoneX, curveStepAfter, line as d3Line } from 'd3-shape';
import { cn } from '@/lib/cn';
import { CHART_SEMANTIC, formatNumber, niceTicks, seriesColor, type NumberStyle } from '../theme';
import { CARTESIAN_MARGIN, ChartLegend, SvgText, safeMax, useChartMotion, useChartSize, type ChartMotionProps, type ChartSeries } from './shared';

export interface MotionLineChartProps extends ChartMotionProps {
  categories: string[];
  series: ChartSeries[];
  /** تعبئة المساحة تحت الخط */
  area?: boolean;
  curve?: 'linear' | 'monotone' | 'step';
  height?: number;
  width?: number;
  valueStyle?: NumberStyle;
  showDots?: boolean;
  /** إظهار قيمة آخر نقطة لكل سلسلة */
  showLastValue?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  /** الفاصل بين رسم سلسلة والتي تليها بالثواني */
  seriesStagger?: number;
  maxValue?: number;
  minValue?: number;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

const CURVES = { linear: curveLinear, monotone: curveMonotoneX, step: curveStepAfter } as const;

/**
 * خط/مساحة «يُرسم» تدريجياً من اليمين (قناع قصّ يتّسع) مع نقاط تظهر عند مرور الخط — framer-motion + d3-shape.
 * السلاسل تُرسم بالتتابع (seriesStagger) حتى يقرأ الجمهور كل اتجاه على حدة.
 *
 * @example
 * <MotionLineChart categories={months} series={[{ label: 'الإيرادات', values }]} area curve="monotone" valueStyle="compact" />
 */
export function MotionLineChart({
  categories,
  series,
  area = false,
  curve = 'monotone',
  height = 320,
  width: fixedWidth,
  valueStyle = 'decimal',
  showDots = true,
  showLastValue = true,
  showGrid = true,
  showLegend,
  seriesStagger = 0.45,
  maxValue,
  minValue = 0,
  strokeWidth = 3,
  className,
  ariaLabel,
  ...motionProps
}: MotionLineChartProps) {
  const uid = useId().replace(/:/g, '');
  const { ref, width } = useChartSize(fixedWidth);
  const { reduced, delay, duration, rtl } = useChartMotion(motionProps);
  const legend = showLegend ?? series.length > 1;
  const max = safeMax(
    series.flatMap((s) => s.values),
    maxValue,
  );
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || max;
  const fmt = (v: number) => formatNumber(v, { style: valueStyle });
  const margin = CARTESIAN_MARGIN;
  const innerW = Math.max(10, width - margin.left - margin.right);
  const innerH = Math.max(10, height - margin.top - margin.bottom);

  const x = scalePoint<number>()
    .domain(categories.map((_, i) => i))
    .range(rtl ? [innerW, 0] : [0, innerW])
    .padding(0.3);
  const y = scaleLinear().domain([minValue, top]).range([innerH, 0]);
  const lineGen = d3Line<number>()
    .x((_, i) => x(i) ?? 0)
    .y((v) => y(v))
    .curve(CURVES[curve]);
  const areaGen = d3Area<number>()
    .x((_, i) => x(i) ?? 0)
    .y0(y(minValue))
    .y1((v) => y(v))
    .curve(CURVES[curve]);
  const n = Math.max(1, categories.length - 1);
  const seriesDelay = (si: number) => delay + si * (reduced ? 0 : seriesStagger);

  return (
    <div ref={ref} className={cn('w-full', className)} dir="rtl">
      <svg
        role="img"
        aria-label={ariaLabel ?? `رسم خطي: ${series.map((s) => s.label).join('، ')}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block max-w-full overflow-visible"
        style={{ direction: 'ltr' }}
      >
        <defs>
          {series.map((_s, si) => (
            <clipPath key={si} id={`${uid}-clip-${si}`}>
              {/* قناع القصّ يتّسع من جهة البداية (اليمين في RTL) ليكشف الخط والمساحة والنقاط معاً */}
              <motion.rect
                y={-strokeWidth * 2}
                height={innerH + strokeWidth * 4}
                initial={reduced ? false : { attrX: rtl ? innerW : 0, width: 0 }}
                animate={{ attrX: 0, width: innerW }}
                transition={{ duration: duration * 1.6, delay: seriesDelay(si), ease: 'easeInOut' }}
              />
            </clipPath>
          ))}
          {area &&
            series.map((s, si) => (
              <linearGradient key={si} id={`${uid}-grad-${si}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={seriesColor(si, s.color)} stopOpacity={0.35} />
                <stop offset="100%" stopColor={seriesColor(si, s.color)} stopOpacity={0.02} />
              </linearGradient>
            ))}
        </defs>
        <g transform={`translate(${margin.left} ${margin.top})`}>
          {showGrid &&
            ticks.map((t) => (
              <g key={t}>
                <line
                  x1={0}
                  x2={innerW}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={t === ticks[0] ? CHART_SEMANTIC.axis : CHART_SEMANTIC.grid}
                  strokeDasharray={t === ticks[0] ? undefined : '3 4'}
                />
                <SvgText x={rtl ? innerW + 10 : -10} y={y(t)} anchor={rtl ? 'start' : 'end'} size={12}>
                  {fmt(t)}
                </SvgText>
              </g>
            ))}
          {categories.map((cat, ci) => (
            <SvgText key={ci} x={x(ci) ?? 0} y={innerH + 18} fill={CHART_SEMANTIC.textStrong}>
              {cat}
            </SvgText>
          ))}
          {series.map((s, si) => {
            const color = seriesColor(si, s.color);
            const d = lineGen(s.values) ?? '';
            const last = s.values.length - 1;
            return (
              <g key={si}>
                <g clipPath={`url(#${uid}-clip-${si})`}>
                  {area && <path d={areaGen(s.values) ?? ''} fill={`url(#${uid}-grad-${si})`} />}
                  <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                  {showDots &&
                    s.values.map((v, i) => (
                      <motion.circle
                        key={i}
                        cx={x(i) ?? 0}
                        cy={y(v)}
                        r={4.5}
                        fill="#0f172a"
                        stroke={color}
                        strokeWidth={2.5}
                        initial={reduced ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                        transition={{
                          duration: 0.35,
                          delay: seriesDelay(si) + (duration * 1.6 * i) / n,
                          type: 'spring',
                          stiffness: 300,
                          damping: 18,
                        }}
                      />
                    ))}
                </g>
                {showLastValue && last >= 0 && (
                  <motion.g
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: seriesDelay(si) + duration * 1.6 }}
                  >
                    <SvgText x={x(last) ?? 0} y={y(s.values[last]) - 14} fill={color} weight={700} size={13}>
                      {fmt(s.values[last])}
                    </SvgText>
                  </motion.g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {legend && (
        <ChartLegend className="mt-3" items={series.map((s, i) => ({ label: s.label, color: seriesColor(i, s.color) }))} delay={delay + 0.3} />
      )}
    </div>
  );
}
