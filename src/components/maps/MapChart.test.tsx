// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { MapChart } from './MapChart';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const readMap = (path: string) => JSON.parse(readFileSync(`public/maps/${path}`, 'utf8')) as unknown;

async function renderMap(element: React.ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(element));
  for (let attempt = 0; attempt < 20 && !host.querySelector('svg[aria-label]'); attempt += 1) {
    await act(async () => void (await new Promise((resolve) => setTimeout(resolve, 50))));
  }
  return {
    host,
    unmount: async () => {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('MapChart integration', () => {
  it('renders the filtered Arab-world choropleth and an animated location marker from local TopoJSON', async () => {
    const world = readMap('world-countries-50m.json');
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => world }) as Response);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn() }));

    const view = await renderMap(
      <MapChart
        variant="arab-world"
        mode="choropleth"
        values={{ '012': 45, '048': 72 }}
        markers={[{ id: 'algiers', coordinates: [3.06, 36.75], label: 'الجزائر' }]}
        ariaLabel="خريطة تجريبية للدول العربية"
      />,
    );

    try {
      const svg = view.host.querySelector('svg[aria-label="خريطة تجريبية للدول العربية"]');
      expect(svg).not.toBeNull();
      expect(view.host.querySelectorAll('path[aria-label]')).toHaveLength(22);
      expect(view.host.querySelector('path[aria-label="الجزائر · 45"] title')?.textContent).toBe('الجزائر · 45');
      expect(view.host.querySelectorAll('circle')).toHaveLength(2);
      expect(view.host.textContent).toContain('45');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      await view.unmount();
    }
  });

  it('renders normalized Algeria boundaries and supports keyboard-activatable wilaya regions', async () => {
    const algeria = readMap('algeria-wilayas-69.geojson');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => algeria }) as Response));
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn() }));
    const onRegionClick = vi.fn();

    const view = await renderMap(
      <MapChart variant="algeria" values={{ '16': 88 }} mode="choropleth" onRegionClick={onRegionClick} />,
    );

    try {
      const regions = view.host.querySelectorAll('path[role="button"]');
      expect(regions).toHaveLength(69);
      const algiers = Array.from(regions).find((region) => region.getAttribute('aria-label')?.startsWith('الجزائر'));
      expect(algiers).toBeDefined();
      await act(async () => {
        algiers?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: '16', label: 'الجزائر', value: 88 }));
      expect(view.host.querySelector('svg[aria-label="خريطة ولايات الجزائر"]')).not.toBeNull();
    } finally {
      await view.unmount();
    }
  });
});
