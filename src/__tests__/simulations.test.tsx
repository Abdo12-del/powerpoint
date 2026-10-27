// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateResult, domains, initialValues, simulations } from '@/simulations/catalog';
import { InteractiveSimulations } from '@/simulations/InteractiveSimulations';

describe('حزمة المحاكاة التفاعلية', () => {
  it('توفّر تجربة مهيّأة لكل من الفيزياء والكيمياء والأحياء والرياضيات', () => {
    expect(domains.map(({ id }) => id)).toEqual(['physics', 'chemistry', 'biology', 'mathematics']);
    expect(simulations).toHaveLength(4);
    simulations.forEach((simulation) => {
      expect(Object.keys(initialValues(simulation))).toHaveLength(3);
      expect(simulation.parameters.every((parameter) => parameter.min < parameter.max && parameter.step > 0)).toBe(true);
    });
  });

  it('يحسب المدى الفيزيائي وفق معادلة المقذوفات ويعرض نقاط المسار', () => {
    const projectile = simulations.find(({ id }) => id === 'projectile')!;
    const result = calculateResult('projectile', initialValues(projectile), 0);
    expect(result.value).toBeCloseTo(40.8, 0);
    expect(result.points).toHaveLength(80);
    expect(result.points[0]?.y).toBeCloseTo(0);
    expect(result.points.at(-1)?.y).toBeCloseTo(0);
  });

  it('تتفاعل نتائج الكيمياء والانتشار مع متغيراتها، ويظل ناتج الموجة ضمن السعة', () => {
    const chemistry = simulations.find(({ id }) => id === 'molecule')!;
    const chemValues = initialValues(chemistry);
    const baseRate = calculateResult('molecule', chemValues, 0).value;
    expect(calculateResult('molecule', { ...chemValues, temperature: 75 }, 0).value).toBeGreaterThan(baseRate);
    const biology = simulations.find(({ id }) => id === 'cell')!;
    const bioValues = initialValues(biology);
    expect(calculateResult('cell', { ...bioValues, permeability: 100 }, 0).value).toBeGreaterThan(calculateResult('cell', bioValues, 0).value);
    const mathematics = simulations.find(({ id }) => id === 'wave')!;
    const mathResult = calculateResult('wave', initialValues(mathematics), 0);
    expect(Math.max(...mathResult.points.map(({ y }) => Math.abs(y)))).toBeLessThanOrEqual(initialValues(mathematics).amplitude + 0.01);
  });

  it('يعرض واجهة عربية RTL بعناصر التحكم والنتائج والرسوم البيانية', () => {
    const html = renderToStaticMarkup(<InteractiveSimulations />);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('متغيرات التجربة');
    expect(html).toContain('حركة المقذوفات');
    expect(html).toContain('العرض ثلاثي الأبعاد');
    expect(html).toContain('رسم بياني حي لنتائج المحاكاة');
    expect(html).toContain('إعادة التجربة');
  });
});
