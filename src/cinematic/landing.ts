/**
 * مولّد طبقات صفحة الهبوط التجريبية
 * كل طبقة تُرسم على canvas منفصل بدقة عالية ثم تُرفع إلى المشهد ثلاثي الأبعاد.
 * (في الإنتاج تُستبدَل بطبقات Playwright من manifest.json — نفس العقد.)
 */

import type { CaptureLayer, PageDimensions } from './types';
import { DEFAULT_PAGE_DIMENSIONS } from './types';

export interface DemoBrand {
  name: string;
  tagline: string;
  accent: string;
  accent2: string;
  headline: string;
  subline: string;
  cta: string;
  cta2: string;
}

export const DEMO_BRAND: DemoBrand = {
  name: 'نُور',
  tagline: 'نصنع حضورك الرقمي، طبقةً فوق طبقة',
  accent: '#f5b544',
  accent2: '#5eb0ef',
  headline: 'حضورٌ رقمي\nيستحقّ أن يُرى',
  subline: 'منصّة متكاملة تبني هويتك، تروي قصّتك، وتترك أثراً لا يُنسى.',
  cta: 'ابدأ مجاناً',
  cta2: 'شاهد العرض',
};

const FONT = '"Cairo Variable", "Cairo", "Segoe UI", Tahoma, sans-serif';

type Ctx = CanvasRenderingContext2D;

// ─── أدوات الرسم ─────────────────────────────────────────────
function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: Ctx } | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.direction = 'rtl';
  ctx.textBaseline = 'middle';
  return { canvas, ctx };
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function linearGradient(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
}

function glow(ctx: Ctx, x: number, y: number, r: number, color: string, alpha = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

function noiseDots(ctx: Ctx, w: number, h: number, step = 34, color = 'rgba(255,255,255,0.045)') {
  ctx.save();
  ctx.fillStyle = color;
  for (let y = step; y < h; y += step) {
    for (let x = step; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawMark(ctx: Ctx, x: number, y: number, size: number, accent: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  const g = linearGradient(ctx, -size / 2, -size / 2, size / 2, size / 2, [
    [0, accent],
    [1, 'rgba(255,255,255,0.85)'],
  ]);
  ctx.fillStyle = g;
  roundRect(ctx, -size / 2, -size / 2, size, size, size * 0.28);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,12,22,0.9)';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function pill(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, stroke?: string) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function text(ctx: Ctx, str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'right') {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
  ctx.restore();
}

// ─── الطبقات ────────────────────────────────────────────────
function renderBackground(w: number, h: number, brand: DemoBrand): string {
  const c = makeCanvas(w, h);
  if (!c) return '';
  const { ctx } = c;

  const bg = linearGradient(ctx, 0, 0, w * 0.4, h, [
    [0, '#0a1120'],
    [0.45, '#0b1222'],
    [1, '#060a13'],
  ]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  glow(ctx, w * 0.18, h * 0.2, w * 0.4, brand.accent2, 0.22);
  glow(ctx, w * 0.82, h * 0.12, w * 0.35, brand.accent, 0.18);
  glow(ctx, w * 0.55, h * 1.05, w * 0.5, '#4f46e5', 0.16);

  // شبكة خفيفة
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  const step = 72;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  noiseDots(ctx, w, h, 34);
  return c.canvas.toDataURL('image/png');
}

function renderNav(w: number, h: number, brand: DemoBrand): string {
  const c = makeCanvas(w, h);
  if (!c) return '';
  const { ctx } = c;
  ctx.clearRect(0, 0, w, h);

  // شريط زجاجي
  ctx.save();
  const g = linearGradient(ctx, 0, 0, 0, h, [
    [0, 'rgba(18,26,44,0.92)'],
    [1, 'rgba(11,17,30,0.86)'],
  ]);
  roundRect(ctx, 8, 8, w - 16, h - 16, 22);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // الشعار
  const cy = h / 2;
  drawMark(ctx, w - 46, cy, 30, brand.accent);
  text(ctx, brand.name, w - 72, cy + 1, `800 24px ${FONT}`, '#f8fafc');

  // قائمة
  const items = ['المنصّة', 'الحلول', 'الأعمال', 'الأسعار'];
  let x = w - 190;
  for (const item of items) {
    text(ctx, item, x, cy + 1, `600 17px ${FONT}`, 'rgba(226,232,240,0.82)');
    x -= ctx.measureText(item).width + 40;
  }

  // زر
  const btnW = 132;
  const btnH = 42;
  pill(ctx, 36, cy - btnH / 2, btnW, btnH, brand.accent);
  text(ctx, 'جرّب الآن', 36 + btnW / 2, cy + 1, `800 16px ${FONT}`, '#0b1220', 'center');

  return c.canvas.toDataURL('image/png');
}

function renderHero(w: number, h: number, brand: DemoBrand): string {
  const c = makeCanvas(w, h);
  if (!c) return '';
  const { ctx } = c;
  ctx.clearRect(0, 0, w, h);

  const padX = 72;

  // شارة صغيرة
  const badgeW = 268;
  pill(ctx, w - padX - badgeW, 8, badgeW, 38, 'rgba(245,181,68,0.10)', 'rgba(245,181,68,0.35)');
  ctx.fillStyle = brand.accent;
  ctx.beginPath();
  ctx.arc(w - padX - badgeW + 24, 27, 4, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'الإصدار الجديد ٢٠٢٦ متاحٌ الآن', w - padX - 22, 28, `700 15px ${FONT}`, 'rgba(251,191,36,0.95)');

  // العنوان
  const lines = brand.headline.split('\n');
  let y = 100;
  lines.forEach((line, i) => {
    const grad = linearGradient(ctx, w - padX, y - 38, w - padX - 520, y + 38, [
      [0, '#ffffff'],
      [0.7, i === lines.length - 1 ? brand.accent : '#e2e8f0'],
      [1, i === lines.length - 1 ? '#fbbf24' : '#cbd5e1'],
    ]);
    ctx.save();
    ctx.font = `900 70px ${FONT}`;
    ctx.fillStyle = grad;
    ctx.textAlign = 'right';
    ctx.fillText(line, w - padX, y, w * 0.52);
    ctx.restore();
    y += 88;
  });

  // الوصف
  const subLines = wrap(ctx, brand.subline, w * 0.42, `500 20px ${FONT}`);
  let sy = y + 2;
  for (const line of subLines) {
    text(ctx, line, w - padX, sy, `500 20px ${FONT}`, 'rgba(203,213,225,0.86)');
    sy += 31;
  }

  // الأزرار
  const b1W = 192, b1H = 56;
  const by = Math.min(sy + 18, h - b1H - 18);
  pill(ctx, w - padX - b1W, by, b1W, b1H, brand.accent);
  text(ctx, brand.cta, w - padX - b1W / 2, by + b1H / 2 + 1, `800 19px ${FONT}`, '#0b1220', 'center');
  const b2W = 168;
  pill(ctx, w - padX - b1W - 18 - b2W, by, b2W, b1H, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.16)');
  text(ctx, brand.cta2, w - padX - b1W - 18 - b2W / 2, by + b1H / 2 + 1, `700 18px ${FONT}`, '#e2e8f0', 'center');

  return c.canvas.toDataURL('image/png');
}

function drawDashboard(ctx: Ctx, x: number, y: number, w: number, h: number, brand: DemoBrand) {
  ctx.save();
  // بطاقة زجاجية
  const g = linearGradient(ctx, x, y, x + w, y + h, [
    [0, 'rgba(22,32,52,0.95)'],
    [1, 'rgba(13,20,34,0.95)'],
  ]);
  roundRect(ctx, x, y, w, h, 26);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // شريط علوي
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  roundRect(ctx, x + 1, y + 1, w - 2, 46, 24);
  ctx.fill();
  const dots = ['#f87171', '#fbbf24', '#34d399'];
  dots.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + 22 + i * 20, y + 24, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  text(ctx, 'لوحة النمو · مباشر', x + w - 18, y + 25, `700 14px ${FONT}`, 'rgba(203,213,225,0.8)');

  // بطاقات KPI
  const kpis: [string, string, string][] = [
    ['الزوّار', '48.2K', '+18%'],
    ['التحويل', '6.4%', '+2.1%'],
    ['الولاء', '92', '+7'],
  ];
  const kw = (w - 56) / 3;
  kpis.forEach(([label, value, delta], i) => {
    const kx = x + 20 + i * (kw + 8);
    const ky = y + 62;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, kx, ky, kw, 82, 14);
    ctx.fill();
    text(ctx, label, kx + kw - 12, ky + 20, `600 12px ${FONT}`, 'rgba(148,163,184,0.95)');
    text(ctx, value, kx + kw - 12, ky + 46, `800 25px ${FONT}`, '#f8fafc');
    text(ctx, delta, kx + kw - 12, ky + 68, `700 12px ${FONT}`, '#34d399');
  });

  // رسم خطي
  const cx = x + 20;
  const cy = y + 160;
  const cw = w - 40;
  const ch = h - 190;
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  roundRect(ctx, cx, cy, cw, ch, 16);
  ctx.fill();

  // شبكة أفقية
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const gy = cy + (ch / 4) * i;
    ctx.beginPath();
    ctx.moveTo(cx + 12, gy);
    ctx.lineTo(cx + cw - 12, gy);
    ctx.stroke();
  }

  // منحنى
  const pts: [number, number][] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const px = cx + 16 + (cw - 32) * (i / (n - 1));
    const py = cy + ch - 22 - (ch - 50) * (0.25 + 0.55 * (i / (n - 1)) + 0.12 * Math.sin(i * 1.3));
    pts.push([px, py]);
  }
  // مساحة تحت المنحنى
  const grad = ctx.createLinearGradient(0, cy, 0, cy + ch);
  grad.addColorStop(0, 'rgba(94,176,239,0.35)');
  grad.addColorStop(1, 'rgba(94,176,239,0)');
  ctx.beginPath();
  ctx.moveTo(pts[0][0], cy + ch - 12);
  for (const [px, py] of pts) ctx.lineTo(px, py);
  ctx.lineTo(pts[pts.length - 1][0], cy + ch - 12);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // الخط نفسه
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.strokeStyle = brand.accent2;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // نقاط
  for (const [px, py] of pts) {
    ctx.fillStyle = '#0b1220';
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = brand.accent2;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // شارة عائمة
  ctx.save();
  ctx.translate(x + w - 100, y + h - 40);
  ctx.fillStyle = 'rgba(11,18,32,0.95)';
  roundRect(ctx, -92, -24, 100, 48, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,181,68,0.5)';
  ctx.stroke();
  text(ctx, '+٢٤٪ هذا الشهر', 0, 0, `800 13px ${FONT}`, brand.accent, 'right');
  ctx.restore();

  ctx.restore();
}

function renderDashboardPanel(w: number, h: number, brand: DemoBrand): string {
  const c = makeCanvas(w, h);
  if (!c) return '';
  const { ctx } = c;
  ctx.clearRect(0, 0, w, h);
  drawDashboard(ctx, 2, 2, w - 4, h - 4, brand);
  return c.canvas.toDataURL('image/png');
}

function renderCard(w: number, h: number, brand: DemoBrand, item: { title: string; body: string; icon: 'spark' | 'shield' | 'chart' }): string {
  const c = makeCanvas(w, h);
  if (!c) return '';
  const { ctx } = c;
  const g = linearGradient(ctx, 0, 0, w, h, [
    [0, 'rgba(24,34,54,0.96)'],
    [1, 'rgba(13,20,34,0.96)'],
  ]);
  roundRect(ctx, 2, 2, w - 4, h - 4, 26);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // أيقونة
  const ix = w - 58, iy = 58;
  ctx.fillStyle = 'rgba(245,181,68,0.12)';
  ctx.beginPath();
  ctx.arc(ix, iy, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,181,68,0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.strokeStyle = brand.accent;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (item.icon === 'spark') {
    // نجمة/شعلة
    ctx.beginPath();
    ctx.moveTo(ix, iy - 13);
    ctx.quadraticCurveTo(ix + 10, iy - 2, ix + 4, iy + 12);
    ctx.quadraticCurveTo(ix, iy + 6, ix - 4, iy + 12);
    ctx.quadraticCurveTo(ix - 10, iy - 2, ix, iy - 13);
    ctx.stroke();
  } else if (item.icon === 'shield') {
    ctx.beginPath();
    ctx.moveTo(ix, iy - 13);
    ctx.lineTo(ix + 11, iy - 7);
    ctx.lineTo(ix + 9, iy + 4);
    ctx.quadraticCurveTo(ix + 5, iy + 11, ix, iy + 13);
    ctx.quadraticCurveTo(ix - 5, iy + 11, ix - 9, iy + 4);
    ctx.lineTo(ix - 11, iy - 7);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ix - 4, iy);
    ctx.lineTo(ix - 1, iy + 4);
    ctx.lineTo(ix + 5, iy - 4);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(ix - 12, iy + 8);
    ctx.lineTo(ix - 5, iy + 1);
    ctx.lineTo(ix, iy + 6);
    ctx.lineTo(ix + 9, iy - 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ix + 3, iy - 8);
    ctx.lineTo(ix + 10, iy - 9);
    ctx.lineTo(ix + 10, iy - 2);
    ctx.stroke();
  }

  // النص
  text(ctx, item.title, w - 24, 118, `800 24px ${FONT}`, '#f1f5f9');
  const lines = wrap(ctx, item.body, w - 52, `500 16px ${FONT}`);
  let ly = 156;
  for (const line of lines.slice(0, 3)) {
    text(ctx, line, w - 24, ly, `500 16px ${FONT}`, 'rgba(148,163,184,0.95)');
    ly += 26;
  }

  // سهم
  text(ctx, '←', 26, h - 30, `700 20px ${FONT}`, brand.accent, 'left');

  return c.canvas.toDataURL('image/png');
}

function renderLogoBadge(w: number, h: number, label: string, accent: string): string {
  const c = makeCanvas(w, h);
  if (!c) return '';
  const { ctx } = c;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  roundRect(ctx, 1, 1, w - 2, h - 2, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.stroke();

  ctx.save();
  ctx.translate(w - 26, h / 2);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2;
  const s = 10;
  if (label.length % 2 === 0) {
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  text(ctx, label, w - 46, h / 2 + 1, `700 15px ${FONT}`, 'rgba(203,213,225,0.75)');
  return c.canvas.toDataURL('image/png');
}

function wrap(ctx: Ctx, textValue: string, maxWidth: number, font: string): string[] {
  ctx.save();
  ctx.font = font;
  const words = textValue.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  ctx.restore();
  return lines;
}

// ─── الواجهة العامة ─────────────────────────────────────────
export interface DemoLayersOptions {
  brand?: DemoBrand;
  dimensions?: PageDimensions;
}

/**
 * يبني طبقات صفحة هبوط كاملة (خلفية، شريط، بطل، بطاقات، شعارات، شريط ميزات).
 * يعيد مصفوفة بترتيب العمق (الخلفية أولاً).
 */
export async function buildDemoLayers(options: DemoLayersOptions = {}): Promise<CaptureLayer[]> {
  const brand = options.brand ?? DEMO_BRAND;
  const dims = options.dimensions ?? DEFAULT_PAGE_DIMENSIONS;
  const W = dims.width;
  const H = dims.height;
  const sx = W / 1440;
  const sy = H / 900;

  // انتظر تحميل خط القاهرة لضمان نص عربي سليم
  try {
    if (typeof document !== 'undefined' && document.fonts?.load) {
      await Promise.race([
        document.fonts.load(`800 64px ${FONT}`),
        new Promise((r) => setTimeout(r, 1200)),
      ]);
    }
  } catch {
    /* الخط الاحتياطي يكفي */
  }

  const layers: CaptureLayer[] = [];

  const bg = renderBackground(W, H, brand);
  layers.push({
    id: 'bg',
    kind: 'background',
    src: bg,
    bounds: { x: 0, y: 0, width: W, height: H },
    depth: 0.04,
    liftable: false,
    alt: 'خلفية الصفحة',
    opacity: 1,
  });

  const navH = 78 * sy;
  layers.push({
    id: 'nav',
    kind: 'hero',
    src: renderNav(W, navH, brand),
    bounds: { x: 0, y: 10 * sy, width: W, height: navH },
    depth: 0.22,
    liftable: false,
    alt: 'شريط التنقل',
  });

  const heroY = 96 * sy;
  const heroH = 430 * sy;
  layers.push({
    id: 'hero',
    kind: 'hero',
    src: renderHero(W, heroH, brand),
    bounds: { x: 0, y: heroY, width: W, height: heroH },
    depth: 0.34,
    liftable: false,
    alt: 'قسم البطل',
  });

  // لوحة البيانات كطبقة صورة مستقلة — ترتفع وتتحرك بعمق مختلف عن البطل
  const dashW = 582 * sx;
  const dashH = 338 * sy;
  layers.push({
    id: 'dashboard',
    kind: 'image',
    src: renderDashboardPanel(dashW, dashH, brand),
    bounds: { x: 62 * sx, y: 152 * sy, width: dashW, height: dashH },
    depth: 0.6,
    liftable: true,
    alt: 'لوحة بيانات تفاعلية',
    tilt: { rx: 0, ry: -2 },
  });

  // البطاقات
  const cardW = 392 * sx;
  const cardH = 232 * sy;
  const gap = 28 * sx;
  const totalW = cardW * 3 + gap * 2;
  const startX = (W - totalW) / 2;
  const cardY = 552 * sy;
  const cards: { title: string; body: string; icon: 'spark' | 'shield' | 'chart'; depth: number }[] = [
    {
      title: 'سرعة استثنائية',
      body: 'أداء فوري على كل الأجهزة، بلا انتظار وبلا تنازلات.',
      icon: 'spark',
      depth: 0.68,
    },
    {
      title: 'حماية متكاملة',
      body: 'تشفير من الطرف إلى الطرف، وسياسات وصول دقيقة.',
      icon: 'shield',
      depth: 0.74,
    },
    {
      title: 'قرارات بالبيانات',
      body: 'لوحات حيّة تحوّل الأرقام إلى خطوة تالية واضحة.',
      icon: 'chart',
      depth: 0.8,
    },
  ];
  cards.forEach((item, i) => {
    layers.push({
      id: `card-${i + 1}`,
      kind: 'card',
      src: renderCard(cardW, cardH, brand, item),
      bounds: {
        x: startX + i * (cardW + gap),
        y: cardY,
        width: cardW,
        height: cardH,
      },
      depth: item.depth,
      liftable: true,
      alt: item.title,
      tilt: { rx: 0, ry: i === 0 ? 1.5 : i === 2 ? -1.5 : 0 },
    });
  });

  // شريط الشعارات
  const logosY = 816 * sy;
  const logoW = 150 * sx;
  const logoH = 46 * sy;
  const logoGap = 18 * sx;
  const logoStart = (W - (logoW * 5 + logoGap * 4)) / 2;
  const logoLabels = ['أفق', 'مدار', 'سِترا', 'نبض', 'تكوين'];
  logoLabels.forEach((label, i) => {
    layers.push({
      id: `logo-${i + 1}`,
      kind: 'logo',
      src: renderLogoBadge(logoW, logoH, label, i % 2 === 0 ? brand.accent : brand.accent2),
      bounds: {
        x: logoStart + i * (logoW + logoGap),
        y: logosY,
        width: logoW,
        height: logoH,
      },
      depth: 0.9,
      liftable: true,
      alt: `شعار ${label}`,
    });
  });

  return layers.sort((a, b) => a.depth - b.depth);
}
