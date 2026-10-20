#!/usr/bin/env node
/**
 * سكربت التقاط صفحة الهبوط وطبقاتها باستخدام Playwright
 * - يثبّت أبعاد الصفحة عند 1920×1080 DPR2 لضمان سلاسة الحركة
 * - يلتقط الصفحة كاملةً وطبقاتها (خلفية، بطل، بطاقات، صور، شعارات) بشفافية
 * - يصدّر public/cinematic/manifest.json + PNGs للاستيراد في مشهد WebGL2
 *
 * الاستعمال:
 *   npm i -D playwright
 *   npx playwright install chromium
 *   node scripts/capture-flyover.mjs --url http://localhost:5173 --out public/cinematic
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : fallback;
};

const URL = getArg('url', process.env.CAPTURE_URL || 'http://localhost:5173');
const OUT = resolve(getArg('out', 'public/cinematic'));
const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 2 };

console.log(`\n🎬 Flyover Capture — Playwright → WebGL2`);
console.log(`   URL: ${URL}`);
console.log(`   Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @${VIEWPORT.deviceScaleFactor}x (مثبت لضمان سلاسة الحركة)`);
console.log(`   Out: ${OUT}\n`);

let chromium;
try {
  const pw = await import('playwright');
  chromium = pw.chromium;
} catch {
  console.error('❌ Playwright غير مثبت. ثبّته أولاً:');
  console.error('   npm i -D playwright && npx playwright install chromium');
  console.error('\n💡 بديل: افتح المتصفح مباشرةً — المشهد يعمل وضع تجريبي بدون التقاط: /?lab=flyover');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
  deviceScaleFactor: VIEWPORT.deviceScaleFactor,
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();

console.log(`→ فتح ${URL} ...`);
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1200);

// انتظار الخطوط
await page.evaluate(() => document.fonts.ready).catch(() => {});

await mkdir(join(OUT, 'layers'), { recursive: true });

// تثبيت الأبعاد ومنع التمرير لالتقاط نظيف
await page.evaluate(() => {
  document.documentElement.style.scrollbarWidth = 'none';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
});

// لقطة كاملة
console.log('→ التقاط الصفحة الكاملة ...');
await page.screenshot({ path: join(OUT, 'fullpage.png'), fullPage: true, type: 'png' });

// محددات الطبقات — تلتقط كل طبقة على حدة بشفافية
const selectors = {
  background: '[data-capture="background"]',
  hero: '[data-capture="hero"], h1, [data-capture="title"]',
  card: '[data-capture="card"], .rounded-2xl, .rounded-3xl',
  image: '[data-capture="image"], img',
  logo: '[data-capture="logo"]',
};

const DEPTH_PRESETS = { background: 0.05, hero: 0.55, card: 0.72, image: 0.78, logo: 0.92 };

const manifest = {
  viewport: VIEWPORT,
  url: URL,
  capturedAt: new Date().toISOString(),
  fullPage: 'fullpage.png',
  layers: [],
};

for (const [kind, sel] of Object.entries(selectors)) {
  const locators = page.locator(sel);
  const count = await locators.count();
  console.log(`→ طبقة "${kind}": وجد ${count} عنصر (يلتقط حتى 12)`);
  for (let i = 0; i < Math.min(count, 12); i++) {
    const loc = locators.nth(i);
    const box = await loc.boundingBox().catch(() => null);
    if (!box || box.width < 16 || box.height < 16) continue;
    try {
      const buf = await loc.screenshot({ type: 'png', omitBackground: true });
      const filename = `layers/${kind}-${i}.png`;
      await writeFile(join(OUT, filename), buf);
      manifest.layers.push({
        id: `${kind}-${i}`,
        kind,
        src: filename,
        bounds: box,
        depth: DEPTH_PRESETS[kind] ?? 0.5,
        elevatable: kind === 'card' || kind === 'image' || kind === 'logo',
      });
      console.log(`  ✓ ${filename} (${Math.round(box.width)}×${Math.round(box.height)})`);
    } catch (e) {
      console.warn(`  ✗ فشل ${kind}-${i}: ${e.message?.slice(0, 80)}`);
    }
  }
}

await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`\n✅ تم التقاط ${manifest.layers.length} طبقة + الصفحة الكاملة`);
console.log(`   manifest: ${join(OUT, 'manifest.json')}`);
console.log(`   افتح المشهد: npm run dev → http://localhost:5173/?lab=flyover\n`);

await browser.close();
