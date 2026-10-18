import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveFunnel } from '@nivo/funnel';
import { ResponsiveWaffle } from '@nivo/waffle';
import { ChartFrame } from '../ChartFrame';
import { nivoColors, nivoMargin, nivoMotion, nivoRtlData, nivoTheme } from '../nivo/theme';
import { formatNumber } from '../theme';
import { MONTHS, PROFILE_A, PROFILE_B, SERIES_A, SERIES_B, SHARES, SKILLS, TREND, TREND_B, YEARS } from './sample-data';

const barData = nivoRtlData(YEARS.map((year, i) => ({ year, [SERIES_A.label]: SERIES_A.values[i], [SERIES_B.label]: SERIES_B.values[i] })));
const lineData = [
  { id: 'الزيارات', data: nivoRtlData(MONTHS.map((x, i) => ({ x, y: TREND[i] }))) },
  { id: 'التسجيلات', data: nivoRtlData(MONTHS.map((x, i) => ({ x, y: TREND_B[i] }))) },
];
const pieData = SHARES.map((s) => ({ id: s.label, label: s.label, value: s.value }));
const radarData = SKILLS.map((skill, i) => ({ skill, [PROFILE_A.label]: PROFILE_A.values[i], [PROFILE_B.label]: PROFILE_B.values[i] }));
const funnelData = [
  { id: 'زيارات', value: 1200, label: 'زيارات' },
  { id: 'تسجيل', value: 640, label: 'تسجيل' },
  { id: 'تفعيل', value: 380, label: 'تفعيل' },
  { id: 'اشتراك', value: 150, label: 'اشتراك' },
];
const axis = { tickSize: 0, tickPadding: 10 };

/** أمثلة Nivo بسمة القالب (react-spring) — تُحمَّل كقطعة مستقلة */
export default function NivoSection() {
  const motion = nivoMotion('gentle');
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartFrame title="أعمدة — Nivo" subtitle="ResponsiveBar · nivoRtlData + axisRight + animateOnMount">
        <div dir="ltr" style={{ height: 280 }}>
          <ResponsiveBar
            data={barData}
            keys={[SERIES_A.label, SERIES_B.label]}
            indexBy="year"
            groupMode="grouped"
            margin={nivoMargin}
            padding={0.3}
            innerPadding={4}
            borderRadius={5}
            colors={nivoColors}
            theme={nivoTheme}
            axisLeft={null}
            axisRight={axis}
            axisBottom={axis}
            enableGridY
            labelTextColor="#0f172a"
            valueFormat={(v) => formatNumber(v)}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top-right',
                direction: 'row',
                translateY: -24,
                itemWidth: 110,
                itemHeight: 16,
                symbolShape: 'square',
                symbolSize: 10,
              },
            ]}
            animateOnMount
            {...motion}
          />
        </div>
      </ChartFrame>
      <ChartFrame title="خطوط — Nivo" subtitle="ResponsiveLine · مساحة + نقاط + مفتاح">
        <div dir="ltr" style={{ height: 280 }}>
          <ResponsiveLine
            data={lineData}
            margin={nivoMargin}
            curve="monotoneX"
            colors={nivoColors}
            theme={nivoTheme}
            axisLeft={null}
            axisRight={axis}
            axisBottom={axis}
            enableArea
            areaOpacity={0.12}
            lineWidth={3}
            pointSize={8}
            pointColor="#0f172a"
            pointBorderWidth={2}
            pointBorderColor={{ from: 'seriesColor' }}
            useMesh
            yScale={{ type: 'linear', min: 0, max: 'auto' }}
            legends={[
              { anchor: 'top-right', direction: 'row', translateY: -24, itemWidth: 90, itemHeight: 16, symbolShape: 'circle', symbolSize: 10 },
            ]}
            {...motion}
          />
        </div>
      </ChartFrame>
      <ChartFrame title="حلقة — Nivo" subtitle="ResponsivePie · startAngle=0 endAngle=-360 (عكس عقارب الساعة)">
        <div dir="ltr" style={{ height: 280 }}>
          <ResponsivePie
            data={pieData}
            margin={{ top: 24, right: 100, bottom: 24, left: 100 }}
            innerRadius={0.6}
            padAngle={2}
            cornerRadius={4}
            startAngle={0}
            endAngle={-360}
            colors={nivoColors}
            theme={nivoTheme}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLinkLabelsTextColor="#e2e8f0"
            arcLabelsTextColor="#0f172a"
            valueFormat={(v) => `${v}%`}
            activeOuterRadiusOffset={6}
            {...motion}
          />
        </div>
      </ChartFrame>
      <ChartFrame title="رادار — Nivo" subtitle="ResponsiveRadar · مقارنة ملفّين">
        <div dir="ltr" style={{ height: 280 }}>
          <ResponsiveRadar
            data={radarData}
            keys={[PROFILE_A.label, PROFILE_B.label]}
            indexBy="skill"
            maxValue={100}
            margin={{ top: 36, right: 80, bottom: 36, left: 80 }}
            colors={nivoColors}
            theme={nivoTheme}
            fillOpacity={0.2}
            borderWidth={2.5}
            dotSize={8}
            dotColor="#0f172a"
            dotBorderWidth={2}
            gridLevels={4}
            legends={[{ anchor: 'top-left', direction: 'column', translateX: -60, translateY: -30, itemWidth: 100, itemHeight: 18, symbolSize: 10 }]}
            {...motion}
          />
        </div>
      </ChartFrame>
      <ChartFrame title="قمع — Nivo" subtitle="ResponsiveFunnel · مراحل التحويل">
        <div dir="ltr" style={{ height: 280 }}>
          <ResponsiveFunnel
            data={funnelData}
            margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
            direction="horizontal"
            colors={nivoColors}
            theme={nivoTheme}
            borderWidth={10}
            labelColor="#0f172a"
            valueFormat={(v) => formatNumber(v)}
            currentPartSizeExtension={8}
            {...motion}
          />
        </div>
      </ChartFrame>
      <ChartFrame title="شبكة وافل — Nivo" subtitle="ResponsiveWaffle · كل مربع = 1% (يُملأ من اليمين)">
        <div dir="ltr" style={{ height: 280 }}>
          <ResponsiveWaffle
            data={pieData}
            total={100}
            rows={8}
            columns={16}
            fillDirection="right"
            padding={2}
            colors={nivoColors}
            theme={nivoTheme}
            legends={[{ anchor: 'top-left', direction: 'column', translateX: -4, itemWidth: 100, itemHeight: 18, symbolSize: 12 }]}
            margin={{ top: 8, right: 8, bottom: 8, left: 110 }}
            {...motion}
          />
        </div>
      </ChartFrame>
    </div>
  );
}
