/**
 * سجلّ الخطوط المثبتة (fontsource — تعمل دون اتصال).
 * كل خط يُحمَّل كسولاً عبر `load()` فلا يدخل الحزمة إلا إن اختير في src/data/typography.ts أو في مختبر الخطوط (?lab=fonts).
 * الكتالوج والإرشادات: docs/TYPOGRAPHY.md — المهارة: .agents/skills/arabic-typography-motion
 */

export type FontCategory = 'modern' | 'kufi' | 'naskh' | 'ruqaa' | 'display' | 'rounded' | 'latin' | 'mono';
export type FontRole = 'heading' | 'body' | 'display' | 'mono';
export type FontAxis = 'wght' | 'wdth' | 'slnt' | 'HEXP' | 'opsz';

export interface FontDef {
  id: FontId;
  /** اسم العائلة كما في CSS (fontsource: «Family Variable» للمتغير) */
  family: string;
  /** الاسم العربي للعرض */
  label: string;
  latinName: string;
  category: FontCategory;
  scripts: ('arabic' | 'latin')[];
  /** خط متغيّر (يدعم حركة الوزن/المحاور) */
  variable: boolean;
  /** مدى الأوزان المتاح [أدنى، أقصى] */
  weights: [number, number];
  /** المحاور المتاحة للخطوط المتغيرة */
  axes?: Partial<Record<FontAxis, [number, number]>>;
  /** الأدوار المناسبة */
  roles: FontRole[];
  /** متى يُستعمل (جملة) */
  bestFor: string;
  /** ارتفاع سطر مقترح للنص الجاري */
  lineHeight: number;
  /** مكدس احتياطي */
  fallback: string;
  /** استيراد CSS الخط (كسول) */
  load: () => Promise<unknown>;
}

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  modern: 'حديث (سانس)',
  kufi: 'كوفي',
  naskh: 'نسخ',
  ruqaa: 'رقعة',
  display: 'زخرفي / عناوين',
  rounded: 'مدوّر / ودود',
  latin: 'لاتيني مرافق',
  mono: 'أحادي المسافة (كود)',
};

const AR_FALLBACK = "'Segoe UI', Tahoma, system-ui, sans-serif";
const SERIF_FALLBACK = "'Times New Roman', 'Traditional Arabic', serif";
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export const FONT_IDS = [
  'cairo',
  'tajawal',
  'almarai',
  'changa',
  'el-messiri',
  'readex-pro',
  'ibm-plex-sans-arabic',
  'noto-sans-arabic',
  'vazirmatn',
  'alexandria',
  'rubik',
  'noto-kufi-arabic',
  'reem-kufi',
  'kufam',
  'amiri',
  'noto-naskh-arabic',
  'scheherazade-new',
  'markazi-text',
  'harmattan',
  'aref-ruqaa',
  'katibeh',
  'rakkas',
  'jomhuria',
  'baloo-bhaijaan-2',
  'lemonada',
  'marhey',
  'inter',
  'jetbrains-mono',
  'fira-code',
] as const;

export type FontId = (typeof FONT_IDS)[number];

export const FONTS: Record<FontId, FontDef> = {
  // ——— حديث (سانس) ———
  cairo: {
    id: 'cairo',
    family: 'Cairo Variable',
    label: 'القاهرة',
    latinName: 'Cairo',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [200, 1000],
    axes: { wght: [200, 1000] },
    roles: ['heading', 'body', 'display'],
    bestFor: 'الافتراضي للقالب — نص وعناوين واضحة في كل الأحجام؛ محور slnt متاح عبر slnt.css',
    lineHeight: 1.7,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/cairo'),
  },
  tajawal: {
    id: 'tajawal',
    family: 'Tajawal',
    label: 'تجوال',
    latinName: 'Tajawal',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 800],
    roles: ['body', 'heading'],
    bestFor: 'نص جارٍ أنيق وخفيف للعروض المؤسسية؛ يقترن بـ Almarai أو Changa للعناوين',
    lineHeight: 1.75,
    fallback: AR_FALLBACK,
    load: () =>
      Promise.all([
        import('@fontsource/tajawal/400.css'),
        import('@fontsource/tajawal/500.css'),
        import('@fontsource/tajawal/700.css'),
        import('@fontsource/tajawal/800.css'),
      ]),
  },
  almarai: {
    id: 'almarai',
    family: 'Almarai',
    label: 'المراعي',
    latinName: 'Almarai',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [300, 800],
    roles: ['heading', 'body'],
    bestFor: 'عناوين مؤسسية نظيفة بوزن 700/800؛ نص بوزن 400',
    lineHeight: 1.7,
    fallback: AR_FALLBACK,
    load: () =>
      Promise.all([
        import('@fontsource/almarai/300.css'),
        import('@fontsource/almarai/400.css'),
        import('@fontsource/almarai/700.css'),
        import('@fontsource/almarai/800.css'),
      ]),
  },
  changa: {
    id: 'changa',
    family: 'Changa Variable',
    label: 'تشانغا',
    latinName: 'Changa',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [200, 800],
    axes: { wght: [200, 800] },
    roles: ['heading', 'display'],
    bestFor: 'عناوين قوية مضغوطة للمناقشات الأكاديمية والتقارير؛ تألّق مع حركة الوزن 300→800',
    lineHeight: 1.5,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/changa'),
  },
  'el-messiri': {
    id: 'el-messiri',
    family: 'El Messiri Variable',
    label: 'المسيري',
    latinName: 'El Messiri',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [400, 700],
    axes: { wght: [400, 700] },
    roles: ['heading', 'display'],
    bestFor: 'عناوين بلمسة خطّية (يجمع الحداثة بروح النسخ) — مناسب للثقافة والتعليم',
    lineHeight: 1.6,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/el-messiri'),
  },
  'readex-pro': {
    id: 'readex-pro',
    family: 'Readex Pro Variable',
    label: 'ريدكس برو',
    latinName: 'Readex Pro',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [160, 700],
    axes: { wght: [160, 700], HEXP: [0, 100] },
    roles: ['heading', 'body'],
    bestFor: 'قابلية قراءة عالية (صُمّم للقراءة الميسّرة)؛ محور HEXP يوسّع الحروف — مثالي للعروض التقنية',
    lineHeight: 1.7,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/readex-pro/full.css'),
  },
  'ibm-plex-sans-arabic': {
    id: 'ibm-plex-sans-arabic',
    family: 'IBM Plex Sans Arabic',
    label: 'IBM بلكس سانس عربي',
    latinName: 'IBM Plex Sans Arabic',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [300, 700],
    roles: ['body', 'heading'],
    bestFor: 'نص تقني/مؤسسي محايد مع لاتيني متناسق تماماً (Plex)',
    lineHeight: 1.75,
    fallback: AR_FALLBACK,
    load: () =>
      Promise.all([
        import('@fontsource/ibm-plex-sans-arabic/300.css'),
        import('@fontsource/ibm-plex-sans-arabic/400.css'),
        import('@fontsource/ibm-plex-sans-arabic/500.css'),
        import('@fontsource/ibm-plex-sans-arabic/700.css'),
      ]),
  },
  'noto-sans-arabic': {
    id: 'noto-sans-arabic',
    family: 'Noto Sans Arabic Variable',
    label: 'نوتو سانس عربي',
    latinName: 'Noto Sans Arabic',
    category: 'modern',
    scripts: ['arabic'],
    variable: true,
    weights: [100, 900],
    axes: { wght: [100, 900], wdth: [62.5, 100] },
    roles: ['body', 'heading'],
    bestFor: 'عائلة Noto الشاملة؛ محور العرض wdth (62.5–100) يسمح بحركة «تمدّد» فريدة للعناوين',
    lineHeight: 1.75,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/noto-sans-arabic/wdth.css'),
  },
  vazirmatn: {
    id: 'vazirmatn',
    family: 'Vazirmatn Variable',
    label: 'وزيرمتن',
    latinName: 'Vazirmatn',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [100, 900],
    axes: { wght: [100, 900] },
    roles: ['body', 'heading'],
    bestFor: 'نص واجهات ممتاز (9 أوزان)، متوازن مع اللاتيني؛ بديل حديث لـ Cairo',
    lineHeight: 1.75,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/vazirmatn'),
  },
  alexandria: {
    id: 'alexandria',
    family: 'Alexandria Variable',
    label: 'الإسكندرية',
    latinName: 'Alexandria',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [100, 900],
    axes: { wght: [100, 900] },
    roles: ['heading', 'body'],
    bestFor: 'هندسي عريض للعناوين الكبيرة والشارات؛ أوزان 100–900',
    lineHeight: 1.6,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/alexandria'),
  },
  rubik: {
    id: 'rubik',
    family: 'Rubik Variable',
    label: 'روبيك',
    latinName: 'Rubik',
    category: 'modern',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [300, 900],
    axes: { wght: [300, 900] },
    roles: ['body', 'heading'],
    bestFor: 'زوايا مدوّرة خفيفة؛ لاتيني وعربي من المصمم نفسه — جيد للمحتوى الثنائي اللغة',
    lineHeight: 1.7,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/rubik'),
  },

  // ——— كوفي ———
  'noto-kufi-arabic': {
    id: 'noto-kufi-arabic',
    family: 'Noto Kufi Arabic Variable',
    label: 'نوتو كوفي',
    latinName: 'Noto Kufi Arabic',
    category: 'kufi',
    scripts: ['arabic'],
    variable: true,
    weights: [100, 900],
    axes: { wght: [100, 900] },
    roles: ['heading', 'body', 'display'],
    bestFor: 'كوفي حديث واضح للعناوين والشاشات الكبيرة؛ يعمل كنص أيضاً',
    lineHeight: 1.8,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/noto-kufi-arabic'),
  },
  'reem-kufi': {
    id: 'reem-kufi',
    family: 'Reem Kufi Variable',
    label: 'ريم كوفي',
    latinName: 'Reem Kufi',
    category: 'kufi',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [400, 700],
    axes: { wght: [400, 700] },
    roles: ['display', 'heading'],
    bestFor: 'كوفي هندسي للعناوين القصيرة والشعارات — لا يُستعمل للنص الجاري',
    lineHeight: 1.5,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/reem-kufi'),
  },
  kufam: {
    id: 'kufam',
    family: 'Kufam Variable',
    label: 'كوفام',
    latinName: 'Kufam',
    category: 'kufi',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [400, 900],
    axes: { wght: [400, 900] },
    roles: ['display', 'heading'],
    bestFor: 'كوفي معاصر بشخصية قوية لعناوين الفصول والشارات',
    lineHeight: 1.5,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/kufam'),
  },

  // ——— نسخ ———
  amiri: {
    id: 'amiri',
    family: 'Amiri',
    label: 'أميري',
    latinName: 'Amiri',
    category: 'naskh',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 700],
    roles: ['display', 'body', 'heading'],
    bestFor: 'نسخ كلاسيكي (مطبعة بولاق) — اقتباسات، آيات، نصوص تراثية وعناوين أكاديمية رصينة',
    lineHeight: 1.9,
    fallback: SERIF_FALLBACK,
    load: () => Promise.all([import('@fontsource/amiri/400.css'), import('@fontsource/amiri/700.css')]),
  },
  'noto-naskh-arabic': {
    id: 'noto-naskh-arabic',
    family: 'Noto Naskh Arabic Variable',
    label: 'نوتو نسخ',
    latinName: 'Noto Naskh Arabic',
    category: 'naskh',
    scripts: ['arabic'],
    variable: true,
    weights: [400, 700],
    axes: { wght: [400, 700] },
    roles: ['body', 'heading'],
    bestFor: 'نسخ حديث مريح للقراءة الطويلة — المقدمة والخاتمة والفقرات',
    lineHeight: 1.9,
    fallback: SERIF_FALLBACK,
    load: () => import('@fontsource-variable/noto-naskh-arabic'),
  },
  'scheherazade-new': {
    id: 'scheherazade-new',
    family: 'Scheherazade New',
    label: 'شهرزاد',
    latinName: 'Scheherazade New',
    category: 'naskh',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 700],
    roles: ['body', 'display'],
    bestFor: 'نسخ تقليدي بتغطية واسعة (SIL) — نصوص أدبية ودينية ولغوية',
    lineHeight: 2,
    fallback: SERIF_FALLBACK,
    load: () => Promise.all([import('@fontsource/scheherazade-new/400.css'), import('@fontsource/scheherazade-new/700.css')]),
  },
  'markazi-text': {
    id: 'markazi-text',
    family: 'Markazi Text Variable',
    label: 'مركزي',
    latinName: 'Markazi Text',
    category: 'naskh',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [400, 700],
    axes: { wght: [400, 700] },
    roles: ['heading', 'body', 'display'],
    bestFor: 'نسخ تحريري عصري للعناوين والنصوص الصحفية — يقترن بـ Noto Naskh للنص',
    lineHeight: 1.7,
    fallback: SERIF_FALLBACK,
    load: () => import('@fontsource-variable/markazi-text'),
  },
  harmattan: {
    id: 'harmattan',
    family: 'Harmattan',
    label: 'هرمتان',
    latinName: 'Harmattan',
    category: 'naskh',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 700],
    roles: ['body', 'display'],
    bestFor: 'نسخ بأسلوب مغاربي/إفريقي (ورش) — لمسة محلية للعروض الثقافية في المغرب العربي',
    lineHeight: 1.9,
    fallback: SERIF_FALLBACK,
    load: () => Promise.all([import('@fontsource/harmattan/400.css'), import('@fontsource/harmattan/700.css')]),
  },

  // ——— رقعة ———
  'aref-ruqaa': {
    id: 'aref-ruqaa',
    family: 'Aref Ruqaa',
    label: 'عارف رقعة',
    latinName: 'Aref Ruqaa',
    category: 'ruqaa',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 700],
    roles: ['display'],
    bestFor: 'رقعة لعناوين قصيرة واقتباسات وتوقيعات — ليس للنص الجاري ولا للأحجام الصغيرة',
    lineHeight: 1.8,
    fallback: SERIF_FALLBACK,
    load: () => Promise.all([import('@fontsource/aref-ruqaa/400.css'), import('@fontsource/aref-ruqaa/700.css')]),
  },

  // ——— زخرفي / عناوين ———
  katibeh: {
    id: 'katibeh',
    family: 'Katibeh',
    label: 'كاتبة',
    latinName: 'Katibeh',
    category: 'display',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 400],
    roles: ['display'],
    bestFor: 'عناوين تراثية كبيرة بروح الثلث/النسخ المطبعي — شاشة العنوان والفواصل',
    lineHeight: 1.6,
    fallback: SERIF_FALLBACK,
    load: () => import('@fontsource/katibeh/400.css'),
  },
  rakkas: {
    id: 'rakkas',
    family: 'Rakkas',
    label: 'رقّاص',
    latinName: 'Rakkas',
    category: 'display',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 400],
    roles: ['display'],
    bestFor: 'زخرفي ثقيل عالي التباين لكلمة أو كلمتين (أرقام كبيرة، شعار جلسة)',
    lineHeight: 1.6,
    fallback: SERIF_FALLBACK,
    load: () => import('@fontsource/rakkas/400.css'),
  },
  jomhuria: {
    id: 'jomhuria',
    family: 'Jomhuria',
    label: 'جمهورية',
    latinName: 'Jomhuria',
    category: 'display',
    scripts: ['arabic', 'latin'],
    variable: false,
    weights: [400, 400],
    roles: ['display'],
    bestFor: 'عناوين ملصقات مضغوطة جداً وثقيلة — بحجم كبير فقط',
    lineHeight: 1.3,
    fallback: SERIF_FALLBACK,
    load: () => import('@fontsource/jomhuria/400.css'),
  },

  // ——— مدوّر / ودود ———
  'baloo-bhaijaan-2': {
    id: 'baloo-bhaijaan-2',
    family: 'Baloo Bhaijaan 2 Variable',
    label: 'بالو بهاي جان 2',
    latinName: 'Baloo Bhaijaan 2',
    category: 'rounded',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [400, 800],
    axes: { wght: [400, 800] },
    roles: ['heading', 'display'],
    bestFor: 'عناوين مدوّرة مرحة للعروض التعليمية وعروض الأطفال والمنتجات الودودة',
    lineHeight: 1.6,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/baloo-bhaijaan-2'),
  },
  lemonada: {
    id: 'lemonada',
    family: 'Lemonada Variable',
    label: 'ليمونادة',
    latinName: 'Lemonada',
    category: 'rounded',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [300, 700],
    axes: { wght: [300, 700] },
    roles: ['display', 'heading'],
    bestFor: 'مدوّر ناعم بشخصية لطيفة — شارات ودعوات وعبارات قصيرة',
    lineHeight: 1.8,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/lemonada'),
  },
  marhey: {
    id: 'marhey',
    family: 'Marhey Variable',
    label: 'مرحى',
    latinName: 'Marhey',
    category: 'rounded',
    scripts: ['arabic', 'latin'],
    variable: true,
    weights: [300, 700],
    axes: { wght: [300, 700] },
    roles: ['display'],
    bestFor: 'عرضي مرح (كرتوني) لكلمة احتفالية أو عنوان فعالية',
    lineHeight: 1.6,
    fallback: AR_FALLBACK,
    load: () => import('@fontsource-variable/marhey'),
  },

  // ——— لاتيني مرافق ———
  inter: {
    id: 'inter',
    family: 'Inter Variable',
    label: 'إنتر',
    latinName: 'Inter',
    category: 'latin',
    scripts: ['latin'],
    variable: true,
    weights: [100, 900],
    axes: { wght: [100, 900], opsz: [14, 32] },
    roles: ['body', 'heading'],
    bestFor: 'للمقاطع اللاتينية الطويلة (مصطلحات، مراجع) داخل عرض عربي — يُضاف إلى المكدس بعد الخط العربي',
    lineHeight: 1.6,
    fallback: 'system-ui, sans-serif',
    load: () => import('@fontsource-variable/inter'),
  },

  // ——— أحادي المسافة (كود وأرقام) ———
  'jetbrains-mono': {
    id: 'jetbrains-mono',
    family: 'JetBrains Mono',
    label: 'جت برينز مونو',
    latinName: 'JetBrains Mono',
    category: 'mono',
    scripts: ['latin'],
    variable: false,
    weights: [400, 700],
    roles: ['mono'],
    bestFor: 'الافتراضي للكود والمعرّفات والأرقام (tabular) — واضح على الشاشات البعيدة',
    lineHeight: 1.6,
    fallback: MONO_FALLBACK,
    load: () =>
      Promise.all([
        import('@fontsource/jetbrains-mono/400.css'),
        import('@fontsource/jetbrains-mono/600.css'),
        import('@fontsource/jetbrains-mono/700.css'),
      ]),
  },
  'fira-code': {
    id: 'fira-code',
    family: 'Fira Code',
    label: 'فيرا كود',
    latinName: 'Fira Code',
    category: 'mono',
    scripts: ['latin'],
    variable: false,
    weights: [400, 700],
    roles: ['mono'],
    bestFor: 'كود بروابط حروف (ligatures: => !== ->) لشرائح البرمجة',
    lineHeight: 1.6,
    fallback: MONO_FALLBACK,
    load: () => Promise.all([import('@fontsource/fira-code/400.css'), import('@fontsource/fira-code/600.css')]),
  },
};

export const FONT_LIST: FontDef[] = Object.values(FONTS);

export function getFont(id: FontId): FontDef {
  return FONTS[id];
}

export function fontsByCategory(category: FontCategory): FontDef[] {
  return FONT_LIST.filter((f) => f.category === category);
}

/** مكدس CSS كامل للخط مع الاحتياطي: "'Cairo Variable', 'Segoe UI', …" */
export function fontStack(font: FontDef, latinCompanion?: FontDef): string {
  const parts = [`'${font.family}'`];
  if (latinCompanion && latinCompanion.id !== font.id) parts.push(`'${latinCompanion.family}'`);
  parts.push(font.fallback);
  return parts.join(', ');
}

/** نص اختبار (بانغرام) يستعمله مختبر الخطوط والعيّنات */
export const ARABIC_PANGRAM = 'صِف خَلقَ خَودِ كَمِثلِ الشَمسِ إِذ بَزَغَت — يَحظى الضَجيعُ بِها نَجلاءَ مِعطارِ';
export const ARABIC_SAMPLE = 'نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر ومغلف بجلد أزرق — 0123456789';
