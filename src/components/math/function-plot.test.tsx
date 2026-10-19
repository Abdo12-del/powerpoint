// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Coordinates, LaTeX, Mafs } from 'mafs';
import { FunctionPlot } from './FunctionPlot';
import { MathBlock, MathInline } from './MathFormula';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

async function mount(element: React.ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(element);
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  return {
    host,
    unmount: async () => {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}

describe('Mafs integration on React 19', () => {
  it('renders a lazy function plot with a draggable point and a keyboard-operable range control', async () => {
    class TestResizeObserver {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 640, height: 320 },
              contentBoxSize: [{ inlineSize: 640, blockSize: 320 }],
              borderBoxSize: [{ inlineSize: 640, blockSize: 320 }],
              devicePixelContentBoxSize: [{ inlineSize: 640, blockSize: 320 }],
            } as unknown as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    await import('./MafsFunctionPlot');

    const view = await mount(
      <FunctionPlot
        fn={Math.sin}
        label="f(x) = sin(x)"
        xDomain={[-4, 4]}
        yDomain={[-2, 2]}
        height={280}
      />,
    );

    try {
      expect(view.host.querySelector('.MafsView svg')).not.toBeNull();
      expect(view.host.querySelector('.mafs-movable-point')).not.toBeNull();
      const slider = view.host.querySelector<HTMLInputElement>('input[type="range"]');
      expect(slider).not.toBeNull();
      expect(slider?.getAttribute('aria-describedby')).toBeTruthy();
      expect(view.host.querySelector('output[aria-live="polite"]')?.textContent).toContain('x = 1');

      await act(async () => {
        if (!slider) throw new Error('Function plot range control was not rendered');
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setValue?.call(slider, '2');
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      });
      expect(view.host.querySelector('output')?.textContent).toContain('x = 2');
    } finally {
      await view.unmount();
    }
  });

  it('lazy-loads the KaTeX renderer and preserves inline punctuation around mhchem', async () => {
    await import('./MathRenderer');
    const view = await mount(
      <div dir="rtl">
        <p>
          الماء <MathInline tex={String.raw`\ce{H2O}`} ariaLabel="صيغة الماء الكيميائية" />، ثم تتمة عربية.
        </p>
        <MathBlock tex={String.raw`E = mc^2`} ariaLabel="الطاقة تساوي الكتلة في مربع سرعة الضوء" />
      </div>,
    );

    try {
      const formulas = view.host.querySelectorAll('[role="math"]');
      expect(formulas).toHaveLength(2);
      expect(formulas[0]?.getAttribute('dir')).toBe('ltr');
      expect(formulas[0]?.getAttribute('aria-label')).toBe('صيغة الماء الكيميائية');
      expect(formulas[0]?.querySelector('.katex')).not.toBeNull();
      expect(formulas[0]?.querySelector('math')).not.toBeNull();
      expect(formulas[0]?.innerHTML).not.toContain('katex-error');
      expect(view.host.querySelector('p')?.innerHTML.indexOf('math-katex-inline')).toBeLessThan(
        view.host.querySelector('p')?.innerHTML.indexOf('، ثم تتمة عربية.') ?? -1,
      );
      expect(formulas[1]?.className).toContain('math-katex-block');
    } finally {
      await view.unmount();
    }
  });

  it('can render Mafs LaTeX labels with the KaTeX 0.19 override', async () => {
    const view = await mount(
      <Mafs width={640} height={280} viewBox={{ x: [-2, 2], y: [-2, 2] }} pan={false} zoom={false}>
        <Coordinates.Cartesian />
        <LaTeX at={[0, 0]} tex="x^2" katexOptions={{ trust: false, throwOnError: true }} />
      </Mafs>,
    );

    try {
      expect(view.host.querySelector('.MafsView svg')).not.toBeNull();
      expect(view.host.querySelector('.MafsView .katex')).not.toBeNull();
    } finally {
      await view.unmount();
    }
  });
});
