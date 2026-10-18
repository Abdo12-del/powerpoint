import { motion } from 'framer-motion';
import { scaleBand, scaleLinear } from 'd3-scale';
import { cn } from '@/lib/cn';
import { CHART_SEMANTIC, formatNumber, niceTicks, seriesColor, type NumberStyle } from '../theme';
import { CARTESIAN_MARGIN, ChartLegend, SvgText, safeMax, useChartMotion, useChartSize, type ChartMotionProps, type ChartSeries } from './shared';

export interface MotionBarChartProps extends ChartMotionProps {
  categories: string[];
  series: ChartSeries[];
  /** vertical: أعمدة (الافتراضي) · horizontal: أشرطة أفقية تنمو من اليمين */
  layout?: 'vertical' | 'horizontal';
  /** تكديس السلاسل بدل تجميعها */
  stacked?: boolean;
  /** ارتفاع الرسم بالبكسل */
  height?: number;
  /** عرض ثابت (وإلا يقيس الحاوية) */
  width?: number;
  valueStyle?: NumberStyle;
  showValues?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  /** إبراز فئة واحدة (بالفهرس أو التسمية) وتبهيت الباقي */
  highlight?: number | string;
  maxValue?: number;
  barRadius?: number;
  /** عرض عمود التسميات في التخطيط الأفقي */
  labelWidth?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * أعمدة/أشرطة تنمو بالتتابع من خط الأساس — رسم حركي مخصّص (framer-motion + d3-scale) يحترم RTL:
 * أول فئة على اليمين، المحور الرأسي على اليمين، الأشرطة الأفقية تنمو من اليمين. يحترم prefers-reduced-motion.
 *
 * @example
 * <MotionBarChart categories={['٢٠٢٢', '٢٠٢٣', '٢٠٢٤']} series={[{ label: 'الطلبة', values: [120, 180, 240] }]} highlight={2} />
 */
export function MotionBarChart({
  categories,
  series,
  layout = 'vertical',
  stacked = false,
  height = 320,
  width: fixedWidth,
  valueStyle = 'decimal',
  showValues = true,
  showGrid = true,
  showLegend,
  highlight,
  maxValue,
  barRadius = 4,
  labelWidth = 112,
  className,
  ariaLabel,
  ...motionProps
}: MotionBarChartProps) {
  const { ref, width } = useChartSize(fixedWidth);
  const { reduced, delay, duration, stagger, rtl } = useChartMotion(motionProps);
  const highlightIndex = typeof highlight === 'string' ? categories.indexOf(highlight) : highlight;
  const isMuted = (ci: number) => highlightIndex !== undefined && highlightIndex >= 0 && ci !== highlightIndex;
  const legend = showLegend ?? series.length > 1;
  const totals = stacked ? categories.map((_, ci) => series.reduce((n, s) => n + (s.values[ci] ?? 0), 0)) : series.flatMap((s) => s.values);
  const max = safeMax(totals, maxValue);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || max;
  const fmt = (v: number) => formatNumber(v, { style: valueStyle });
  const horizontal = layout === 'horizontal';
  const margin = horizontal ? { top: 8, right: labelWidth, bottom: 8, left: 56 } : CARTESIAN_MARGIN;
  const innerW = Math.max(10, width - margin.left - margin.right);
  const innerH = Math.max(10, height - margin.top - margin.bottom);

  // المقاييس: الفئات على المحور الرئيسي (معكوس في RTL ليكون الأول يميناً/أعلى)، والقيم على الثانوي
  const band = scaleBand<number>()
    .domain(categories.map((_, i) => i))
    .range(horizontal ? [0, innerH] : rtl ? [innerW, 0] : [0, innerW])
    .paddingInner(0.28)
    .paddingOuter(0.15);
  const inner = scaleBand<number>()
    .domain(stacked ? [0] : series.map((_, i) => i))
    .range(rtl && !horizontal ? [band.bandwidth(), 0] : [0, band.bandwidth()])
    .paddingInner(0.12);
  const value = scaleLinear()
    .domain([0, top])
    .range(horizontal ? (rtl ? [innerW, 0] : [0, innerW]) : [innerH, 0]);
  const zero = value(0);

  const bars = categories.flatMap((_cat, ci) => {
    let acc = 0;
    return series.map((s, si) => {
      const v = s.values[ci] ?? 0;
      const start = stacked ? acc : 0;
      const end = stacked ? acc + v : v;
      acc = end;
      const a = value(start);
      const b = value(end);
      const thickness = inner.bandwidth();
      const offset = (band(ci) ?? 0) + (inner(stacked ? 0 : si) ?? 0);
      const order = ci * (stacked ? 1 : series.length) + si;
      const d = delay + order * stagger + (stacked ? si * duration * 0.5 : 0);
      const color = seriesColor(si, s.color);
      if (horizontal) {
        const x = Math.min(a, b);
        const w = Math.abs(b - a);
        return {
          key: `${ci}-${si}`,
          ci,
          si,
          v,
          color,
          d,
          fixed: { y: offset, height: thickness },
          from: { attrX: zero, width: 0 },
          to: { attrX: x, width: w },
          labelAt: { x: rtl ? x - 6 : x + w + 6, y: offset + thickness / 2 },
          end,
        };
      }
      const y = Math.min(a, b);
      const h = Math.abs(b - a);
      return {
        key: `${ci}-${si}`,
        ci,
        si,
        v,
        color,
        d,
        fixed: { x: offset, width: thickness },
        from: { attrY: zero, height: 0 },
        to: { attrY: y, height: h },
        labelAt: { x: offset + thickness / 2, y: y - 8 },
        end,
      };
    });
  });
  const lastDelay = Math.max(0, ...bars.map((b) => b.d)) + duration;

  return (
    <div ref={ref} className={cn('w-full', className)} dir="rtl">
      <svg
        role="img"
        aria-label={ariaLabel ?? `رسم أعمدة: ${series.map((s) => s.label).join('، ')}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block max-w-full overflow-visible"
        style={{ direction: 'ltr' }}
      >
        <g transform={`translate(${margin.left} ${margin.top})`}>
          {showGrid &&
            ticks.map((t) =>
              horizontal ? (
                <line
                  key={t}
                  x1={value(t)}
                  x2={value(t)}
                  y1={0}
                  y2={innerH}
                  stroke={t === 0 ? CHART_SEMANTIC.axis : CHART_SEMANTIC.grid}
                  strokeDasharray={t === 0 ? undefined : '3 4'}
                />
              ) : (
                <g key={t}>
                  <line
                    x1={0}
                    x2={innerW}
                    y1={value(t)}
                    y2={value(t)}
                    stroke={t === 0 ? CHART_SEMANTIC.axis : CHART_SEMANTIC.grid}
                    strokeDasharray={t === 0 ? undefined : '3 4'}
                  />
                  <SvgText x={rtl ? innerW + 10 : -10} y={value(t)} anchor={rtl ? 'start' : 'end'} size={12}>
                    {fmt(t)}
                  </SvgText>
                </g>
              ),
            )}
          {bars.map((b) => (
            <g key={b.key} opacity={isMuted(b.ci) ? 0.35 : 1}>
              <motion.rect
                {...b.fixed}
                rx={barRadius}
                fill={b.color}
                initial={reduced ? false : b.from}
                animate={b.to}
                transition={{ duration, delay: b.d, ease: [0.22, 1, 0.36, 1] }}
              />
              {showValues && (!stacked || b.si === series.length - 1) && (
                <motion.g
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: b.d + duration * 0.7 }}
                >
                  <SvgText
                    x={b.labelAt.x}
                    y={b.labelAt.y}
                    anchor={horizontal ? (rtl ? 'end' : 'start') : 'middle'}
                    fill={CHART_SEMANTIC.textStrong}
                    weight={700}
                    size={12}
                  >
                    {fmt(stacked ? b.end : b.v)}
                  </SvgText>
                </motion.g>
              )}
            </g>
          ))}
          {categories.map((cat, ci) =>
            horizontal ? (
              <SvgText
                key={ci}
                x={rtl ? innerW + 12 : -12}
                y={(band(ci) ?? 0) + band.bandwidth() / 2}
                anchor={rtl ? 'start' : 'end'}
                fill={isMuted(ci) ? CHART_SEMANTIC.text : CHART_SEMANTIC.textStrong}
                weight={isMuted(ci) ? 400 : 600}
              >
                {cat}
              </SvgText>
            ) : (
              <SvgText
                key={ci}
                x={(band(ci) ?? 0) + band.bandwidth() / 2}
                y={innerH + 18}
                fill={isMuted(ci) ? CHART_SEMANTIC.text : CHART_SEMANTIC.textStrong}
                weight={isMuted(ci) ? 400 : 600}
              >
                {cat}
              </SvgText>
            ),
          )}
        </g>
      </svg>
      {legend && (
        <ChartLegend className="mt-3" items={series.map((s, i) => ({ label: s.label, color: seriesColor(i, s.color) }))} delay={lastDelay * 0.5} />
      )}
    </div>
  );
}
