/**
 * توليد صور PNG شفافة لمعرض المعدات العلمية من مصادر SVG الأصلية.
 *
 * المصادر في src/equipment/assets/svg/ (رسومات أصلية لهذا المستودع)،
 * والنواتج في src/equipment/assets/png/ بدقة 512×512 وخلفية شفافة.
 *
 * التشغيل (أداة توليد مؤقتة — ليست اعتماداً دائماً للمشروع):
 *   npm install --no-save --no-package-lock @resvg/resvg-js
 *   node scripts/generate-equipment-assets.mjs
 *
 * ملفات PNG مولّدة ملتزمة في المستودع، فلا يحتاج البناء أو الاختبار إلى resvg.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = fileURLToPath(new URL('..', import.meta.url));
const svgDir = join(root, 'src/equipment/assets/svg');
const pngDir = join(root, 'src/equipment/assets/png');
mkdirSync(pngDir, { recursive: true });

const files = readdirSync(svgDir).filter((f) => f.endsWith('.svg'));
if (files.length === 0) throw new Error('لا توجد مصادر SVG في ' + svgDir);

for (const file of files) {
  const svg = readFileSync(join(svgDir, file), 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 512 },
    background: 'rgba(0, 0, 0, 0)',
  });
  const png = resvg.render().asPng();
  const out = join(pngDir, basename(file, '.svg') + '.png');
  writeFileSync(out, png);
  console.log(`✓ ${basename(out)} — ${(png.length / 1024).toFixed(1)} KB`);
}
console.log(`تم توليد ${files.length} صورة PNG شفافة (512×512).`);
