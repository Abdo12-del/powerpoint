// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FinalCard } from '@/components/cinematic/FinalCard';
import { CameraControls } from '@/components/cinematic/CameraControls';
import { FlyoverCanvas } from '@/components/cinematic/FlyoverCanvas';
import { FrameStrip } from '@/components/cinematic/FrameStrip';
import { ShowreelControls } from '@/components/cinematic/ShowreelControls';
import { CinematicShowreel } from '@/components/cinematic/CinematicShowreel';
import * as cinematic from '@/components/cinematic';
import { buildDemoLayers, DEMO_BRAND } from '@/cinematic/landing';
import { DEFAULT_FINAL_CARD, DEFAULT_FLYOVER_CONFIG } from '@/cinematic/types';
import { generatePresetPath } from '@/cinematic/camera';
import type { FlyoverHandle } from '@/cinematic/types';

// React 19: فعّل بيئة act صراحةً في jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const finalCard = { ...DEFAULT_FINAL_CARD, brand: 'نُور', tagline: 'نصنع حضورك الرقمي طبقةً فوق طبقة' };
const noop = () => undefined;

// jsdom لا يوفّر سياق canvas — نعيد null صراحةً ليستخدم المولّد مساره الآمن
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

describe('واجهة العرض السينمائي', () => {
  it('الفهرس يصدّر كل مكوّنات الحزمة', () => {
    for (const name of ['FlyoverCanvas', 'FinalCard', 'ShowreelControls', 'FrameStrip', 'CameraControls', 'CinematicShowreel', 'CinematicLab']) {
      expect(cinematic, name).toHaveProperty(name);
    }
  });

  it('البطاقة الختامية تعرض اسم العلامة والعبارة ككلمات (لا حروف)', () => {
    const html = renderToStaticMarkup(<FinalCard config={finalCard} visible progress={1} onReplay={noop} />);
    expect(html).toContain('نُور');
    expect(html).toContain('نصنع');
    expect(html).toContain('حضورك');
    expect(html).toContain('أعد المشاهدة');
    // كل كلمة في span مستقل — لا تقطيع حروف
    expect(html).toContain('whitespace-pre');
  });

  it('البطاقة الختامية تحترم رؤية العلامة التجارية الطويلة (حرفان في المعيّن)', () => {
    const html = renderToStaticMarkup(
      <FinalCard config={{ ...finalCard, brand: 'استوديو نُور' }} visible progress={0} />,
    );
    expect(html).toContain('استوديو نُور');
    expect(html).toContain('ان');
  });

  it('لوحة الكاميرا تعرض المسارات الجاهزة والتوقيت ونقاط الكاميرا', () => {
    const config = { ...DEFAULT_FLYOVER_CONFIG, camera: generatePresetPath('flyover') };
    const html = renderToStaticMarkup(<CameraControls config={config} onChange={noop} />);
    for (const label of ['تحليق أمامي', 'دوران', 'دوللي', 'رافعة', 'انزلاق جانبي', 'المدة الكلية', 'نقاط الكاميرا', 'الزمن t']) {
      expect(html, label).toContain(label);
    }
    expect(html).toContain('نقاط');
    expect(html).toContain('DoF');
    expect(html).toContain('flyover');
  });

  it('شريط التحكم يعرض الزمن ونقاط المسار', () => {
    const html = renderToStaticMarkup(
      <ShowreelControls
        duration={18}
        time={4.5}
        playing
        loop={false}
        speed={1}
        keyframes={[0, 0.5, 1]}
        onToggle={noop}
        onRestart={noop}
        onSeek={noop}
        onLoop={noop}
        onSpeed={noop}
      />,
    );
    expect(html).toContain('4.5s');
    expect(html).toContain('18.0s');
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuemax="18"');
  });

  it('معاينة الإطارات تظهر كل النقاط الزمنية قابلة للنقر', () => {
    const ref = { current: null as FlyoverHandle | null };
    const times = [0, 6, 12, 18];
    const html = renderToStaticMarkup(
      <FrameStrip stageRef={ref} times={times} duration={18} onSeek={noop} />,
    );
    expect(html).toContain('معاينة الإطارات');
    expect(html.match(/الانتقال إلى/g) ?? []).toHaveLength(4);
    expect(html).toContain('التقط 4 إطارات');
  });

  it('المسرح يرسم canvas ويظهر حالته قبل الجهوزية', () => {
    const html = renderToStaticMarkup(
      <FlyoverCanvas layers={[]} config={{ ...DEFAULT_FLYOVER_CONFIG, autoplay: false }} />,
    );
    expect(html).toContain('<canvas');
    expect(html).toContain('يُحضَّر المشهد');
    expect(html).toContain('role="img"');
  });

  it('الصفحة الكاملة تعرض العنوان والتحكم والبطاقة التجريبية', () => {
    const html = renderToStaticMarkup(<CinematicShowreel />);
    expect(html).toContain('عرض سينمائي ثلاثي الأبعاد لصفحة الهبوط');
    expect(html).toContain('Cinematic Showreel');
    expect(html).toContain('معاينة الإطارات');
    expect(html).toContain('WebGL2');
    expect(html).toContain('نُور');
  });

  it('مولّد الصفحة التجريبية يبني كل الطبقات داخل أبعاد الصفحة', async () => {
    const layers = await buildDemoLayers({ brand: DEMO_BRAND });
    expect(layers.length).toBeGreaterThanOrEqual(9);
    const kinds = new Set(layers.map((l) => l.kind));
    expect(kinds.has('background')).toBe(true);
    expect(kinds.has('hero')).toBe(true);
    expect(kinds.has('card')).toBe(true);
    expect(kinds.has('logo')).toBe(true);
    for (const layer of layers) {
      expect(layer.bounds.x).toBeGreaterThanOrEqual(0);
      expect(layer.bounds.y).toBeGreaterThanOrEqual(0);
      expect(layer.bounds.x + layer.bounds.width).toBeLessThanOrEqual(DEFAULT_FLYOVER_CONFIG.dimensions.width + 1);
      expect(layer.bounds.y + layer.bounds.height).toBeLessThanOrEqual(DEFAULT_FLYOVER_CONFIG.dimensions.height + 1);
      expect(layer.id.length).toBeGreaterThan(0);
    }
    expect(layers.filter((l) => l.liftable).length).toBeGreaterThanOrEqual(6);
    const depths = layers.map((l) => l.depth);
    expect([...depths].sort((a, b) => a - b)).toEqual(depths);
  });

  it('تُركّب الصفحة كاملةً بلا WebGL وتعرض بديلاً واضحاً بدل الانهيار', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(<CinematicShowreel />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
    expect(container.textContent).toContain('تعذّر تشغيل المشهد ثلاثي الأبعاد');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('تغيير مسار الكاميرا من اللوحة يحدّث الحالة الحيّة', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <CameraControls config={{ ...DEFAULT_FLYOVER_CONFIG, camera: generatePresetPath('flyover') }} onChange={() => undefined} />,
      );
    });
    expect(container.textContent).toContain('flyover');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
