import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  rechartsAnimation,
  rechartsAxis,
  rechartsBarRadius,
  rechartsConfig,
  rechartsCursor,
  rechartsGrid,
  rechartsRtl,
} from '../recharts';
import { ChartFrame } from '../ChartFrame';
import { CHART_COLORS, valueFormatter } from '../theme';
import { MONTHS, SERIES_A, SERIES_B, SHARES, TREND, TREND_B, YEARS } from './sample-data';

const barData = YEARS.map((year, i) => ({ year, north: SERIES_A.values[i], south: SERIES_B.values[i] }));
const barConfig = rechartsConfig({ north: SERIES_A.label, south: SERIES_B.label });
const areaData = MONTHS.map((month, i) => ({ month, visits: TREND[i], signups: TREND_B[i] }));
const areaConfig = rechartsConfig({ visits: 'الزيارات', signups: 'التسجيلات' });
const pieConfig = Object.fromEntries(SHARES.map((s, i) => [s.label, { label: s.label, color: CHART_COLORS[i] }]));
const fmt = valueFormatter();

/** أمثلة Recharts عبر حاوية shadcn المستعارة + مساعدات RTL (تُحمَّل كقطعة مستقلة) */
export default function RechartsSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartFrame title="أعمدة متجمّعة — Recharts" subtitle="ChartContainer + rechartsRtl (reversed / orientation=right) + rechartsAnimation(i)">
        <ChartContainer config={barConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={barData} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid {...rechartsGrid} />
            <XAxis dataKey="year" {...rechartsAxis} {...rechartsRtl.xAxis} />
            <YAxis {...rechartsAxis} {...rechartsRtl.yAxis} tickFormatter={fmt} width={44} />
            <ChartTooltip cursor={rechartsCursor} content={<ChartTooltipContent />} {...rechartsRtl.tooltip} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="north" fill="var(--color-north)" radius={rechartsBarRadius.vertical} {...rechartsAnimation(0)}>
              <LabelList dataKey="north" position="top" fill="#e2e8f0" fontSize={12} formatter={(v: unknown) => fmt(Number(v))} />
            </Bar>
            <Bar dataKey="south" fill="var(--color-south)" radius={rechartsBarRadius.vertical} {...rechartsAnimation(1)} />
          </BarChart>
        </ChartContainer>
      </ChartFrame>
      <ChartFrame title="مساحة متدرّجة — Recharts" subtitle="AreaChart + تدرّج + Tooltip بسمة القالب">
        <ChartContainer config={areaConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={areaData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
            <defs>
              {Object.keys(areaConfig).map((k) => (
                <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${k})`} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={`var(--color-${k})`} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid {...rechartsGrid} />
            <XAxis dataKey="month" {...rechartsAxis} {...rechartsRtl.xAxis} />
            <YAxis {...rechartsAxis} {...rechartsRtl.yAxis} width={40} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} {...rechartsRtl.tooltip} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="var(--color-visits)"
              fill="url(#fill-visits)"
              strokeWidth={3}
              {...rechartsAnimation(0, 1400)}
            />
            <Area
              type="monotone"
              dataKey="signups"
              stroke="var(--color-signups)"
              fill="url(#fill-signups)"
              strokeWidth={3}
              {...rechartsAnimation(1, 1400)}
            />
          </AreaChart>
        </ChartContainer>
      </ChartFrame>
      <ChartFrame title="حلقة — Recharts" subtitle="Pie innerRadius + startAngle=90 endAngle=450 (عكس عقارب الساعة من الأعلى)">
        <ChartContainer config={pieConfig} className="aspect-auto h-[280px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} {...rechartsRtl.tooltip} />
            <Pie
              data={SHARES}
              dataKey="value"
              nameKey="label"
              innerRadius={64}
              outerRadius={104}
              paddingAngle={3}
              startAngle={90}
              endAngle={450}
              strokeWidth={0}
              {...rechartsAnimation(0, 1200)}
            >
              {SHARES.map((s, i) => (
                <Cell key={s.label} fill={CHART_COLORS[i]} />
              ))}
              <LabelList dataKey="value" fill="#0f172a" fontSize={12} fontWeight={700} formatter={(v: unknown) => `${v}%`} />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="label" />} />
          </PieChart>
        </ChartContainer>
      </ChartFrame>
    </div>
  );
}
