// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// جسيمات خلفية العنوان تحتاج OffscreenCanvas — نعزلها هنا
vi.mock('@tsparticles/react', () => ({
  default: () => null,
  ParticlesProvider: () => null,
}));

import { SpotlightOverlay } from '@/spotlight/SpotlightOverlay';
import { useSpotlight } from '@/spotlight/useSpotlight';
import { SpotlightLab } from '@/spotlight/lab/SpotlightLab';
import { presentation } from '@/data/presentation';
import { Presentation } from '@/components/Presentation';
import { SHORTCUTS } from '@/config/controls';

// React 19: فعّل بيئة act صراحةً في jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom بلا سياق canvas — الحزم تسلك مسار الصمت
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

/** يثبّت الخطاف مع أزرار تشغيل (نمط المختبر/العرض) */
function Harness() {
  const spot = useSpotlight();
  return (
    <div>
      <button type="button" data-testid="h-zoom" onClick={spot.toggleZoomCenter}>z</button>
      <button type="button" data-testid="h-spotlight" onClick={spot.toggleSpotlight}>s</button>
      <button type="button" data-testid="h-laser" onClick={spot.toggleLaser}>l</button>
      <button
        type="button"
        data-testid="h-zoomat"
        onClick={() => spot.zoomAt(300, 200, new DOMRect(0, 0, 1280, 720))}
      >
        at
      </button>
      <div data-testid="h-zoom-info">{spot.zoomActive ? `×${spot.zoom.scale}` : '×1'}</div>
      <SpotlightOverlay spot={spot} />
    </div>
  );
}

/** إطلاق حدث مؤشر على عنصر (jsdom بلا PointerEvent constructor — MouseEvent بالاسم يكفي) */
function pointerDown(el: Element, clientX: number, clientY: number, alt = false): void {
  el.dispatchEvent(
    new MouseEvent('pointerdown', { altKey: alt, clientX, clientY, bubbles: true, cancelable: true }),
  );
}

function pressKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('طبقات التركيز — SpotlightOverlay', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('بلا تفعيل: لا شيء يُصيَّر', () => {
    const html = renderToStaticMarkup(<Harness />);
    expect(html).not.toContain('spotlight-overlay');
    expect(html).not.toContain('spotlight-spot');
    expect(html).not.toContain('laser-canvas');
  });

  it('S يعرض طبقة التسليط بشارة نصف القطر وL يعرض قماش الليزر', async () => {
    await act(async () => {
      root.render(<Harness />);
    });
    await act(async () => {
      (container.querySelector('[data-testid="h-spotlight"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="spotlight-spot"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="spotlight-radius-badge"]')?.textContent).toContain('140px');

    await act(async () => {
      (container.querySelector('[data-testid="h-laser"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="laser-canvas"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="spotlight-badge"]')?.textContent).toContain('مؤشر ليزر');

    // الإطفاء يزيل الطبقات
    await act(async () => {
      (container.querySelector('[data-testid="h-spotlight"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="h-laser"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="spotlight-overlay"]')).toBeNull();
  });

  it('التكبير نحو نقطة عبر DOMRect يفعّل الحالة ×2', async () => {
    await act(async () => {
      root.render(<Harness />);
    });
    expect(container.querySelector('[data-testid="h-zoom-info"]')?.textContent).toBe('×1');
    await act(async () => {
      (container.querySelector('[data-testid="h-zoomat"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="h-zoom-info"]')?.textContent).toBe('×2');
  });
});

describe('التكامل مع العرض المباشر — Presentation', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('عقد التحكم: Z تكبير مركزي، S تسليط، L ليزر، Esc يغلق بالطبقات', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    const stage = () => container.querySelector('[data-testid="zoom-stage"]');

    // Z: تكبير مركزي
    await act(async () => pressKey('z'));
    expect(stage()?.getAttribute('data-zoomed')).toBe('true');
    expect((stage() as HTMLElement).style.transform).toContain('scale(2)');
    await act(async () => pressKey('z'));
    expect((stage() as HTMLElement).style.transform).toBe('scale(1)');

    // S: تسليط ضوء فوق العرض
    await act(async () => pressKey('s'));
    expect(container.querySelector('[data-testid="spotlight-spot"]')).toBeTruthy();
    // L: ليزر فوقه
    await act(async () => pressKey('l'));
    expect(container.querySelector('[data-testid="laser-canvas"]')).toBeTruthy();
    // Esc: الليزر أولاً ثم التسليط
    await act(async () => pressKey('Escape'));
    expect(container.querySelector('[data-testid="laser-canvas"]')).toBeNull();
    expect(container.querySelector('[data-testid="spotlight-spot"]')).toBeTruthy();
    await act(async () => pressKey('Escape'));
    expect(container.querySelector('[data-testid="spotlight-overlay"]')).toBeNull();

    // التكبير يبقى خارج طبقات Esc الثلاث الأولى
    await act(async () => pressKey('z'));
    await act(async () => pressKey('Escape'));
    expect((stage() as HTMLElement).style.transform).toBe('scale(1)');
  });

  it('Alt+Click يكبّر نحو النقرة (نموذج RevealZoom) ونقر ثانٍ يخرج', async () => {
    // jsdom يرجع مستطيلات صفرية — نمنح المسرح مقاساً حقيقياً
    const origRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return { left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    try {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    const rootEl = container.firstElementChild as HTMLElement;
    const stage = () => container.querySelector('[data-testid="zoom-stage"]') as HTMLElement;

    pointerDown(rootEl, 400, 300, true);
    await act(async () => undefined);
    expect(stage().getAttribute('data-zoomed')).toBe('true');
    expect(stage().style.transform).toBe('scale(2) translate(-400px, -300px)');

    // نقر عادي بلا Alt لا يغيّر شيئاً
    pointerDown(rootEl, 100, 100, false);
    await act(async () => undefined);
    expect(stage().style.transform).toContain('scale(2)');

    // نقر ثانٍ مع Alt = خروج
    pointerDown(rootEl, 200, 200, true);
    await act(async () => undefined);
    expect(stage().style.transform).toBe('scale(1)');

    // النقر على الأزرار مع Alt لا يُكبّر (حماية واجهة)
    const btn = container.querySelector('button')!;
    pointerDown(btn, 10, 10, true);
    await act(async () => undefined);
    expect(stage().style.transform).toBe('scale(1)');
    } finally {
      Element.prototype.getBoundingClientRect = origRect;
    }
  });

  it('زر «سبورة» وزر التكبير/التسليط/الليزر موجودة في شريط التحكم', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    for (const label of ['سبورة مستقلة (B)', 'تكبير مركزي (Z) — أو Alt+Click على أي جزء', 'تسليط الضوء (S)', 'مؤشر ليزر (L)']) {
      expect(container.querySelector(`[aria-label="${label}"]`), label).toBeTruthy();
    }
  });

  it('الاختصارات الجديدة ظاهرة في قائمة المساعدة', () => {
    const labels = SHORTCUTS.map((s) => s.label);
    expect(labels).toContain('تسليط الضوء على موضع الشرح');
    expect(labels).toContain('مؤشر ليزر');
    expect(SHORTCUTS.some((s) => s.keys.includes('Alt + Click'))).toBe(true);
  });
});

describe('مختبر التكبير والتركيز — ?lab=spotlight', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('يُركّب: ترويسة + جدول كثيف + أدوات تجربة + ميزات', async () => {
    await act(async () => {
      root.render(<SpotlightLab />);
    });
    const html = container.innerHTML;
    expect(html).toContain('حزمة التكبير والتركيز');
    expect(html).toContain('RevealZoom');
    expect(container.querySelector('[data-testid="lab-table"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="lab-zoom"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="lab-spotlight"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="lab-laser"]')).toBeTruthy();
    expect(html).toContain('ما في الحزمة');
    expect(container.querySelector('[data-testid="lab-zoom-badge"]')?.textContent).toContain('×1.0');

    // التكبير المركزي من أداة المختبر
    await act(async () => {
      (container.querySelector('[data-testid="lab-zoom"]') as HTMLButtonElement).click();
    });
    const stage = container.querySelector('[data-testid="lab-zoom-stage"]') as HTMLElement;
    expect(stage.style.transform).toContain('scale(2)');
    expect(container.querySelector('[data-testid="lab-zoom-badge"]')?.textContent).toContain('×2.0');

    // التسليط من أداة المختبر
    await act(async () => {
      (container.querySelector('[data-testid="lab-spotlight"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="spotlight-spot"]')).toBeTruthy();
  });
});
