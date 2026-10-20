// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { presentation } from '@/data/presentation';

// jsdom بلا سياق canvas — الحزمة يجب أن تسلك مسار الصمت الكامل
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

// جسيمات خلفية العنوان تحتاج OffscreenCanvas — نعزلها في هذه الاختبارات
vi.mock('@tsparticles/react', () => ({
  default: () => null,
  ParticlesProvider: () => null,
}));

// React 19: فعّل بيئة act صراحةً
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import { ChalkboardOverlay } from '@/chalkboard/ChalkboardOverlay';
import { useChalkboard } from '@/chalkboard/useChalkboard';
import { ChalkboardLab } from '@/chalkboard/lab/ChalkboardLab';
import { STORAGE_KEY } from '@/chalkboard/store';
import { Presentation } from '@/components/Presentation';

/** يثبّت خطاف useChalkboard — بأزرار نمط كنمط المختبر/العرض (المفاتيح تسلك مسار Presentation) */
function Harness({ layerId = 'title', layerLabel = 'شاشة العنوان' }: { layerId?: string; layerLabel?: string }) {
  const board = useChalkboard();
  return (
    <div>
      <button type="button" data-testid="h-notes" onClick={board.toggleNotes}>n</button>
      <button type="button" data-testid="h-board" onClick={board.toggleBoard}>b</button>
      <ChalkboardOverlay board={board} layerId={layerId} layerLabel={layerLabel} />
    </div>
  );
}

/** إطلاق زر لوحة مفاتيح على النافذة */
function pressKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('السبورة — طبقة العرض (ChalkboardOverlay)', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('الوضع المغلق: طبقة السبورة لا تُصيَّر إطلاقاً (القالب الأبيض يبقى نظيفاً)', () => {
    const html = renderToStaticMarkup(<Harness />);
    expect(html).not.toContain('chalkboard-overlay');
    expect(html).not.toContain('chalkboard-canvas');
    expect(html).not.toContain('chalkboard-toolbar');
  });

  it('أدوات شريط السبورة تتبدل: أداة/لون/سُمك', async () => {
    await act(async () => {
      root.render(<Harness />);
    });
    await act(async () => {
      (container.querySelector('[data-testid="h-notes"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')?.getAttribute('data-mode')).toBe('notes');

    // تبديل أداة إلى ممحاة
    await act(async () => {
      (container.querySelector('[data-testid="cb-tool-eraser"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="cb-tool-eraser"]')?.getAttribute('aria-pressed')).toBe('true');

    // اختيار لون وسُمك
    await act(async () => {
      (container.querySelector('[data-testid="cb-color"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="cb-width-2"]') as HTMLButtonElement).click();
    });
    // الشارة تعرض اسم الطبقة
    expect(container.querySelector('[data-testid="cb-badge"]')?.textContent).toContain('شاشة العنوان');
  });

  it('B يفتح السبورة المستقلة: صفحات بالأسهم وإغلاق بـ Esc', async () => {
    await act(async () => {
      root.render(<Harness />);
    });
    await act(async () => {
      (container.querySelector('[data-testid="h-board"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')?.getAttribute('data-mode')).toBe('board');

    // الصفحة 1/3+ عبر أزرار التنقل
    const page = () => container.querySelector('[data-testid="cb-page"]')?.textContent ?? '';
    expect(page()).toBe('1/3');
    const nav = (testid: string) => {
      return act(async () => {
        (container.querySelector(`[data-testid="${testid}"]`) as HTMLButtonElement).click();
      });
    };
    await nav('cb-board-next');
    expect(page()).toBe('2/3');
    await nav('cb-board-prev');
    expect(page()).toBe('1/3');
    // آخر صفحة + التالي = صفحة جديدة (روح الإضافة الأصلية)
    await nav('cb-board-next');
    await nav('cb-board-next');
    expect(page()).toBe('3/3');
    await nav('cb-board-next');
    expect(page()).toBe('4/4');

    await act(async () => {
      (container.querySelector('[data-testid="cb-close"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')).toBeNull();
  });

  it('زر إنهاء السبورة وتراجع/مسح لا يرميان في jsdom (بلا سياق رسم)', async () => {
    await act(async () => {
      root.render(<Harness />);
    });
    await act(async () => {
      (container.querySelector('[data-testid="h-board"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="cb-undo"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="cb-clear"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="cb-download"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="cb-close"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')).toBeNull();
  });
});

describe('التكامل مع العرض المباشر — Presentation', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('القالب الأبيض: السبورة صامتة افتراضياً وزر السبورة موجود في شريط التحكم', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')).toBeNull();
    expect(container.querySelector('[aria-label="سبورة مستقلة (B)"]')).toBeTruthy();
  });

  it('B من لوحة المفاتيح يفتح السبورة فوق العرض ويغطي كل شيء', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    await act(async () => pressKey('b'));
    const overlay = container.querySelector('[data-testid="chalkboard-overlay"]');
    expect(overlay?.getAttribute('data-mode')).toBe('board');
    expect(container.querySelector('[data-testid="cb-badge"]')?.textContent).toContain('سبورة مستقلة');
    // الأسهم تقلّب صفحات السبورة لا الشرائح
    await act(async () => pressKey('ArrowRight'));
    expect(container.querySelector('[data-testid="cb-page"]')?.textContent).toContain('2/');
    // Esc يغلق
    await act(async () => pressKey('Escape'));
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')).toBeNull();
  });

  it('C يفعّل التعليق، وDelete يمسح — والشارة تحمل اسم الشريحة', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    await act(async () => pressKey('c'));
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')?.getAttribute('data-mode')).toBe('notes');
    expect(container.querySelector('[data-testid="cb-badge"]')?.textContent).toContain('تعليق');
    await act(async () => pressKey('Delete'));
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')).toBeTruthy(); // يبقى مفتوحاً بعد المسح
    await act(async () => pressKey('c'));
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')).toBeNull();
  });
});

describe('مختبر السبورة — ?lab=chalkboard', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('يُركّب: ترويسة + شرائح نموذجية + أزرار النمط + قائمة الميزات', async () => {
    await act(async () => {
      root.render(<ChalkboardLab />);
    });
    const html = container.innerHTML;
    expect(html).toContain('حزمة السبورة والتعليق');
    expect(html).toContain('reveal.js-plugins');
    expect(container.querySelector('[data-testid="lab-layer-demo-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="lab-toggle-notes"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="lab-toggle-board"]')).toBeTruthy();
    expect(html).toContain('ما في الحزمة');

    // التنقل بين الشرائح النموذجية يغيّر الطبقة (index 2 = demo-3)
    await act(async () => {
      (container.querySelector('[data-testid="lab-slide-2"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="lab-layer-demo-3"]')).toBeTruthy();

    // فتح التعليق من أزرار المختبر
    await act(async () => {
      (container.querySelector('[data-testid="lab-toggle-notes"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="chalkboard-overlay"]')?.getAttribute('data-mode')).toBe('notes');

    // مسح شامل لا يرمي
    await act(async () => {
      (container.querySelector('[data-testid="lab-reset"]') as HTMLButtonElement).click();
    });
    expect(true).toBe(true);
  });
});
