// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// محاكاة Lenis (المختبر يغلّفه)
vi.mock('lenis', () => {
  class FakeLenis {
    scroll = 0;
    progress = 0;
    velocity = 0;
    on() {}
    off() {}
    raf() {}
    destroy() {}
  }
  return { default: FakeLenis };
});

import { buildDistilbookTimeline } from '@/distilbook/timeline';
import { DEFAULT_DISTILBOOK_CONFIG, DISTILBOOK_SCENES, DISTILBOOK_DURATION, REF_EDGES, REF_NODES } from '@/distilbook/types';
import { DistilbookShowreel } from '@/distilbook/DistilbookShowreel';
import type { DistilbookShowreelHandle } from '@/distilbook/DistilbookShowreel';
import { DistilbookLab } from '@/distilbook/lab/DistilbookLab';
import { OpeningScene } from '@/distilbook/scenes/OpeningScene';
import { ProblemScene } from '@/distilbook/scenes/ProblemScene';
import { DistillScene } from '@/distilbook/scenes/DistillScene';
import { IdeasScene } from '@/distilbook/scenes/IdeasScene';
import { ReferencesScene } from '@/distilbook/scenes/ReferencesScene';
import { SummaryScene } from '@/distilbook/scenes/SummaryScene';
import { FinaleScene } from '@/distilbook/scenes/FinaleScene';

// React 19: فعّل بيئة act صراحةً في jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  // jsdom بلا سياقات canvas/WebGL — يجب أن تسلك الحزمة مسار البديل الآمن
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

describe('مشاهد Distilbook — ماركب ثابت', () => {
  const cfg = DEFAULT_DISTILBOOK_CONFIG;

  it('الافتتاح: حروف العلامة + الشرارات + الوعد', () => {
    const html = renderToStaticMarkup(<OpeningScene brand={cfg.brand} tagline={cfg.tagline} />);
    expect(html).toContain('data-scene="opening"');
    expect((html.match(/data-letter/g) ?? []).length).toBe(cfg.brand.length);
    expect((html.match(/data-spark/g) ?? []).length).toBe(10);
    expect(html).toContain('منصة تلخيص الأبحاث والكتب');
  });

  it('المشكلة: 8 صفحات تتكدس وعدّاد الحجم', () => {
    const html = renderToStaticMarkup(<ProblemScene />);
    expect((html.match(/data-page/g) ?? []).length).toBe(8);
    expect(html).toContain('٤٠ صفحة');
    expect(html).toContain('بحث علمي واحد قبل المؤتمر');
  });

  it('التقطير: بلا WebGL يعرض بديل CSS بنفس الاستعارة', () => {
    const html = renderToStaticMarkup(<DistillScene active={false} bpm={124} />);
    expect(html).toContain('data-scene="distill"');
    expect(html).toContain('WebGL غير متوفر');
    expect(html).toContain('data-purity');
    expect(html).toContain('كثافة');
  });

  it('الأفكار: عنوان حركي + شرائح بعدد الأفكار', () => {
    const html = renderToStaticMarkup(<IdeasScene ideas={cfg.ideas} />);
    expect((html.match(/data-word/g) ?? []).length).toBe(4);
    expect((html.match(/data-idea/g) ?? []).length).toBe(cfg.ideas.length);
    expect(html).toContain('سؤال البحث');
  });

  it('المراجع: شبكة SVG تطابق بيانات العقد والوصلات', () => {
    const html = renderToStaticMarkup(<ReferencesScene />);
    expect((html.match(/data-ref-node/g) ?? []).length).toBe(REF_NODES.length);
    expect((html.match(/data-edge/g) ?? []).length).toBe(REF_EDGES.length);
    expect(html).toContain('بحثك');
    expect(html).toContain('+١٢٠ مصدراً');
    // الوصلات تُرسم بأسلوب pathLength=1
    expect(html).toContain('pathLength="1"');
  });

  it('الملخصات: 3 بطاقات × نقاط وبذيقات مصدر', () => {
    const html = renderToStaticMarkup(<SummaryScene cards={cfg.summaryCards} />);
    expect((html.match(/data-card/g) ?? []).length).toBe(3);
    expect(html).toContain('الملخص التنفيذي');
    expect(html).toContain('BibTeX');
  });

  it('الختام: العلامة + أرقام القيمة + دعوة التجربة', () => {
    const html = renderToStaticMarkup(<FinaleScene config={cfg} />);
    expect(html).toContain(cfg.brand);
    expect(html).toContain(cfg.tagline);
    expect((html.match(/data-stat/g) ?? []).length).toBe(cfg.stats.length);
    expect(html).toContain(cfg.cta);
  });
});

describe('الخط الزمني الرئيسي — GSAP Master Timeline', () => {
  it('يُبنى بمدة القصة كاملة ويتحمّل المسح العشوائي (Seek)', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    root.innerHTML = DISTILBOOK_SCENES.map((s) => `<div data-scene="${s.id}"></div>`).join('');

    const times: number[] = [];
    const { tl, destroy } = buildDistilbookTimeline(root, {
      config: DEFAULT_DISTILBOOK_CONFIG,
      loop: false,
      onTime: (t) => times.push(t),
    });
    expect(tl.duration()).toBeGreaterThanOrEqual(DISTILBOOK_DURATION - 0.01);

    // قفزات حرة — الحتمية جوهر فلسفة Motion Canvas هنا
    expect(() => tl.time(0)).not.toThrow();
    expect(() => tl.time(7.3)).not.toThrow();
    expect(() => tl.time(DISTILBOOK_DURATION)).not.toThrow();
    expect(tl.time()).toBeCloseTo(DISTILBOOK_DURATION, 3);
    tl.time(2.7);
    expect(tl.time()).toBeCloseTo(2.7, 3);

    destroy();
    root.remove();
  });

  it('الحلقة اللانهائية تُفعَّل عبر repeat', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    root.innerHTML = `<div data-scene="opening"></div>`;
    const { tl, destroy } = buildDistilbookTimeline(root, {
      config: DEFAULT_DISTILBOOK_CONFIG,
      loop: true,
    });
    expect(tl.repeat()).toBe(-1);
    destroy();
    root.remove();
  });
});

describe('مكوّن الشورييل — DistilbookShowreel', () => {
  let root: Root;
  let container: HTMLDivElement;

  afterEach(async () => {
    if (root) {
      await act(async () => root.unmount());
    }
    container?.remove();
  });

  it('يُركّب المشاهد السبعة + HUD + التحكم، والبديل الآمن في jsdom', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<DistilbookShowreel autoPlay={false} />);
    });

    const html = container.innerHTML;
    expect(container.querySelector('[data-testid="distilbook-showreel"]')).toBeTruthy();
    for (const s of DISTILBOOK_SCENES) {
      expect(html).toContain(`data-scene="${s.id}"`);
    }
    expect(container.querySelector('[data-testid="distilbook-scene"]')?.textContent).toContain('الافتتاح');
    expect(container.querySelector('[data-testid="distilbook-time"]')?.textContent).toContain('/ 20s');
    expect(container.querySelector('[data-testid="distilbook-play"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="distilbook-scrub"]')).toBeTruthy();
    // التقطير على بديله الآمن
    expect(html).toContain('WebGL غير متوفر');
  });

  it('المقبض يقفز زمنياً: seek يحدّث الشارة والمشهد الفعّال', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const handleRef = { current: null as DistilbookShowreelHandle | null };
    await act(async () => {
      root.render(<DistilbookShowreel ref={handleRef} autoPlay={false} />);
    });

    await act(async () => {
      handleRef.current?.seek(13); // مشهد المراجع
    });
    expect(container.querySelector('[data-testid="distilbook-scene"]')?.textContent).toContain('المراجع');
    expect(container.querySelector('[data-testid="distilbook-time"]')?.textContent).toContain('13.0s');

    await act(async () => {
      handleRef.current?.seek(18.5); // الختام
    });
    expect(container.querySelector('[data-testid="distilbook-scene"]')?.textContent).toContain('الختام');
    // الختام أصبح مرئياً بعد القفز إليه (كشف العلامة)
    const finale = container.querySelector('[data-scene="finale"]') as HTMLElement;
    expect(Number(getComputedStyle(finale).opacity)).toBeGreaterThan(0.5);
  });
});

describe('مختبر Distilbook — ?lab=distilbook', () => {
  let root: Root;
  let container: HTMLDivElement;

  afterEach(async () => {
    if (root) {
      await act(async () => root.unmount());
    }
    container?.remove();
  });

  it('يُركّب: ترويسة + شورييل + فصول قابلة للقفز + لوحة قصة + هوية', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<DistilbookLab />);
    });

    const html = container.innerHTML;
    expect(html).toContain('Distilbook');
    expect(html).toContain('حزمة الموشن جرافيك البحثي');
    expect(container.querySelector('[data-testid="distilbook-showreel"]')).toBeTruthy();
    // فصول القصة السبعة
    for (const s of DISTILBOOK_SCENES) {
      expect(container.querySelector(`[data-testid="chapter-${s.id}"]`), s.id).toBeTruthy();
    }
    // لوحة القصة والهوية
    expect(html).toContain('لوحة القصة');
    expect(html).toContain('الهوية البصرية');
    expect(html).toContain('#2dd4bf');
    expect(html).toContain('الاستعمال في الشرائح');
  });
});
