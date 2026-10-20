/**
 * أدوات التقاط صفحة الهبوط وطبقاتها باستخدام Playwright
 * - يثبّت أبعاد الصفحة لضمان سلاسة الحركة
 * - يلتقط الصفحة كاملةً + كل طبقة على حدة (خلفية، بطاقات، صور، شعارات)
 * - يصدّر manifest.json + صور PNG شفافة
 *
 * الاستعمال:
 *   npx playwright install chromium
 *   node scripts/capture-flyover.mjs --url http://localhost:5173 --out public/cinematic
 *
 * أو برمجياً:
 *   import { captureLayers } from '@/cinematic/capture/capture'
 */

import type { CaptureManifest, CapturedLayer, CaptureViewport } from '../flyover/legacy-types';
import { DEFAULT_VIEWPORT } from '../flyover/legacy-types';

export interface CaptureOptions {
  url: string;
  viewport?: CaptureViewport;
  /** محددات الطبقات — تُستعمل كخلفية إن لم توجد طبقات مخصصة في الصفحة */
  layerSelectors?: Record<string, string>;
  /** مسار الإخراج */
  outDir?: string;
  /** هل التقاط الطبقات الفردية */
  layered?: boolean;
  /** مهلة الانتظار بعد التحميل (ms) — لانتظار الخطوط والصور */
  waitAfterLoad?: number;
}

const DEFAULT_SELECTORS: Record<string, string> = {
  background: '[data-capture=\"background\"], .bg-slate-950',
  hero: '[data-capture=\"hero\"], [data-capture=\"title\"], h1',
  card: '[data-capture=\"card\"], .rounded-2xl, .rounded-3xl, [class*=\"card\"]',
  image: '[data-capture=\"image\"], img',
  logo: '[data-capture=\"logo\"], [class*=\"logo\"]',
};

/**
 * دالة التقاط تعمل في بيئة Node مع Playwright (يُستورد حياً لتجنب كسر البناء في المتصفح)
 */
export async function captureLayers(options: CaptureOptions): Promise<CaptureManifest> {
  const { url, viewport = DEFAULT_VIEWPORT, layerSelectors = DEFAULT_SELECTORS, waitAfterLoad = 1200 } = options;

  // استيراد حيّ — لا يدخل حزمة المتصفح
  let playwright: unknown;
  try {
    // @ts-ignore - optional dep, installed as devDependency for capture only
    playwright = await import('playwright');
  } catch {
    throw new Error(
      'Playwright غير مثبت. ثبّته أولاً: npm i -D playwright && npx playwright install chromium\n' +
        'أو استعمل الوضع التجريبي بدون التقاط: <FlyoverCanvas demo />',
    );
  }

  const pw = playwright as { chromium: { launch: (o: unknown) => Promise<Browser> } };
  type Browser = {
    newPage: (o: unknown) => Promise<Page>;
    close: () => Promise<void>;
  };
  type Page = {
    goto: (url: string, o: unknown) => Promise<void>;
    waitForTimeout: (ms: number) => Promise<void>;
    evaluate: (fn: () => unknown) => Promise<unknown>;
    screenshot: (o: unknown) => Promise<Buffer>;
    locator: (sel: string) => { count: () => Promise<number>; nth: (i: number) => unknown; elementHandle: () => unknown };
    $: (sel: string) => Promise<unknown>;
    $$: (sel: string) => Promise<unknown[]>;
    setViewportSize?: (s: { width: number; height: number }) => Promise<void>;
  };

  const browser = await pw.chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    // تثبيت الأبعاد يمنع قفزات التخطيط أثناء الحركة
    isMobile: false,
    hasTouch: false,
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // انتظار تحميل الخطوط (Cairo + المتغيرة) والصور
    await page.evaluate(() => document.fonts.ready as Promise<unknown>).catch(() => {});
    await page.waitForTimeout(waitAfterLoad);

    // تثبيت العرض: منع التمرير الأفقي وإخفاء شريط التمرير لالتقاط نظيف
    await page.evaluate(() => {
      document.documentElement.style.scrollbarWidth = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      // وسم الطبقات تلقائياً إن لم تكن موسومة
      document.querySelectorAll('section, [class*=\"card\"], img').forEach((el, i) => {
        if (!el.getAttribute('data-capture-layer')) el.setAttribute('data-capture-layer', `auto-${i}`);
      });
    });

    const layers: CapturedLayer[] = [];
    const manifest: CaptureManifest = {
      viewport,
      url,
      capturedAt: new Date().toISOString(),
      layers,
    };

    if (options.layered !== false) {
      // التقاط كل نوع طبقة على حدة
      for (const [kind, selector] of Object.entries(layerSelectors)) {
        const handles = (await page.$$(selector)) as Array<{
          boundingBox: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
          screenshot: (o: unknown) => Promise<Buffer>;
          evaluate: (fn: (el: Element) => string) => Promise<string>;
        }>;
        for (let i = 0; i < Math.min(handles.length, 12); i++) {
          const h = handles[i];
          const box = await h.boundingBox().catch(() => null);
          if (!box || box.width < 16 || box.height < 16) continue;
          const depth = kind === 'background' ? 0.05 : kind === 'hero' ? 0.6 : kind === 'logo' ? 0.95 : 0.7 + Math.random() * 0.2;
          layers.push({
            id: `${kind}-${i}`,
            kind: kind as CapturedLayer['kind'],
            src: `layers/${kind}-${i}.png`,
            bounds: box,
            depth,
            elevatable: kind === 'card' || kind === 'image' || kind === 'logo',
            alt: await h.evaluate((el) => el.getAttribute('aria-label') || el.getAttribute('alt') || '').catch(() => ''),
          });
        }
      }
    }

    // حفظ الملفات إن طُلب outDir
    if (options.outDir) {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      await fs.mkdir(path.join(options.outDir, 'layers'), { recursive: true });
      // full page
      const full = await page.screenshot({ fullPage: true, type: 'png' });
      await fs.writeFile(path.join(options.outDir, 'fullpage.png'), full);
      manifest.fullPage = 'fullpage.png';
      // layers
      for (const layer of layers) {
        const sel = layerSelectors[layer.kind] || '[data-capture-layer]';
        const handles = (await page.$$(sel)) as Array<{ screenshot: (o: unknown) => Promise<Buffer> }>;
        const idx = Number(layer.id.split('-').pop());
        if (handles[idx]) {
          try {
            const buf = await handles[idx].screenshot({ type: 'png', omitBackground: true });
            await fs.writeFile(path.join(options.outDir, layer.src), buf);
          } catch {
            // تجاهل طبقات فشل التقاطها
          }
        }
      }
      await fs.writeFile(path.join(options.outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    }

    return manifest;
  } finally {
    await browser.close();
  }
}

/**
 * نسخة وهمية تعمل في المتصفح بدون Playwright — تولّد طبقات تجريبية من DOM الحالي
 * مفيدة للمعاينة الحية دون الحاجة لعملية التقاط خارجية.
 */
export function captureLayersFromDOM(viewport = DEFAULT_VIEWPORT): CaptureManifest {
  const layers: CapturedLayer[] = [];
  if (typeof document === 'undefined') {
    return { viewport, url: '', capturedAt: new Date().toISOString(), layers };
  }

  const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-capture], .rounded-2xl, img, [class*=\"logo\"]')).slice(0, 12);
  candidates.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 16 || rect.height < 16) return;
    const kind: CapturedLayer['kind'] = el.tagName === 'IMG' ? 'image' : el.matches('[data-capture=\"logo\"]') ? 'logo' : 'card';
    layers.push({
      id: `${kind}-${i}`,
      kind,
      src: `__dom__${i}`,
      bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      depth: 0.5 + (i / Math.max(candidates.length, 1)) * 0.45,
      elevatable: true,
      alt: el.getAttribute('aria-label') || el.getAttribute('alt') || undefined,
    });
  });

  return {
    viewport,
    url: window.location.href,
    capturedAt: new Date().toISOString(),
    layers,
  };
}

export const CAPTURE_VIEWPORT = DEFAULT_VIEWPORT;
