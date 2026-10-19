// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import type { COBEOptions } from 'cobe';
import { GlobeCanvas } from './GlobeCanvas';
import type { GlobeCanvasArc, GlobeCanvasMarker } from './GlobeCanvas';

const cobeMocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('cobe', () => ({
  default: (...args: unknown[]) => {
    cobeMocks.create(...args);
    return { update: cobeMocks.update, destroy: cobeMocks.destroy };
  },
}));

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function renderGlobe(element: React.ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(element);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return {
    host,
    unmount: async () => {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}

function mockMediaQuery(matches: boolean) {
  const media = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
  return media;
}

describe('GlobeCanvas — مجسّم Cobe', () => {
  beforeEach(() => {
    cobeMocks.create.mockReset();
    cobeMocks.update.mockReset();
    cobeMocks.destroy.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('يعرض وصفاً دلالياً واتجاهاً قابلاً للوصول قبل تحميل WebGL', () => {
    const html = renderToStaticMarkup(<GlobeCanvas ariaLabel="شبكة مراكز جامعية" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="شبكة مراكز جامعية"');
    expect(html).toContain('data-globe-status="loading"');
  });

  it('يحمّل Cobe عند التركيب، يقرأ ألوان السمة، ويدمر سياق WebGL عند الفك', async () => {
    mockMediaQuery(true);
    const contextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({} as WebGL2RenderingContext));
    const requestSpy = vi.spyOn(window, 'requestAnimationFrame');
    const marker: GlobeCanvasMarker = { id: 'algiers', location: [36.7538, 3.0588], size: 0.06 };
    const arc: GlobeCanvasArc = { id: 'algiers-cairo', from: [36.7538, 3.0588], to: [30.0444, 31.2357] };
    const style = {
      '--presentation-surface': '#0f172a',
      '--presentation-surface-raised': '#334455',
      '--presentation-accent': '#123456',
      '--presentation-secondary': '#abcdef',
    } as CSSProperties;
    const view = await renderGlobe(
      <div className="presentation-shell" style={style}>
        <GlobeCanvas markers={[marker]} arcs={[arc]} ariaLabel="مراكز الجزائر والقاهرة" />
      </div>,
    );

    try {
      expect(cobeMocks.create).toHaveBeenCalledTimes(1);
      const [canvas, options] = cobeMocks.create.mock.calls[0] as [HTMLCanvasElement, COBEOptions];
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(options.markers).toEqual([{ location: marker.location, size: marker.size, color: [18 / 255, 52 / 255, 86 / 255], id: 'algiers' }]);
      expect(options.arcs?.[0]).toMatchObject({ from: arc.from, to: arc.to, id: 'algiers-cairo' });
      expect(options.baseColor).toEqual([51 / 255, 68 / 255, 85 / 255]);
      expect(options.arcColor).toEqual([171 / 255, 205 / 255, 239 / 255]);
      expect(requestSpy).not.toHaveBeenCalled();
      expect(view.host.querySelector('[data-globe-status="ready"]')).not.toBeNull();
    } finally {
      await view.unmount();
    }

    expect(cobeMocks.destroy).toHaveBeenCalledTimes(1);
    expect(contextSpy).toHaveBeenCalled();
  });

  it('يعرض بديلاً ثابتاً عندما لا يتوفر WebGL', async () => {
    mockMediaQuery(false);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const view = await renderGlobe(<GlobeCanvas ariaLabel="كرة أرضية بديلة" rotationSpeed={0} />);
    try {
      expect(view.host.querySelector('[data-globe-status="fallback"]')).not.toBeNull();
      expect(view.host.querySelector('canvas')).not.toBeNull();
      expect(cobeMocks.create).not.toHaveBeenCalled();
    } finally {
      await view.unmount();
    }
  });
});
