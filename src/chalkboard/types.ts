/**
 * أنواع حزمة السبورة والتعليق — Chalkboard & Annotation
 * منفذة بنموذج إضافة chalkboard من reveal.js-plugins (MIT — Asvin Goel):
 * طبقة تعليق فوق الشرائح + سبورة مستقلة متعددة الصفحات، قلم وممحاة،
 * ألوان الطباشير والماركر، سُمك متغيّر، تراجع ومسح، وحفظ محلي.
 */

/** الأدوات: طباشير (خط صلب) — ماركر (شفاف) — ممحاة (تشطيب) */
export type ChalkTool = 'chalk' | 'marker' | 'eraser';

/** نمط العمل: مغلق — تعليق فوق الشريحة — سبورة مستقلة */
export type ChalkboardMode = 'off' | 'notes' | 'board';

/** نقطة في إحداثيات منطقية (بكسل CSS — تُطبع بمقياس DPR) */
export interface ChalkPoint {
  x: number;
  y: number;
}

/** خطّة رسم واحدة: أداة + لون + سُمك + نقاط */
export interface ChalkStroke {
  tool: ChalkTool;
  color: string;
  size: number;
  points: ChalkPoint[];
}

/** أزواج ألوان (قيمة + اسم عربي) */
export interface ChalkColorOption {
  value: string;
  label: string;
}

/**
 * ألوان الطباشير — فاتحة صريحة على السبورة الداكنة
 * (روح لوحة chalk في الإضافة الأصلية: أبيض، سماوي، قرمزي، أخضر، برتقالي، بنفسجي)
 */
export const CHALK_COLORS: ChalkColorOption[] = [
  { value: '#f8fafc', label: 'أبيض' },
  { value: '#7dd3fc', label: 'سماوي' },
  { value: '#fda4af', label: 'وردي' },
  { value: '#6ee7b7', label: 'أخضر' },
  { value: '#fdba74', label: 'برتقالي' },
  { value: '#d8b4fe', label: 'بنفسجي' },
];

/** ألوان الماركر — شبه شفافة كالتظليل فوق الشريحة (لوحة marker في الإضافة الأصلية) */
export const MARKER_COLORS: ChalkColorOption[] = [
  { value: 'rgba(96,154,244,0.5)', label: 'أزرق' },
  { value: 'rgba(237,20,28,0.45)', label: 'أحمر' },
  { value: 'rgba(20,180,60,0.45)', label: 'أخضر' },
  { value: 'rgba(220,133,41,0.5)', label: 'برتقالي' },
  { value: 'rgba(190,0,220,0.45)', label: 'بنفسجي' },
  { value: 'rgba(255,220,0,0.5)', label: 'أصفر' },
];

/** السُمك المعروضة (بكسل) — الممحاة ترسم بسُمك مضاعف */
export const STROKE_WIDTHS = [3, 6, 12] as const;

/** عدد صفحات السبورة الابتدائي (تتمدد تلقائياً بالاستعمال) */
export const INITIAL_BOARD_PAGES = 3;

/** مفتاح التخزين المحلي */
export const STORAGE_KEY = 'db-chalkboard-v1';

/** حالة الحفظ — نفس بنية الإضافة الأصلية: تعليقات لكل شريحة + صفحات سبورة */
export interface ChalkboardPersist {
  version: 1;
  /** طبقة التعليق: مفتاح الشاشة (screenKey) ← خطوط */
  notes: Record<string, ChalkStroke[]>;
  /** صفحات السبورة المستقلة */
  board: ChalkStroke[][];
}

export const DEFAULT_TOOL: ChalkTool = 'chalk';
export const DEFAULT_COLOR = CHALK_COLORS[0].value;
export const DEFAULT_SIZE: number = STROKE_WIDTHS[1];

/** حجم الممحاة بالنسبة للسُمك المختار */
export const ERASER_SCALE = 4;
