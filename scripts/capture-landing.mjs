#!/usr/bin/env node
/**
 * سكربت التقاط صفحة الهبوط وطبقاتها عبر Playwright
 * Usage:
 *   npx playwright install chromium   # مرة واحدة
 *   node scripts/capture-landing.mjs --url https://example.com --out captures/landing
 *   node scripts/capture-landing.mjs --url http://localhost:5173 --out public/captures --fullPage
 *
 * الناتج:
 *   out/
 *     manifest.json   — أبعاد + قائمة الطبقات + مسارات الملفات
 *     full.png        — لقطة الصفحة الكاملة
 *     hero-0.png, card-0.png, logo-0.png ... — طبقات منفصلة
 *
 * ثم يُحمَّل manifest.json في الواجهة كـ CaptureResult.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// ─── قراءة الوسائط ────────────────────────────────────────────
const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  if (args.includes(`--${name}`)) return true;
  return fallback;
}

const url = arg('url', null);
const outDir = resolve(arg('out', 'captures/landing'));
const fullPage = args.includes('--fullPage');
const width = Number(arg('width', 1440));
const height = Number(arg('height', 900));
const dpr = Number(arg('dpr', 1));
const extraDelay = Number(arg('delay', 800));
const selectorArg = arg('selector', null); // محدد مخصص واحد

if (!url) {
  console.error(`
  ┌─ التقاط صفحة الهبوط — Playwright ─────────────────────┐
  │  الاستعمال:                                          │
  │    node scripts/capture-landing.mjs --url <URL>      │
  │        [--out captures/landing] [--width 1440]        │
  │        [--height 900] [--dpr 1] [--fullPage]          │
  │        [--delay 800] [--selector "[data-card]"]       │
  │                                                      │
  │  المتطلبات: npx playwright install chromium           │
  └──────────────────────────────────────────────────────┘
  `);
  process.exit(1);
}

// ─── محددات الطبقات الافتراضية ────────────────────────────────
const defaultSelectors = selectorArg
  ? [{ selector: selectorArg, kind: 'card', depth: 0.7, liftable: true }]
  : [
      { selector: '[data-flyover="hero"]', kind: 'hero', depth: 0.2, liftable: false },
      { selector: '[data-flyover="card"]', kind: 'card', depth: 0.75, liftable: true },
      { selector: '[data-flyover="image"]', kind: 'image', depth: 0.65, liftable: true },
      { selector: '[data-flyover="logo"]', kind: 'logo', depth: 0.85, liftable: true },
      { selector: '.card, [data-card]', kind: 'card', depth: 0.7, liftable: true },
      { selector: 'header', kind: 'hero', depth: 0.15, liftable: false },
    ];

// ─── التنفيذ ─────────────────────────────────────────────────
async function main() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('  ✖ Playwright غير مثبت. ثبّته:\n    npm i -D playwright\n    npx playwright install chromium\n');
    process.exit(1);
  }

  console.log(`  ● فتح ${url} بأبعاد ${width}×${height} @${dpr}x`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    // تثبيت الأبعاد — يمنع التذبذب
    isMobile: false,
    hasTouch: false,
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  if (extraDelay) await page.waitForTimeout(extraDelay);

  await mkdir(outDir, { recursive: true });

  const manifest = {
    dimensions: { width, height, devicePixelRatio: dpr, letterbox: true },
    url,
    capturedAt: new Date().toISOString(),
    layers: [],
    fullPageFile: undefined,
  };

  // لقطة كاملة
  if (fullPage) {
    const fullPath = join(outDir, 'full.png');
    await page.screenshot({ path: fullPath, fullPage: true, type: 'png' });
    manifest.fullPageFile = 'full.png';
    console.log(`  ✓ لقطة كاملة: ${fullPath}`);
  }

  // طبقات
  let counter = 0;
  for (const sel of defaultSelectors) {
    const handles = await page.$$(sel.selector);
    for (let i = 0; i < handles.length; i++) {
      const h = handles[i];
      const box = await h.boundingBox();
      if (!box || box.width < 4 || box.height < 4) continue;

      const fileName = `${sel.kind}-${counter}.png`;
      const filePath = join(outDir, fileName);

      // احفظ العنصر وحده (clip)
      await h.screenshot({ path: filePath, type: 'png' });

      manifest.layers.push({
        id: `${sel.kind}-${counter}`,
        kind: sel.kind,
        file: fileName,
        bounds: { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) },
        depth: sel.depth ?? 0.5,
        liftable: sel.liftable ?? false,
        selector: sel.selector,
      });
      counter++;
      console.log(`  ✓ طبقة ${counter}: ${sel.kind} — ${fileName} (${Math.round(box.width)}×${Math.round(box.height)})`);
    }
  }

  if (manifest.layers.length === 0) {
    console.warn('  ⚠ لم يُعثر على طبقات بهذه المحددات. جرّب --selector أو ضع سمات data-flyover="card" في الصفحة.');
  }

  const manifestPath = join(outDir, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`  ● manifest: ${manifestPath} — ${manifest.layers.length} طبقة`);
  console.log(`  ● انتهى التقاط ${url}`);

  await browser.close();
}

main().catch((e) => {
  console.error('  ✖ خطأ:', e.message);
  process.exit(1);
});
