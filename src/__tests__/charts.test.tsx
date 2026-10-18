// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { writeFileSync, mkdirSync } from 'node:fs';
import {
  CHART_COLORS,
  ChartFrame,
  ChartSkeleton,
  MotionBarChart,
  MotionBarList,
  MotionDonutChart,
  MotionLineChart,
  MotionRadarChart,
  Sparkline,
  chartJsRtlScales,
  chartJsStagger,
  chartSettings,
  configureCharts,
  echartsAnimation,
  echartsRtl,
  formatNumber,
  lazyChart,
  niceTicks,
  nivoRtlData,
  nivoTheme,
  rechartsAnimation,
  rechartsRtl,
  seriesColor,
} from '@/components/charts';
import * as charts from '@/components/charts';

const r = (el: React.ReactElement) => renderToStaticMarkup(el);

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const mount = async (el: React.ReactElement) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(el));
  const flush = () => act(async () => void (await new Promise((res) => setTimeout(res, 40))));
  const unmount = async () => {
    await act(async () => root.unmount());
    host.remove();
  };
  return { host, flush, unmount };
};

/** تقليل الحركة = الحالة النهائية مباشرة (initial=false) → يمكن فحص الهندسة النهائية في SSR */
const withReducedMotion = (on: boolean) => {
  window.matchMedia = vi
    .fn()
    .mockImplementation((q: string) => ({
      matches: on && q.includes('reduce'),
      media: q,
      addEventListener() {},
      removeEventListener() {},
    })) as unknown as typeof window.matchMedia;
};

const categories = ['2022', '2023', '2024', '2025'];
const series = [
  { label: 'الفرع الشمالي', values: [120, 180, 240, 310] },
  { label: 'الفرع الجنوبي', values: [90, 140, 160, 220] },
];
// framer-motion يكتب الأبعاد المتحرّكة بوحدة px (height="78px") — مقبول في SVG، ونزيلها عند التحليل
const attr = (tag: string, name: string, html: string) =>
  [...html.matchAll(new RegExp(`<${tag}[^>]*\\s${name}="([\\d.]+)(?:px)?"`, 'g'))].map((m) => Number(m[1]));

afterEach(() => {
  withReducedMotion(false);
  configureCharts({ locale: 'ar-DZ' });
});

describe('السمة المشتركة للرسوم (theme.ts)', () => {
  it('الأرقام بمحلية القالب الافتراضية (أرقام غربية) وتتبدّل مع configureCharts', () => {
    expect(formatNumber(1284)).toMatch(/^1[.,\u00a0\u202f]284$/); // ar-DZ: أرقام غربية وفاصل آلاف محلي
    expect(formatNumber(0.874, { style: 'percent' })).toMatch(/^87[.,]4\u200e?%/);
    expect(formatNumber(12500, { style: 'compact' })).toMatch(/12[.,]5|13/);
    expect(formatNumber(1284, { locale: 'en' })).toBe('1,284');
    configureCharts({ locale: 'ar-EG' });
    expect(formatNumber(1284)).toContain('١');
    expect(chartSettings.locale).toBe('ar-EG');
  });

  it('الألوان تدور على اللوحة ويُحترم اللون الصريح؛ والتدريجات «جميلة»', () => {
    expect(seriesColor(0)).toBe(CHART_COLORS[0]);
    expect(seriesColor(CHART_COLORS.length + 1)).toBe(CHART_COLORS[1]);
    expect(seriesColor(3, '#000')).toBe('#000');
    expect(niceTicks(310)).toEqual([0, 100, 200, 300, 400]);
    expect(niceTicks(0.9)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(niceTicks(0)).toEqual([0]);
  });
});

describe('الرسوم الحركية المخصّصة (framer-motion + d3)', () => {
  it('MotionBarChart: عدد الأعمدة = الفئات × السلاسل، وأول فئة على اليمين (RTL) وعلى اليسار (LTR)', () => {
    withReducedMotion(true);
    const rtl = r(<MotionBarChart categories={categories} series={series} width={640} />);
    expect((rtl.match(/<rect/g) ?? []).length).toBe(8);
    expect(rtl).toContain('role="img"');
    expect(rtl).toContain('الفرع الشمالي'); // المفتاح
    // تسميات الفئات: x الأولى > x الأخيرة في RTL
    const xs = [...rtl.matchAll(/<text x="([\d.]+)" y="[\d.]+"[^>]*>(20\d\d)<\/text>/g)].map((m) => [Number(m[1]), m[2]] as const);
    expect(xs.map((x) => x[1])).toEqual(categories);
    expect(xs[0][0]).toBeGreaterThan(xs[3][0]);
    const ltr = r(<MotionBarChart categories={categories} series={series} width={640} dir="ltr" />);
    const xl = [...ltr.matchAll(/<text x="([\d.]+)" y="[\d.]+"[^>]*>(20\d\d)<\/text>/g)].map((m) => Number(m[1]));
    expect(xl[0]).toBeLessThan(xl[3]);
  });

  it('MotionBarChart: الحالة النهائية (تقليل الحركة) ترسم ارتفاعات متناسبة والتكديس يجمع، والأفقي يضع التسميات يميناً', () => {
    withReducedMotion(true);
    const html = r(<MotionBarChart categories={categories} series={[series[0]]} width={640} height={320} showLegend={false} />);
    const heights = attr('rect', 'height', html);
    expect(heights.length).toBe(4);
    expect(heights[3] / heights[0]).toBeCloseTo(310 / 120, 1);
    const stacked = r(<MotionBarChart categories={categories} series={series} stacked width={640} />);
    expect(stacked).toContain('>530<'); // مجموع 2025 فوق العمود
    const horizontal = r(<MotionBarChart categories={['أ', 'ب']} series={[{ label: 's', values: [10, 20] }]} layout="horizontal" width={600} />);
    expect(horizontal).toContain('text-anchor="start"'); // التسميات على يمين الرسم تبدأ من المحور
    expect(attr('rect', 'width', horizontal)[1]).toBeCloseTo(attr('rect', 'width', horizontal)[0] * 2, 0);
  });

  it('MotionBarChart: الحركة الافتراضية تبدأ من خط الأساس (ارتفاع 0) ولا يُبهَت إلا غير المميَّز', () => {
    const html = r(<MotionBarChart categories={categories} series={[series[0]]} width={640} highlight="2025" />);
    expect((html.match(/height="0(px)?"/g) ?? []).length).toBe(4);
    expect((html.match(/opacity="0.35"/g) ?? []).length).toBe(3);
  });

  it('MotionLineChart: مسار لكل سلسلة + قناع قصّ + نقاط، ومنحنى الخطوة/الخطي يغيّر المسار', () => {
    withReducedMotion(true);
    const html = r(<MotionLineChart categories={categories} series={series} width={640} area />);
    expect((html.match(/<clipPath/g) ?? []).length).toBe(2);
    expect((html.match(/<circle/g) ?? []).length).toBe(8);
    expect((html.match(/<linearGradient/g) ?? []).length).toBe(2);
    expect(html).toContain('>310<'); // قيمة آخر نقطة
    const mono = r(<MotionLineChart categories={categories} series={[series[0]]} width={640} showDots={false} />);
    const step = r(<MotionLineChart categories={categories} series={[series[0]]} width={640} showDots={false} curve="step" />);
    expect(mono).not.toBe(step);
    const segments = (html: string) => (html.match(/<path d="[^"]*"/)?.[0].match(/L/g) ?? []).length;
    expect(segments(step)).toBeGreaterThan(
      segments(r(<MotionLineChart categories={categories} series={[series[0]]} width={640} showDots={false} curve="linear" />)),
    ); // الخطوة تضاعف المقاطع
  });

  it('MotionDonutChart: قوس لكل شريحة، المجموع في المركز، النسب في المفتاح، وعكس عقارب الساعة افتراضياً في RTL', () => {
    withReducedMotion(true);
    const data = [
      { label: 'الهندسة', value: 38 },
      { label: 'الطب', value: 26 },
      { label: 'الآداب', value: 36 },
    ];
    const html = r(<MotionDonutChart data={data} size={240} />);
    const arcs = [...html.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
    expect(arcs.length).toBe(3);
    expect(arcs[0]).toMatch(/A 105 105 0 0 0 /); // sweep=0 → عكس عقارب الساعة
    expect(html).toContain('>100<');
    expect(html).toMatch(/38\u200e?%/); // Intl قد يضيف علامة LRM قبل %
    const cw = r(<MotionDonutChart data={data} size={240} clockwise />);
    expect(cw).toMatch(/A 105 105 0 0 1 /);
    const full = r(<MotionDonutChart data={[{ label: 'الكل', value: 5 }]} size={240} />);
    expect(full).toMatch(/A 105 105 0 1 0 .* A 105 105 0 1 0/); // شريحة كاملة = قوسان
  });

  it('MotionRadarChart: مضلّع لكل سلسلة يبدأ من المركز (d الأولي) وتسميات المحاور الستة', () => {
    const axes = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
    const html = r(<MotionRadarChart axes={axes} series={series.map((s) => ({ ...s, values: [55, 48, 40, 62, 35, 50] }))} size={300} />);
    for (const a of axes) expect(html).toContain(`>${a}<`);
    // في حالة الحركة: المسار الأولي كل نقاطه في المركز (150,150)
    expect(html).toMatch(/d="M 150\.00 150\.00 L 150\.00 150\.00/);
    withReducedMotion(true);
    const final = r(
      <MotionRadarChart axes={axes} series={[{ label: 's', values: [100, 100, 100, 100, 100, 100] }]} size={300} maxValue={100} showLegend={false} />,
    );
    expect(final).toMatch(/d="M 150\.00 48\.00/); // أول محور في الأعلى بنصف القطر الكامل (150-102)
  });

  it('Sparkline وMotionBarList: لون الاتجاه، نقطة النهاية، وترتيب تنازلي مع نسب العرض', () => {
    const up = r(<Sparkline values={[1, 2, 3]} />);
    const down = r(<Sparkline values={[3, 2, 1]} />);
    expect(up).toContain('stroke="#34d399"');
    expect(down).toContain('stroke="#fb7185"');
    expect((up.match(/<circle/g) ?? []).length).toBe(1);
    const list = r(
      <MotionBarList
        items={[
          { label: 'ب', value: 50 },
          { label: 'أ', value: 100 },
        ]}
        sorted
      />,
    );
    expect(list.indexOf('>أ<') === -1 ? list.indexOf('أ') : list.indexOf('>أ<')).toBeLessThan(list.indexOf('ب'));
    expect(list).toContain('width:100%');
    expect(list).toContain('width:50%');
    expect(list).toContain('dir="rtl"');
  });

  it('ChartFrame يضع العنوان قبل الرسم والخلاصة والمصدر بعده؛ وChartSkeleton/lazyChart يعرضان هيكلاً ثم الرسم', async () => {
    const html = r(
      <ChartFrame title="العنوان الخبري" note="الخلاصة" source="المصدر">
        <svg />
      </ChartFrame>,
    );
    expect(html.indexOf('العنوان الخبري')).toBeLessThan(html.indexOf('<svg'));
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('الخلاصة'));
    expect(html).toContain('<figcaption');
    expect(r(<ChartSkeleton height={200} />)).toContain('height:200px');
    const Pending = lazyChart<object>(() => new Promise(() => undefined), 120);
    const pending = await mount(<Pending />);
    expect(pending.host.innerHTML).toContain('role="status"');
    expect(pending.host.innerHTML).toContain('height: 120px');
    await pending.unmount();
    const Lazy = lazyChart(() => Promise.resolve({ default: () => <b>رسم</b> }), 120);
    const { host, flush, unmount } = await mount(<Lazy />);
    await flush();
    expect(host.innerHTML).toContain('<b>رسم</b>');
    await unmount();
  });
});

describe('مساعدات المكتبات (خفيفة، بلا تحميل المكتبة)', () => {
  it('Recharts: انعكاس RTL وحركة متتابعة تتعطّل مع تقليل الحركة', () => {
    expect(rechartsRtl.xAxis.reversed).toBe(true);
    expect(rechartsRtl.yAxis.orientation).toBe('right');
    expect(rechartsAnimation(2)).toMatchObject({ isAnimationActive: true, animationBegin: 600 });
    withReducedMotion(true);
    expect(rechartsAnimation(2)).toMatchObject({ isAnimationActive: false, animationBegin: 0 });
  });

  it('Nivo: السمة بخط القالب وتلميح RTL، وعكس البيانات لا يغيّر الأصل', () => {
    expect(nivoTheme.text?.fontFamily).toContain('--font-body');
    expect(nivoTheme.tooltip?.container?.direction).toBe('rtl');
    const src = [1, 2, 3];
    expect(nivoRtlData(src)).toEqual([3, 2, 1]);
    expect(src).toEqual([1, 2, 3]);
  });

  it('Chart.js: مقاييس RTL وتأخير تتابعي يحتسب الفهرس مرة واحدة', () => {
    expect(chartJsRtlScales).toMatchObject({ x: { reverse: true }, y: { position: 'right' } });
    const anim = chartJsStagger(100, 300).animation as { delay: (ctx: unknown) => number };
    const ctx = { type: 'data', mode: 'default', dataIndex: 3, datasetIndex: 1 };
    expect(anim.delay(ctx)).toBe(600);
    expect(anim.delay(ctx)).toBe(0); // dropped → لا تكرار
    withReducedMotion(true);
    expect(chartJsStagger().animation).toBe(false);
  });

  it('ECharts: echartsRtl يعكس المحور ويضع الرأسي يميناً (مصفوفات أيضاً) وechartsAnimation يتعطّل مع تقليل الحركة', () => {
    const o = echartsRtl({ xAxis: { type: 'category', data: ['أ'] }, yAxis: [{}, {}], legend: {}, series: [] });
    expect(o.xAxis).toMatchObject({ inverse: true, type: 'category' });
    expect(o.yAxis).toEqual([{ position: 'right' }, { position: 'right' }]);
    expect(o.legend).toMatchObject({ right: 0 });
    expect(o.grid).toMatchObject({ containLabel: true });
    expect((echartsAnimation(50) as { animationDelay: (i: number) => number }).animationDelay(3)).toBe(150);
    withReducedMotion(true);
    expect(echartsAnimation()).toEqual({ animation: false });
  });

  it('نقطة الدخول @/components/charts لا تسحب مكتبة ثقيلة (المكونات الكسولة فقط)', () => {
    for (const n of [
      'MotionBarChart',
      'MotionLineChart',
      'MotionDonutChart',
      'MotionRadarChart',
      'Sparkline',
      'MotionBarList',
      'ChartFrame',
      'lazyChart',
      'ChartJs',
      'EChart',
    ])
      expect(charts).toHaveProperty(n);
    expect(charts).not.toHaveProperty('ChartContainer'); // Recharts عبر @/components/charts/recharts فقط
  });
});

describe('المكتبات الفعلية تُصيَّر في jsdom', () => {
  it('Recharts: ChartContainer المستعار يحقن متغيّرات الألوان، والمحاور المعكوسة ترسم العمود الأول يميناً والمحور الرأسي يميناً', async () => {
    const { ChartContainer, rechartsConfig } = await import('@/components/charts/recharts');
    const { Bar, BarChart, XAxis, YAxis } = await import('recharts');
    const config = rechartsConfig({ a: 'أ' });
    const html = r(
      <ChartContainer config={config} className="h-[200px]">
        <BarChart data={[{ x: '1', a: 1 }]}>
          <Bar dataKey="a" fill="var(--color-a)" />
        </BarChart>
      </ChartContainer>,
    );
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('--color-a: #fbbf24');
    // ResponsiveContainer لا يقيس في jsdom؛ نختبر المحاور بأبعاد ثابتة
    const { host, flush, unmount } = await mount(
      <BarChart
        width={400}
        height={200}
        data={[
          { x: 'أ', a: 1 },
          { x: 'ب', a: 3 },
        ]}
      >
        <XAxis dataKey="x" {...rechartsAnimation(0)} {...rechartsRtl.xAxis} />
        <YAxis {...rechartsRtl.yAxis} />
        <Bar dataKey="a" fill="#fbbf24" isAnimationActive={false} />
      </BarChart>,
    );
    await flush();
    const rects = [...host.querySelectorAll<SVGPathElement>('.recharts-bar-rectangle path')].map((p) => Number(p.getAttribute('x')));
    expect(rects.length).toBe(2);
    expect(rects[0]).toBeGreaterThan(rects[1]); // الفئة الأولى يميناً
    const yLine = host.querySelector<SVGLineElement>('.recharts-yAxis .recharts-cartesian-axis-line');
    expect(Number(yLine?.getAttribute('x1'))).toBeGreaterThan(300); // المحور الرأسي على اليمين
    await unmount();
  });

  it('Nivo: Bar يرسم مستطيلاً لكل قيمة بسمة القالب دون حركة', async () => {
    const { Bar } = await import('@nivo/bar');
    const html = r(
      <Bar
        width={400}
        height={200}
        data={[
          { id: 'أ', v: 3 },
          { id: 'ب', v: 5 },
        ]}
        keys={['v']}
        indexBy="id"
        theme={nivoTheme}
        animate={false}
        axisLeft={null}
        axisRight={{}}
      />,
    );
    expect((html.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('>أ<');
  });

  it('Chart.js: setupChartJs يضبط الافتراضيات (RTL، الخط، المحلية) مرة واحدة', async () => {
    const { setupChartJs } = await import('@/components/charts/chartjs/setup');
    const Chart = setupChartJs();
    expect(setupChartJs()).toBe(Chart);
    expect(Chart.defaults.plugins.legend.rtl).toBe(true);
    expect(Chart.defaults.plugins.tooltip.textDirection).toBe('rtl');
    expect(Chart.defaults.font.family).toContain('--font-body');
    expect(Chart.defaults.locale).toBe(chartSettings.locale);
  });

  it('ECharts: القطعة الكسولة تسجّل السمة وترسم بمصيّر SVG', async () => {
    const mod = await import('@/components/charts/echarts/internal/EChartCanvas');
    const EChartCanvas = mod.default;
    const { host, flush, unmount } = await mount(
      <EChartCanvas
        option={{ xAxis: { type: 'category', data: ['أ', 'ب'] }, yAxis: {}, series: [{ type: 'bar', data: [1, 2] }], animation: false }}
        height={200}
        renderer="svg"
      />,
    );
    await flush();
    expect(host.querySelector('[dir="ltr"]')).not.toBeNull();
    expect(host.innerHTML).toContain('<svg');
    await unmount();
  });
});

// DUMP_CHARTS=1 → يكتب SVG الحالة النهائية إلى /tmp/charts/ للفحص البصري (resvg)
if (process.env.DUMP_CHARTS) {
  it('تفريغ SVG للفحص البصري', () => {
    withReducedMotion(true);
    mkdirSync('/tmp/charts', { recursive: true });
    const wrap = (svg: string) => svg.replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" style="background:#020617" ');
    const pick = (html: string) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>') + 6);
    writeFileSync('/tmp/charts/bar.svg', wrap(pick(r(<MotionBarChart categories={categories} series={series} width={640} highlight="2025" />))));
    writeFileSync(
      '/tmp/charts/bar-h.svg',
      wrap(
        pick(
          r(
            <MotionBarChart
              categories={['ورقلة', 'الجزائر', 'وهران']}
              series={[{ label: 'م', values: [1284, 1120, 860] }]}
              layout="horizontal"
              width={640}
              height={220}
            />,
          ),
        ),
      ),
    );
    writeFileSync('/tmp/charts/stacked.svg', wrap(pick(r(<MotionBarChart categories={categories} series={series} stacked width={640} />))));
    writeFileSync('/tmp/charts/line.svg', wrap(pick(r(<MotionLineChart categories={categories} series={series} width={640} area />))));
    writeFileSync(
      '/tmp/charts/donut.svg',
      wrap(
        pick(
          r(
            <MotionDonutChart
              data={[
                { label: 'الهندسة', value: 38 },
                { label: 'الطب', value: 26 },
                { label: 'الآداب', value: 36 },
              ]}
              size={260}
              centerLabel="المجموع"
            />,
          ),
        ),
      ),
    );
    writeFileSync(
      '/tmp/charts/radar.svg',
      wrap(
        pick(
          r(
            <MotionRadarChart
              axes={['التحليل', 'التواصل', 'القيادة', 'البرمجة', 'التصميم', 'اللغات']}
              series={[
                { label: 'قبل', values: [55, 48, 40, 62, 35, 50] },
                { label: 'بعد', values: [82, 76, 70, 88, 66, 74] },
              ]}
              size={320}
              maxValue={100}
            />,
          ),
        ),
      ),
    );
    writeFileSync('/tmp/charts/spark.svg', wrap(pick(r(<Sparkline values={[42, 55, 51, 68, 74, 70, 88, 97]} width={200} height={60} />))));
  });
}
