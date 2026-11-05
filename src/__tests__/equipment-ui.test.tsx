// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { presentation } from '@/data/presentation';

// jsdom بلا سياق canvas — السبورة تسلك مسار الصمت (نمط chalkboard-ui)
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

// جسيمات خلفية العنوان تحتاج OffscreenCanvas — نعزلها
vi.mock('@tsparticles/react', () => ({
  default: () => null,
  ParticlesProvider: () => null,
}));

// React 19: فعّل بيئة act صراحةً
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import { EquipmentLayer, EquipmentPanel, useEquipment, STORAGE_KEY, DND_MIME } from '@/equipment';
import { Presentation } from '@/components/Presentation';

/** مستطيل شريحة ثابت 1000×600 لكل العناصر في jsdom */
const RECT = { left: 0, top: 0, right: 1000, bottom: 600, width: 1000, height: 600, x: 0, y: 0, toJSON: () => ({}) };

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT as DOMRect);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

const q = <T extends Element = HTMLElement>(selector: string): T | null => container.querySelector<T>(selector);
const qa = <T extends Element = HTMLElement>(selector: string): T[] => Array.from(container.querySelectorAll<T>(selector));

function click(el: Element): void {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function pressKey(key: string, init: KeyboardEventInit = {}): void {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
  });
}

function setInputValue(input: HTMLInputElement, value: string): void {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/** حدث مؤشر يحمل pointerId (jsdom بلا PointerEvent) */
function pointerEvent(type: string, clientX: number, clientY: number): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  return event;
}

function dispatchPointer(el: Element, type: string, clientX: number, clientY: number): void {
  act(() => {
    el.dispatchEvent(pointerEvent(type, clientX, clientY));
  });
}

/** حدث إفلات من المعرض مع dataTransfer اصطناعي */
function dropOn(el: Element, assetId: string, clientX: number, clientY: number): void {
  act(() => {
    const event = new MouseEvent('drop', { bubbles: true, cancelable: true, clientX, clientY });
    Object.defineProperty(event, 'dataTransfer', {
      value: { getData: (type: string) => (type === DND_MIME ? assetId : ''), types: [DND_MIME] },
    });
    el.dispatchEvent(event);
  });
}

async function settle(ms = 320): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

/** خطاف مثبت بلوحة وطبقة — نمط المختبر/العرض */
function Harness({ slideId = 'ch1-demo' }: { slideId?: string }) {
  const ctrl = useEquipment();
  return (
    <div>
      <button
        type="button"
        data-testid="h-init"
        onClick={() => {
          ctrl.setActiveSlide(slideId);
          ctrl.open();
        }}
      >
        init
      </button>
      <button type="button" data-testid="h-close" onClick={ctrl.close}>
        close
      </button>
      <div data-testid="stage" style={{ position: 'relative', width: 1000, height: 600 }}>
        <EquipmentLayer ctrl={ctrl} slideId={slideId} editing={ctrl.panelOpen} />
      </div>
      {ctrl.panelOpen && <EquipmentPanel ctrl={ctrl} />}
    </div>
  );
}

function mountHarness(): void {
  act(() => root.render(<Harness />));
  click(q('[data-testid="h-init"]')!);
}

describe('لوحة المعدات العلمية (EquipmentPanel)', () => {
  it('تعرض الأصول العشرة بأسماء عربية وصور مصغرة داخل العارض', () => {
    mountHarness();
    expect(q('[data-testid="equipment-panel"]')).not.toBeNull();
    expect(qa('[data-testid^="equipment-tile-"]')).toHaveLength(10);
    expect(q('[data-testid="equipment-tile-microscope"]')?.textContent).toContain('مجهر');
    expect(q('[data-testid="equipment-tile-beaker"] img')).not.toBeNull();
  });

  it('البحث يرشح النتائج بالعربية واللاتينية', () => {
    mountHarness();
    const search = q<HTMLInputElement>('[data-testid="equipment-search"]')!;
    setInputValue(search, 'مجهر');
    expect(qa('[data-testid^="equipment-tile-"]')).toHaveLength(1);
    expect(q('[data-testid="equipment-tile-microscope"]')).not.toBeNull();
    setInputValue(search, 'goggles');
    expect(q('[data-testid="equipment-tile-safety-goggles"]')).not.toBeNull();
    setInputValue(search, 'لا-يوجد-xyz');
    expect(qa('[data-testid^="equipment-tile-"]')).toHaveLength(0);
    expect(container.textContent).toContain('لا نتائج مطابقة');
  });

  it('التصفح بالفئات يرشح النتائج', () => {
    mountHarness();
    click(q('[data-testid="equipment-cat-safety"]')!);
    expect(qa('[data-testid^="equipment-tile-"]')).toHaveLength(1);
    expect(q('[data-testid="equipment-tile-safety-goggles"]')).not.toBeNull();
    click(q('[data-testid="equipment-cat-glassware"]')!);
    expect(qa('[data-testid^="equipment-tile-"]')).toHaveLength(5);
  });

  it('نقر الصورة يضيف العنصر إلى الشريحة (بديل اللمس ولوحة المفاتيح) والتراجع يعيده', () => {
    mountHarness();
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(0);
    click(q('[data-testid="equipment-tile-beaker"]')!);
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(1);
    expect(container.textContent).toContain('عناصر الشريحة: 1');

    const undo = q<HTMLButtonElement>('[data-testid="equipment-undo"]')!;
    expect(undo.disabled).toBe(false);
    click(undo);
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(0);
    click(q('[data-testid="equipment-redo"]')!);
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(1);
  });
});

describe('طبقة الشريحة (EquipmentLayer)', () => {
  it('وضع التقديم: صور بلا مقابض تحرير وبلا اعتراض للنقر', () => {
    mountHarness();
    click(q('[data-testid="equipment-tile-microscope"]')!);
    click(q('[data-testid="h-close"]')!); // إغلاق اللوحة = وضع تقديم
    const layer = q('[data-testid="equipment-layer"]')!;
    expect(layer.getAttribute('data-editing')).toBeNull();
    expect(layer.className).toContain('pointer-events-none');
    expect(qa('[data-testid="equipment-item"] img')).toHaveLength(1);
    expect(q('[data-testid="equipment-delete"]')).toBeNull();
    expect(q('[data-testid="equipment-resize"]')).toBeNull();
  });

  it('وضع التحرير: العنصر المحدد يُحذف بزر الحذف', () => {
    mountHarness();
    click(q('[data-testid="equipment-tile-beaker"]')!);
    expect(q('[data-testid="equipment-delete"]')).not.toBeNull();
    click(q('[data-testid="equipment-delete"]')!);
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(0);
  });

  it('الإفلات يدرج PNG في الموضع النسبي لنقطة الإفلات على الشريحة', () => {
    mountHarness();
    const layer = q('[data-testid="equipment-layer"]')!;
    // إفلات عند (250,150) من شريحة 1000×600 → مركز نسبي (0.25, 0.25)
    dropOn(layer, 'test-tube', 250, 150);
    const item = q('[data-testid="equipment-item"]')!;
    expect(item).not.toBeNull();
    // عرض افتراضي 16% → اليسار 25% - 8% = 17%
    expect((item as HTMLElement).style.left).toBe('17%');
    expect((item as HTMLElement).style.width).toBe('16%');
    expect((item as HTMLElement).style.aspectRatio).toBe('512 / 512');
  });

  it('السحب بالمؤشر/اللمس يحرك العنصر بإحداثيات نسبية — خطوة تراجع واحدة', () => {
    mountHarness();
    click(q('[data-testid="equipment-tile-beaker"]')!);
    const item = q('[data-testid="equipment-item"]')!;
    expect((item as HTMLElement).style.left).toBe('42%');

    dispatchPointer(item, 'pointerdown', 500, 300);
    dispatchPointer(item, 'pointermove', 550, 300);
    dispatchPointer(item, 'pointermove', 600, 300);
    dispatchPointer(item, 'pointerup', 600, 300);
    expect((item as HTMLElement).style.left).toBe('52%'); // +100px ÷ 1000 = +0.1

    click(q('[data-testid="equipment-undo"]')!);
    expect((q('[data-testid="equipment-item"]') as HTMLElement).style.left).toBe('42%');
  });

  it('مقبض الزاوية يغيّر الحجم مع حفظ نسبة أبعاد الصورة', () => {
    mountHarness();
    click(q('[data-testid="equipment-tile-beaker"]')!);
    const handle = q('[data-testid="equipment-resize"]')!;
    dispatchPointer(handle, 'pointerdown', 580, 500);
    dispatchPointer(handle, 'pointermove', 800, 500);
    dispatchPointer(handle, 'pointerup', 800, 500);
    const item = q('[data-testid="equipment-item"]') as HTMLElement;
    expect(item.style.width).toBe('38%'); // 800px - يسار 420px = 380px ÷ 1000
    expect(item.style.aspectRatio).toBe('512 / 512'); // النسبة لم تتغير
    click(q('[data-testid="equipment-undo"]')!);
    expect((q('[data-testid="equipment-item"]') as HTMLElement).style.width).toBe('16%');
  });
});

describe('التكامل مع العارض الحالي (Presentation)', () => {
  /** من شاشة العنوان إلى أول شريحة: عنوان ← 4 مقدمة ← خريطة ← شريحة */
  async function gotoFirstSlide(): Promise<void> {
    for (let i = 0; i < 6; i += 1) {
      pressKey('ArrowRight');
      await settle();
    }
  }

  it('زر «المعدات العلمية» في شريط التحكم، وG يفتح اللوحة دون مغادرة الشريحة', async () => {
    act(() => root.render(<Presentation data={presentation} />));
    // على شاشة العنوان الزر معطّل
    const button = q<HTMLButtonElement>('button[aria-label^="المعدات العلمية"]')!;
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(true);
    pressKey('g');
    expect(q('[data-testid="equipment-panel"]')).toBeNull();

    await gotoFirstSlide();
    expect(container.textContent).toContain('الشريحة 1');
    expect(q<HTMLButtonElement>('button[aria-label^="المعدات العلمية"]')!.disabled).toBe(false);

    pressKey('g');
    expect(q('[data-testid="equipment-panel"]')).not.toBeNull();
    // ما زال على الشريحة نفسها — لا صفحة مستقلة ولا تنقّل
    expect(container.textContent).toContain('الشريحة 1');
    expect(q('[data-testid="equipment-layer"]')?.getAttribute('data-editing')).not.toBeNull();

    // Esc يغلق اللوحة ويبقى في الشريحة
    pressKey('Escape');
    expect(q('[data-testid="equipment-panel"]')).toBeNull();
    expect(container.textContent).toContain('الشريحة 1');
  }, 20000);

  it('الإدراج والحفظ: العناصر تبقى بعد التنقل بين الشرائح وبعد إعادة فتح العرض', async () => {
    act(() => root.render(<Presentation data={presentation} />));
    await gotoFirstSlide();
    pressKey('g');
    click(q('[data-testid="equipment-tile-microscope"]')!);
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(1);

    // إغلاق اللوحة ثم الانتقال للشريحة التالية والعودة
    pressKey('Escape');
    pressKey('ArrowRight');
    await settle();
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(0); // شريحة أخرى فارغة
    pressKey('ArrowLeft');
    await settle();
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(1); // عاد العنصر
    // في وضع التقديم: بلا مقابض
    expect(q('[data-testid="equipment-delete"]')).toBeNull();

    // حفظ مؤجّل → إعادة تحميل كاملة (جذر جديد) ثم العودة إلى الشريحة
    await settle(500);
    act(() => window.dispatchEvent(new Event('pagehide')));
    act(() => root.unmount());
    root = createRoot(container);
    act(() => root.render(<Presentation data={presentation} />));
    await gotoFirstSlide();
    expect(qa('[data-testid="equipment-item"] img')).toHaveLength(1);
    pressKey('g');
    expect(container.textContent).toContain('عناصر الشريحة: 1');
  }, 30000);

  it('لوحة المفاتيح أثناء التحرير: الأسهم تحرك المحدد، Delete يحذف، Ctrl+Z يتراجع', async () => {
    act(() => root.render(<Presentation data={presentation} />));
    await gotoFirstSlide();
    pressKey('g');
    click(q('[data-testid="equipment-tile-beaker"]')!);
    const item = () => q('[data-testid="equipment-item"]') as HTMLElement;
    const leftBefore = item().style.left;

    // سهم يمين: يحرك العنصر ولا يقلب الشريحة
    pressKey('ArrowRight');
    expect(item().style.left).not.toBe(leftBefore);
    expect(container.textContent).toContain('الشريحة 1');

    pressKey('Delete');
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(0);
    pressKey('z', { ctrlKey: true }); // تراجع عن الحذف → يعود العنصر
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(1);
    pressKey('y', { ctrlKey: true }); // إعادة الحذف → يختفي مجدداً
    expect(qa('[data-testid="equipment-item"]')).toHaveLength(0);
  }, 20000);
});
