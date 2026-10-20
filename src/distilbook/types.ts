/**
 * أنواع حزمة الموشن جرافيك البحثي — Research Distilbook Motion Graphics
 * قصة «Distilbook» في 20 ثانية: بحث ضخم ← تقطير ← أفكار ومراجع وملخصات
 * بأسلوب Showreel احترافي: كتابة حركية، 3D، Parallax، Morphing، Particles،
 * انتقالات سينمائية Slide/Zoom/Glitch، وتزامن دقيق مع الإيقاع (BeatClock)
 */

export type DistilbookSceneId =
  | 'opening'
  | 'problem'
  | 'distill'
  | 'ideas'
  | 'references'
  | 'summary'
  | 'finale';

export type DistilbookTransition = 'slide' | 'zoom' | 'glitch';

export interface DistilbookSceneSpec {
  id: DistilbookSceneId;
  /** بداية المشهد بالثواني */
  start: number;
  /** نهاية المشهد بالثواني */
  end: number;
  /** اسم المشهد بالعربية (شارة HUD) */
  title: string;
  /** وصف قصير (لوحة القصة) */
  subtitle: string;
  /** لون هوية المشهد */
  accent: string;
  /** الانتقال السينمائي الداخل إلى هذا المشهد */
  transition: DistilbookTransition;
}

/** خط القصة — 7 مشاهد / 20 ثانية */
export const DISTILBOOK_SCENES: DistilbookSceneSpec[] = [
  { id: 'opening', start: 0, end: 2.6, title: 'الافتتاح', subtitle: 'كشف العلامة بكتابة حركية وشرارات', accent: '#2dd4bf', transition: 'zoom' },
  { id: 'problem', start: 2.6, end: 5.6, title: 'المشكلة', subtitle: 'بحث من ٤٠ صفحة يهدّد بالإغراق', accent: '#fb7185', transition: 'slide' },
  { id: 'distill', start: 5.6, end: 9.2, title: 'التقطير', subtitle: 'مشهد ثلاثي الأبعاد: من الكثافة إلى النقاء', accent: '#38bdf8', transition: 'zoom' },
  { id: 'ideas', start: 9.2, end: 12.2, title: 'الأفكار', subtitle: 'كتابة حركية للأفكار المفتاحية بإيقاع النبضات', accent: '#fbbf24', transition: 'slide' },
  { id: 'references', start: 12.2, end: 14.6, title: 'المراجع', subtitle: 'شبكة استشهادات تتكوّن نبضةً نبضة', accent: '#a78bfa', transition: 'zoom' },
  { id: 'summary', start: 14.6, end: 17.4, title: 'الملخصات', subtitle: 'بطاقات منظمة بانتقالات Slide/Zoom', accent: '#34d399', transition: 'slide' },
  { id: 'finale', start: 17.4, end: 20, title: 'الختام', subtitle: 'هوية المنصة، أرقام القيمة، ودعوة التجربة', accent: '#2dd4bf', transition: 'glitch' },
];

export const DISTILBOOK_DURATION = 20;

/** إيجاد المشهد عند زمن معيّن (يقصّ إلى الحدود) */
export function sceneAt(time: number, scenes: DistilbookSceneSpec[] = DISTILBOOK_SCENES): DistilbookSceneSpec {
  const t = Math.max(0, Math.min(time, DISTILBOOK_DURATION - 0.001));
  return scenes.find((s) => t >= s.start && t < s.end) ?? scenes[scenes.length - 1];
}

export interface DistilbookStat {
  value: string;
  label: string;
}

export interface DistilbookSummaryCard {
  title: string;
  points: string[];
  source: string;
}

export interface DistilbookConfig {
  brand: string;
  tagline: string;
  bpm: number;
  loop: boolean;
  autoPlay: boolean;
  /** أرقام القيمة في الختام */
  stats: DistilbookStat[];
  /** الأفكار المفتاحية في مشهد الأفكار */
  ideas: string[];
  /** بطاقات الملخصات */
  summaryCards: DistilbookSummaryCard[];
  /** نص دعوة التجربة */
  cta: string;
}

export const DEFAULT_DISTILBOOK_CONFIG: DistilbookConfig = {
  brand: 'DISTILBOOK',
  tagline: 'قراءة أقل · فهم أعمق',
  bpm: 124,
  loop: true,
  autoPlay: true,
  stats: [
    { value: '10×', label: 'أسرع في مراجعة الأبحاث' },
    { value: '3 دقائق', label: 'لملخص كتاب كامل' },
    { value: '+120', label: 'مصدر موثّق لكل موضوع' },
  ],
  ideas: ['سؤال البحث', 'المنهجية', 'النتائج الرئيسية', 'الفجوة المعرفية', 'التوصيات'],
  summaryCards: [
    { title: 'الملخص التنفيذي', points: ['الهدف والسياق في سطور', 'أهم ٣ نتائج'], source: '٩٠ ثانية' },
    { title: 'خريطة الأفكار', points: ['أفكار مفتاحية مترابطة', 'اقتباسات موثقة المصدر'], source: 'تفاعلية' },
    { title: 'قائمة المراجع', points: ['استشهادات منظمة ومصنّفة', 'تصدير فوري'], source: 'BibTeX' },
  ],
  cta: 'جرّب Distilbook الآن',
};

/** هوية Distilbook البصرية — تُستعمل في المختبر والمشاهد */
export const DISTILBOOK_IDENTITY = {
  ink: '#020617',
  teal: '#2dd4bf',
  sky: '#38bdf8',
  amber: '#fbbf24',
  violet: '#a78bfa',
  rose: '#fb7185',
  emerald: '#34d399',
  /** عائلة العناوين من اقتران القالب */
  headingFamily: 'Cairo Variable',
} as const;

/** شبكة المراجع — عقد ووصلات لمشهد «المراجع» (SVG 400×240) */
export interface RefNode {
  x: number;
  y: number;
  r: number;
  label: string;
  center?: boolean;
}

export const REF_NODES: RefNode[] = [
  { x: 200, y: 118, r: 27, label: 'بحثك', center: true },
  { x: 82, y: 48, r: 14, label: 'مرجع ١' },
  { x: 322, y: 44, r: 12, label: 'مرجع ٢' },
  { x: 56, y: 164, r: 13, label: 'مرجع ٣' },
  { x: 344, y: 156, r: 15, label: 'مرجع ٤' },
  { x: 172, y: 208, r: 11, label: 'مرجع ٥' },
  { x: 262, y: 212, r: 12, label: 'مرجع ٦' },
];

export const REF_EDGES: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 4], [2, 6], [3, 5],
];
