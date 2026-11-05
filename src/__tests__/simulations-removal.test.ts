import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * حراسة إزالة مختبر المحاكاة: لا صفحة مستقلة ولا مدخل ?lab=simulations،
 * ولا اعتمادات كانت حكراً عليه. حلت محله حزمة المعدات العلمية داخل العارض.
 */
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

describe('إزالة واجهة مختبر المحاكاة', () => {
  it('لا مدخل للمختبر في نقطة الدخول ولا إشارة إليه في الواجهة', () => {
    const main = read('src/main.tsx');
    expect(main).not.toContain('simulations');
    expect(main).not.toContain('SimulationLab');
    expect(main).not.toContain('InteractiveSimulations');
  });

  it('ملفات المختبر واختباراته ووثائقه الخاصة أزيلت', () => {
    expect(existsSync(root + 'src/simulations')).toBe(false);
    expect(existsSync(root + 'src/__tests__/simulations.test.tsx')).toBe(false);
    expect(existsSync(root + 'docs/INTERACTIVE_SIMULATIONS.md')).toBe(false);
  });

  it('الاعتمادات التي كانت حكراً على المختبر أزيلت من package.json', () => {
    const pkg = JSON.parse(read('package.json')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.dependencies['bn-lab-simulations']).toBeUndefined();
    expect(pkg.dependencies['matter-js']).toBeUndefined();
    expect(pkg.dependencies.p5).toBeUndefined();
    expect(pkg.devDependencies['@types/matter-js']).toBeUndefined();
    // اعتمادات مشتركة بقيت لأنها مستخدمة في بقية المشروع
    expect(pkg.dependencies.three).toBeDefined();
    expect(pkg.dependencies['lucide-react']).toBeDefined();
  });

  it('README لم يعد يعد بمختبر المحاكاة ويذكر المعدات العلمية بدلاً منه', () => {
    const readme = read('README.md');
    expect(readme).not.toContain('?lab=simulations');
    expect(readme).not.toContain('INTERACTIVE_SIMULATIONS.md');
    expect(readme).toContain('المعدات العلمية');
  });

  it('حزمة المعدات العلمية موجودة داخل العارض (لا صفحة مستقلة)', () => {
    expect(existsSync(root + 'src/equipment/EquipmentPanel.tsx')).toBe(true);
    expect(existsSync(root + 'src/equipment/EquipmentLayer.tsx')).toBe(true);
    const main = read('src/main.tsx');
    expect(main).not.toContain('equipment'); // لا مسار ?lab= جديداً — الميزة داخل العارض
    const presentation = read('src/components/Presentation.tsx');
    expect(presentation).toContain('useEquipment');
    expect(presentation).toContain('EquipmentPanel');
  });
});
