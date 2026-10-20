/**
 * التقاط صفحة الهبوط وطبقاتها عبر Playwright
 * Capture landing page + layers via Playwright
 *
 * هذه الوحدة تعمل في بيئتين:
 *  1) Node.js مع Playwright (الالتقاط الحقيقي)
 *  2) المتصفح دون Playwright (التقاط تجريبي/اختباري عبر الـ DOM)
 */

import type { CaptureLayer, CaptureResult, PageDimensions } from './types';
import { DEFAULT_PAGE_DIMENSIONS } from './types';

// ─────────────────────────────────────────────────────────────
// 1. أنواع واجهة الالتقاط
// ─────────────────────────────────────────────────────────────
export interface CaptureOptions {
  /** رابط الصفحة (للـ Node) أو عنصر الحاوية (للمتصفح) */
  url?: string;
  /** عنصر DOM للالتقاط منه عند العمل في المتصفح */
  container?: HTMLElement;
  /** أبعاد الصفحة المثبتة */
  dimensions?: Partial<PageDimensions>;
  /** محددات الطبقات القابلة للالتقاط */
  layerSelectors?: LayerSelector[];
  /** التقاط الشعار؟ */
  captureLogos?: boolean;
  /** جودة JPEG 0..100 (إن استُعمل JPEG) */
  quality?: number;
  /** التقاط صور الخلفيات؟ */
  captureBackgrounds?: boolean;
}

export interface LayerSelector {
  /** محدد CSS */
  selector: string;
  /** نوع الطبقة الناتج */
  kind: CaptureLayer['kind'];
  /** عمق مخصص (0..1) */
  depth?: number;
  /** هل قابلة للرفع؟ */
  liftable?: boolean;
  /** اسم الطبقة (للتصحيح) */
  label?: string;
}

export const DEFAULT_LAYER_SELECTORS: LayerSelector[] = [
  { selector: '[data-flyover="hero"]', kind: 'hero', depth: 0.2, liftable: false, label: 'البطل' },
  { selector: '[data-flyover="card"]', kind: 'card', depth: 0.75, liftable: true, label: 'بطاقة' },
  { selector: '[data-flyover="image"]', kind: 'image', depth: 0.65, liftable: true, label: 'صورة' },
  { selector: '[data-flyover="logo"]', kind: 'logo', depth: 0.85, liftable: true, label: 'شعار' },
  { selector: '.card, [data-card]', kind: 'card', depth: 0.7, liftable: true },
  { selector: 'img[data-liftable]', kind: 'image', depth: 0.72, liftable: true },
];

// ─────────────────────────────────────────────────────────────
// 2. توليد بيانات طبقات تجريبية (بدون Playwright — للمعاينة والاختبار)
// ─────────────────────────────────────────────────────────────
/**
 * يولّد طبقات تجريبية من بيانات وهمية — مفيد للمعاينة والاختبار دون الحاجة لخادم Playwright
 */
export function generateMockLayers(
  dimensions: PageDimensions = DEFAULT_PAGE_DIMENSIONS,
): CaptureLayer[] {
  const { width: W, height: H } = dimensions;

  // نستخدم صور placeholder جميلة عبر canvas (data URLs)
  const mkPlaceholder = (w: number, h: number, bg: string, fg: string, text: string): string => {
    if (typeof document === 'undefined') return '';
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    // تدرج
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, bg);
    g.addColorStop(1, adjustColor(bg, -18));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // نص
    ctx.fillStyle = fg;
    ctx.font = `bold ${Math.round(Math.min(w, h) * 0.07)}px Cairo, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapText(text, w * 0.8, ctx);
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, h / 2 + (i - (lines.length - 1) / 2) * Math.round(Math.min(w, h) * 0.09));
    });
    // إطار لطيف
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    return c.toDataURL('image/png');
  };

  const layers: CaptureLayer[] = [];

  // 1) الخلفية الكاملة (تدرج داكن)
  layers.push({
    id: 'bg',
    kind: 'background',
    src: mkPlaceholder(W, H, '#0f172a', '#334155', ''),
    bounds: { x: 0, y: 0, width: W, height: H },
    depth: 0.05,
    liftable: false,
    alt: 'الخلفية',
  });

  // 2) الشريط العلوي (navbar)
  layers.push({
    id: 'nav',
    kind: 'hero',
    src: mkPlaceholder(W, 72, '#1e293b', '#f1f5f9', 'الشريط العلوي — علامتك'),
    bounds: { x: 0, y: 0, width: W, height: 72 },
    depth: 0.15,
    liftable: false,
    alt: 'الشريط العلوي',
  });

  // 3) قسم البطل
  layers.push({
    id: 'hero',
    kind: 'hero',
    src: mkPlaceholder(W, 420, '#1e3a5f', '#e0f2fe', 'قسم البطل — عنوان جذاب يعبّر عن قيمة علامتك'),
    bounds: { x: 0, y: 80, width: W, height: 420 },
    depth: 0.25,
    liftable: false,
    alt: 'البطل',
  });

  // 4) بطاقات (3)
  const cardW = Math.round(W * 0.28);
  const cardH = 220;
  const gap = Math.round(W * 0.04);
  const startX = Math.round((W - cardW * 3 - gap * 2) / 2);
  const cardColors: [string, string, string][] = [
    ['#f59e0b', '#fffbeb', 'ميزة أولى — سرعة فائقة'],
    ['#0ea5e9', '#f0f9ff', 'ميزة ثانية — أمان متكامل'],
    ['#10b981', '#ecfdf5', 'ميزة ثالثة — دعم مستمر'],
  ];
  cardColors.forEach(([bg, fg, text], i) => {
    layers.push({
      id: `card-${i + 1}`,
      kind: 'card',
      src: mkPlaceholder(cardW, cardH, bg, fg, text),
      bounds: { x: startX + i * (cardW + gap), y: 560, width: cardW, height: cardH },
      depth: 0.72 + i * 0.04,
      liftable: true,
      alt: `بطاقة ${i + 1}`,
    });
  });

  // 5) صف الشعارات
  const logoSize = 64;
  const logoGap = 24;
  const logoCount = 5;
  const logoStartX = Math.round((W - (logoSize * logoCount + logoGap * (logoCount - 1))) / 2);
  for (let i = 0; i < logoCount; i++) {
    layers.push({
      id: `logo-${i + 1}`,
      kind: 'logo',
      src: mkPlaceholder(logoSize, logoSize, '#334155', '#f8fafc', `شعار ${i + 1}`),
      bounds: { x: logoStartX + i * (logoSize + logoGap), y: 820, width: logoSize, height: logoSize },
      depth: 0.88,
      liftable: true,
      alt: `شعار ${i + 1}`,
    });
  }

  return layers;
}

function adjustColor(hex: string, delta: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + delta));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + delta));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + delta));
  return `rgb(${r},${g},${b})`;
}

function wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─────────────────────────────────────────────────────────────
// 3. التقاط من الـ DOM (المتصفح — بدون Playwright)
// ─────────────────────────────────────────────────────────────
/**
 * يلتقط الطبقات من DOM الحالي عبر html2canvas تقريبي (يستخدم canvas + getBoundingClientRect)
 * للحصول على التقاط حقيقي استخدم سكربت Playwright (scripts/capture-landing.mjs)
 */
export async function captureFromDOM(
  container: HTMLElement,
  opts: CaptureOptions = {},
): Promise<CaptureResult> {
  const dims: PageDimensions = {
    ...DEFAULT_PAGE_DIMENSIONS,
    ...opts.dimensions,
  };
  const selectors = opts.layerSelectors ?? DEFAULT_LAYER_SELECTORS;
  const layers: CaptureLayer[] = [];

  // خلفية كاملة — استخدم لقطة الـ container كصورة (عبر canvas مؤقت)
  // هنا نُنشئ placeholder؛ اللقطة الحقيقية تتم عبر Playwright
  const containerRect = container.getBoundingClientRect();
  const scale = containerRect.width ? dims.width / containerRect.width : 1;

  for (const sel of selectors) {
    const elements = container.querySelectorAll(sel.selector);
    elements.forEach((el, idx) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const bounds = {
        x: Math.round((rect.left - cRect.left) * scale),
        y: Math.round((rect.top - cRect.top) * scale),
        width: Math.round(rect.width * scale),
        height: Math.round(rect.height * scale),
      };
      if (bounds.width < 4 || bounds.height < 4) return;

      // حاول التقاط العنصر كـ data URL عبر canvas (تقريبي)
      let src = '';
      try {
        src = elementToDataUrl(el as HTMLElement);
      } catch {
        src = '';
      }

      layers.push({
        id: `${sel.kind}-${sel.label ?? sel.selector}-${idx}`,
        kind: sel.kind,
        src,
        bounds,
        depth: sel.depth ?? 0.5,
        liftable: sel.liftable ?? false,
        alt: (el as HTMLElement).getAttribute('alt') ?? sel.label ?? '',
      });
    });
  }

  // إن لم نجد طبقات، استخدم التجريبية
  if (layers.length === 0) {
    return {
      dimensions: dims,
      layers: generateMockLayers(dims),
      capturedAt: new Date().toISOString(),
    };
  }

  return {
    dimensions: dims,
    layers,
    capturedAt: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

function elementToDataUrl(el: HTMLElement): string {
  // محاولة سريعة: إن كان <img> استخدم src مباشرة
  if (el.tagName === 'IMG') {
    const src = (el as HTMLImageElement).src;
    if (src) return src;
  }
  // إن كان له خلفية CSS image
  const bg = getComputedStyle(el).backgroundImage;
  const m = bg.match(/url\(["']?(.*?)["']?\)/);
  if (m?.[1]) return m[1];

  // fallback: أنشئ canvas ملوّن بسيط يحمل نص العنصر
  const c = document.createElement('canvas');
  const w = Math.max(1, Math.round(el.getBoundingClientRect().width));
  const h = Math.max(1, Math.round(el.getBoundingClientRect().height));
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const cs = getComputedStyle(el);
  ctx.fillStyle = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : '#1e293b';
  ctx.fillRect(0, 0, w, h);
  const text = (el.textContent ?? '').trim().slice(0, 80);
  if (text) {
    ctx.fillStyle = cs.color || '#f1f5f9';
    ctx.font = `${cs.fontWeight} 14px ${cs.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // قسم النص
    const lines = wrapText(text, w * 0.9, ctx);
    lines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, w / 2, h / 2 + (i - 1) * 18);
    });
  }
  return c.toDataURL('image/png');
}

// ─────────────────────────────────────────────────────────────
// 4. واجهة Playwright (Node) — تُستدعى من سكربت منفصل
// ─────────────────────────────────────────────────────────────
export interface PlaywrightCaptureConfig {
  /** رابط الصفحة */
  url: string;
  /** مسار الإخراج (مجلد) */
  outDir: string;
  /** أبعاد ثابتة */
  dimensions: PageDimensions;
  /** محددات الطبقات */
  selectors: LayerSelector[];
  /** التقاط كامل الصفحة؟ */
  fullPage: boolean;
  /** مهلة الانتظار للشبكة (ms) */
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle';
  /** تأخير إضافي بعد التحميل (للتأثيرات) */
  extraDelayMs: number;
}

/**
 * يبني إعدادات افتراضية لالتقاط Playwright
 */
export function defaultPlaywrightConfig(url: string, outDir = 'captures'): PlaywrightCaptureConfig {
  return {
    url,
    outDir,
    dimensions: DEFAULT_PAGE_DIMENSIONS,
    selectors: DEFAULT_LAYER_SELECTORS,
    fullPage: true,
    waitUntil: 'networkidle',
    extraDelayMs: 800,
  };
}

/**
 * يحوّل نتيجة Playwright (ملفات محفوظة) إلى CaptureResult
 * يُستدعى بعد تشغيل سكربت الالتقاط لقراءة الـ JSON الناتج
 */
export function captureResultFromFiles(
  manifest: {
    dimensions: PageDimensions;
    url: string;
    capturedAt: string;
    layers: Array<{
      id: string;
      kind: CaptureLayer['kind'];
      file: string;
      bounds: CaptureLayer['bounds'];
      depth: number;
      liftable: boolean;
    }>;
    fullPageFile?: string;
  },
  fileToDataUrl: (filePath: string) => string,
): CaptureResult {
  return {
    dimensions: manifest.dimensions,
    capturedAt: manifest.capturedAt,
    url: manifest.url,
    fullPageSrc: manifest.fullPageFile ? fileToDataUrl(manifest.fullPageFile) : undefined,
    layers: manifest.layers.map((l) => ({
      id: l.id,
      kind: l.kind,
      src: fileToDataUrl(l.file),
      bounds: l.bounds,
      depth: l.depth,
      liftable: l.liftable,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// 5. تحميل manifest من Playwright داخل المتصفح
// ─────────────────────────────────────────────────────────────
export interface CaptureManifest {
  dimensions: PageDimensions;
  url?: string;
  capturedAt: string;
  fullPageFile?: string;
  layers: Array<{
    id: string;
    kind: CaptureLayer['kind'];
    file: string;
    bounds: CaptureLayer['bounds'];
    depth: number;
    liftable: boolean;
    selector?: string;
  }>;
}

/**
 * يقرأ manifest.json الناتج من scripts/capture-landing.mjs ويحوّله إلى CaptureResult
 * بمسارات URL صالحة للمتصفح (نسبةً إلى مكان الملف نفسه).
 */
export async function loadCaptureManifest(manifestUrl: string): Promise<CaptureResult> {
  const res = await fetch(manifestUrl);
  if (!res.ok) throw new Error(`تعذر قراءة manifest: ${res.status}`);
  const manifest = (await res.json()) as CaptureManifest;
  const base = new URL(manifestUrl, window.location.href);
  const resolve = (file: string) => new URL(file, base).toString();

  return {
    dimensions: manifest.dimensions,
    capturedAt: manifest.capturedAt,
    url: manifest.url,
    fullPageSrc: manifest.fullPageFile ? resolve(manifest.fullPageFile) : undefined,
    layers: manifest.layers.map((l) => ({
      id: l.id,
      kind: l.kind,
      src: resolve(l.file),
      bounds: l.bounds,
      depth: l.depth,
      liftable: l.liftable,
      alt: l.selector,
    })),
  };
}
