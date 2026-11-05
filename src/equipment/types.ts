/**
 * أنواع حزمة المعدات العلمية — Science Equipment Gallery
 * معرض صور PNG شفافة تُدرج داخل الشريحة المفتوحة أثناء التحرير،
 * وتُخزَّن إحداثياتها نسباً إلى أبعاد الشريحة (0..1) لا إلى الشاشة.
 */

/**
 * فئات التصفح في المعرض.
 * الفئات الخمس الأولى أصلية (بقيت كما هي حتى لا تنكسر البيانات المحفوظة
 * في localStorage)، والفئات الجديدة تقابل التخصصات العلمية في الجامعات
 * الجزائرية: الكيمياء، الفيزياء، الأحياء، الجيولوجيا، الصحة.
 */
export type EquipmentCategory =
  | 'glassware'
  | 'tools'
  | 'devices'
  | 'safety'
  | 'heating'
  | 'chemistry'
  | 'physics'
  | 'biology'
  | 'geology'
  | 'health';

/** أصل في الكتالوج: صورة PNG محلية شفافة + بيانات وصفية للبحث */
export interface EquipmentAsset {
  /** معرف ثابت يط اسم ملف الأصل */
  id: string;
  /** الاسم العربي المعروض تحت الصورة المصغرة */
  name: string;
  category: EquipmentCategory;
  /** كلمات إضافية للبحث (عربية/لاتينية) */
  keywords: string[];
  /** مسار PNG محلي مجمّع مع الحزمة — ليس رابطاً خارجياً */
  src: string;
  /** الأبعاد الأصلية للصورة (تُشتق منها نسبة الأبعاد) */
  width: number;
  height: number;
}

/**
 * عنصر مُدرج على شريحة. كل الإحداثيات كسور من أبعاد الشريحة:
 * x يسار العنصر، y أعلاه، w عرضه — والارتفاع يُشتق دائماً من نسبة
 * أبعاد الأصل وعرض الشريحة حتى لا تتشوّه الصورة أبداً.
 */
export interface PlacedEquipment {
  /** معرف نسخة فريد */
  id: string;
  assetId: string;
  /** الحافة اليسرى ÷ عرض الشريحة (0..1) */
  x: number;
  /** الحافة العليا ÷ ارتفاع الشريحة (0..1) */
  y: number;
  /** العرض ÷ عرض الشريحة (0..1) */
  w: number;
}

/** صيغة الحفظ المحلي — بمفتاح الشريحة الثابت slide.id */
export interface EquipmentPersist {
  version: 1;
  slides: Record<string, PlacedEquipment[]>;
}

/** مفتاح التخزين المحلي (نمط db-chalkboard-v1 نفسه) */
export const STORAGE_KEY = 'db-equipment-v1';

/** نوع بيانات السحب من المعرض إلى الشريحة (+ بادئة نصية بديلة لمتصفحات اللمس/سفاري) */
export const DND_MIME = 'application/x-equipment';
export const DND_PREFIX = 'equipment:';

/** العرض الافتراضي عند الإدراج (كسر من عرض الشريحة) */
export const DEFAULT_WIDTH = 0.16;
export const MIN_WIDTH = 0.05;
export const MAX_WIDTH = 0.9;

/** خطوة التحريك بالأسهم (كسر من أبعاد الشريحة) */
export const NUDGE = 0.01;
export const NUDGE_LARGE = 0.05;

/** حدّ خطوات التراجع المحفوظة في الجلسة */
export const HISTORY_LIMIT = 60;

/** تسميات الفئات بالعربية (الترتيب: الأصول ثم التخصصات العلمية) */
export const EQUIPMENT_CATEGORIES: ReadonlyArray<{ id: EquipmentCategory; label: string }> = [
  { id: 'glassware', label: 'الزجاجيات' },
  { id: 'chemistry', label: 'الكيمياء' },
  { id: 'physics', label: 'الفيزياء' },
  { id: 'biology', label: 'الأحياء' },
  { id: 'geology', label: 'الجيولوجيا' },
  { id: 'health', label: 'الصحة' },
  { id: 'tools', label: 'أدوات المختبر' },
  { id: 'devices', label: 'الأجهزة' },
  { id: 'safety', label: 'السلامة' },
  { id: 'heating', label: 'التسخين' },
];
