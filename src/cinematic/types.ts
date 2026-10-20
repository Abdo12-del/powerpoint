/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  حزمة العرض السينمائي ثلاثي الأبعاد — الأنواع والعقود        ║
 * ║  3D Website Flyover & Cinematic Showreel — Types             ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * يغطي كل ما وصفته المواصفة:
 *  - تثبيت أبعاد الصفحة
 *  - مسار كاميرا دقيق + سرعة + عمق
 *  - تأثيرات DoF / Parallax / رفع البطاقات / إضاءة وظلال
 *  - بطاقة ختامية سينمائية
 *  - معاينة الإطارات عند نقاط زمنية محددة
 */

// ──────────────────────────────────────────────────────────
// 1. تثبيت أبعاد الصفحة — يمنع التذبذب أثناء الطيران
// ──────────────────────────────────────────────────────────
export interface PageDimensions {
  /** عرض الصفحة بالبكسل (الافتراضي 1440) */
  width: number;
  /** ارتفاع الصفحة بالبكسل (الافتراضي 900) */
  height: number;
  /** نسبة البكسل للجهاز — مثبّتة لضمان حدة اللقطة (الافتراضي 1) */
  devicePixelRatio: number;
  /** هل نملأ الحاوية مع الحفاظ على النسبة (letterbox)؟ */
  letterbox: boolean;
}

export const DEFAULT_PAGE_DIMENSIONS: PageDimensions = {
  width: 1440,
  height: 900,
  devicePixelRatio: 1,
  letterbox: true,
};

// ──────────────────────────────────────────────────────────
// 2. الطبقات المُلتقطة عبر Playwright
// ──────────────────────────────────────────────────────────
export type CaptureLayerKind = 'page' | 'hero' | 'card' | 'image' | 'logo' | 'background';

export interface CaptureLayer {
  /** معرف فريد */
  id: string;
  /** نوع الطبقة */
  kind: CaptureLayerKind;
  /** مصدر الصورة — data URL أو URL */
  src: string;
  /** موضع الطبقة في تخطيط الصفحة الأصلية (بالبكسل، ضمن PageDimensions) */
  bounds: { x: number; y: number; width: number; height: number };
  /** عمق الطبقة (Z) — 0 = الخلفية، 1 = المقدمة */
  depth: number;
  /** هل هذه الطبقة قابلة للرفع (بطاقة/صورة/شعار)؟ */
  liftable: boolean;
  /** زاوية ميل افتراضية (اختيارية) */
  tilt?: { rx: number; ry: number };
  /** شفافية */
  opacity?: number;
  /** نص بديل */
  alt?: string;
}

export interface CaptureResult {
  /** أبعاد الصفحة المثبتة وقت الالتقاط */
  dimensions: PageDimensions;
  /** لقطة الصفحة الكاملة (خلفية) */
  fullPageSrc?: string;
  /** الطبقات المفصلة */
  layers: CaptureLayer[];
  /** تاريخ الالتقاط */
  capturedAt: string;
  /** رابط الصفحة المصدر */
  url?: string;
}

// ──────────────────────────────────────────────────────────
// 3. الكاميرا — مسار دقيق وتحكم كامل
// ──────────────────────────────────────────────────────────
export interface CameraKeyframe {
  /** الزمن المُعيَّر 0..1 (0 = البداية، 1 = بطاقة الختام) */
  t: number;
  /** موضع الكاميرا [x, y, z] — الوحدات: نسبة من أبعاد المشهد */
  position: [number, number, number];
  /** نقطة النظر [x, y, z] */
  target: [number, number, number];
  /** زاوية الرؤية بالدرجات */
  fov?: number;
  /** دوران حول المحور Z (درجات) — للتمايل السينمائي */
  roll?: number;
  /** سرعة نسبية عند هذه النقطة (1 = عادية) */
  speed?: number;
}

export type CameraPathPreset =
  | 'flyover' // تحليق أمامي كلاسيكي (الأرض → القمة)
  | 'orbit' // دوران 360° حول المركز
  | 'dolly' // اقتراب/ابتعاد مستقيم
  | 'crane' // حركة رافعة عمودية
  | 'lateral' // انزلاق جانبي
  | 'custom';

export interface CameraPathConfig {
  /** نوع المسار الجاهز (أو مخصص) */
  preset: CameraPathPreset;
  /** نقاط التحكم — إن تُركت فارغة يُولَّد مسار افتراضي حسب preset */
  keyframes: CameraKeyframe[];
  /** دالة التخفيف: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut' | 'cinematic' */
  easing: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut' | 'cinematic';
  /** هل الكاميرا متحركة باستمرار (تحليق متواصل)؟ */
  continuous: boolean;
  /** اهتزاز دقيق (micro-jitter) لمظهر الكاميرا المحمولة */
  handheld?: { amount: number; frequency: number };
}

export const DEFAULT_CAMERA_PATH: CameraPathConfig = {
  preset: 'flyover',
  easing: 'cinematic',
  continuous: true,
  keyframes: [
    { t: 0, position: [0, 1.08, 3.75], target: [0, 0, 0], fov: 42 },
    { t: 0.18, position: [0.45, 0.98, 3.55], target: [0, -0.04, 0], fov: 41 },
    { t: 0.38, position: [-0.4, 0.78, 3.35], target: [0, -0.12, 0], fov: 41 },
    { t: 0.62, position: [0.34, 0.82, 3.5], target: [0, -0.16, 0], fov: 41 },
    { t: 0.82, position: [-0.18, 0.66, 3.25], target: [0, -0.24, 0], fov: 40 },
    { t: 1, position: [0, 0.5, 3.05], target: [0, -0.3, 0], fov: 40 },
  ],
};

// ──────────────────────────────────────────────────────────
// 4. العمق والتأثيرات
// ──────────────────────────────────────────────────────────
export interface DepthConfig {
  /** مقياس العمق العام (0..2) — 1 = طبيعي */
  scale: number;
  /** قوة المنظور (perspective) */
  perspective: number;
  /** مدى العمق بين الخلفية والمقدمة */
  range: number;
  /** قوة الـ parallax عند تحريك الكاميرا (0..1) */
  parallaxStrength: number;
  /** ارتفاع البطاقات/الصور عند الرفع (بالبكسل ثلاثي الأبعاد) */
  cardLift: number;
  /** دوران البطاقات عند الرفع */
  cardTilt: number;
  /** تأخير الرفع بين البطاقات (stagger) بالثواني */
  cardStagger: number;
}

export interface DepthOfFieldConfig {
  /** مفعّل؟ */
  enabled: boolean;
  /** مسافة التركيز (0..1، نسبة من العمق) */
  focusDistance: number;
  /** نطاق التركيز (أوسع = منطقة أوضح) */
  focusRange: number;
  /** شدة الضبابية خارج التركيز (0..1) */
  intensity: number;
  /** نصف قطر التشويش الأقصى (بكسل) */
  maxBlur: number;
}

export interface LightingConfig {
  /** إضاءة محيطة */
  ambient: { intensity: number; color: string };
  /** إضاءة اتجاهية رئيسية */
  directional: { intensity: number; color: string; direction: [number, number, number] };
  /** إضاءة تكميلية */
  fill: { intensity: number; color: string };
  /** ظلال ناعمة */
  softShadows: boolean;
  /** قتامة الظل (0..1) */
  shadowDarkness: number;
  /** تشويش الظل (blur) */
  shadowBlur: number;
}

export const DEFAULT_DEPTH: DepthConfig = {
  scale: 1,
  perspective: 900,
  // مدى عمق هادئ: يبقي الصفحة مقروءة كصفحة واحدة مع فصل واضح للطبقات
  range: 0.72,
  parallaxStrength: 0.5,
  cardLift: 26,
  cardTilt: 4,
  cardStagger: 0.08,
};

export const DEFAULT_DOF: DepthOfFieldConfig = {
  enabled: true,
  focusDistance: 0.52,
  // نطاق واسع نسبياً: الصفحة تبقى مقروءة، والضبابية تبقى للخلفية والشعارات القريبة
  focusRange: 0.42,
  intensity: 0.5,
  maxBlur: 9,
};

export const DEFAULT_LIGHTING: LightingConfig = {
  ambient: { intensity: 0.58, color: '#ffffff' },
  directional: { intensity: 0.82, color: '#fff7ed', direction: [-0.6, 1, 0.8] },
  fill: { intensity: 0.26, color: '#e0e7ff' },
  softShadows: true,
  shadowDarkness: 0.35,
  shadowBlur: 16,
};

// ──────────────────────────────────────────────────────────
// 5. البطاقة الختامية
// ──────────────────────────────────────────────────────────
export interface FinalCardConfig {
  /** اسم العلامة */
  brand: string;
  /** عبارة متحركة (سطر أو سطران) */
  tagline: string;
  /** شعار (URL أو data URL) */
  logoSrc?: string;
  /** لون الخلفية/التدرج */
  background?: string;
  /** تأثير الانتقال: 'zoom' | 'fade' | 'parallax' | 'reveal' */
  transition: 'zoom' | 'fade' | 'parallax' | 'reveal';
  /** مدة الانتقال بالثواني */
  transitionDuration: number;
  /** هل العبارة تُكتب تدريجياً (typewriter)؟ */
  typewriter?: boolean;
}

export const DEFAULT_FINAL_CARD: FinalCardConfig = {
  brand: 'علامتك التجارية',
  tagline: 'نحو مستقبلٍ تصنعه أفكارك',
  transition: 'parallax',
  transitionDuration: 1.2,
  typewriter: true,
};

// ──────────────────────────────────────────────────────────
// 6. حزمة الإعدادات الكاملة
// ──────────────────────────────────────────────────────────
export interface FlyoverSpeedConfig {
  /** المدة الكلية بالثواني (الافتراضي 18) */
  duration: number;
  /** مضاعف السرعة (1 = طبيعي، 0.5 = بطيء، 2 = سريع) */
  multiplier: number;
  /** إيقاف مؤقت عند نقاط محددة (ثوانٍ) */
  pauses?: { at: number; for: number }[];
}

export interface FlyoverConfig {
  /** أبعاد الصفحة المثبتة */
  dimensions: PageDimensions;
  /** مسار الكاميرا */
  camera: CameraPathConfig;
  /** العمق */
  depth: DepthConfig;
  /** عمق الميدان */
  dof: DepthOfFieldConfig;
  /** الإضاءة والظلال */
  lighting: LightingConfig;
  /** البطاقة الختامية */
  finalCard: FinalCardConfig;
  /** السرعة والزمن */
  speed: FlyoverSpeedConfig;
  /** هل نُشغّل تلقائياً؟ */
  autoplay: boolean;
  /** هل نُكرّر؟ (loop) */
  loop: boolean;
  /** احترام prefers-reduced-motion (يقلل الحركة والضبابية) */
  respectReducedMotion: boolean;
  /** نقاط زمنية لمعاينة الإطارات (ثوانٍ) */
  previewTimes?: number[];
}

export const DEFAULT_FLYOVER_CONFIG: FlyoverConfig = {
  dimensions: DEFAULT_PAGE_DIMENSIONS,
  camera: DEFAULT_CAMERA_PATH,
  depth: DEFAULT_DEPTH,
  dof: DEFAULT_DOF,
  lighting: DEFAULT_LIGHTING,
  finalCard: DEFAULT_FINAL_CARD,
  speed: { duration: 18, multiplier: 1 },
  autoplay: true,
  loop: false,
  respectReducedMotion: true,
};

// ──────────────────────────────────────────────────────────
// 7. إطارات ومعاينة
// ──────────────────────────────────────────────────────────
export interface FramePreview {
  /** الزمن بالثواني */
  time: number;
  /** الزمن المعيّر 0..1 */
  t: number;
  /** بيانات الصورة (data URL) — تُملأ بعد الالتقاط */
  dataUrl?: string;
  /** اسم الإطار (اختياري) */
  label?: string;
}

export interface FlyoverTimeline {
  /** الزمن الحالي (ثوانٍ) */
  currentTime: number;
  /** الزمن المعيّر 0..1 */
  t: number;
  /** هل يُعرض مشهد الطيران أم البطاقة الختامية؟ */
  phase: 'flyover' | 'transition' | 'final';
  /** هل التشغيل نشط؟ */
  playing: boolean;
  /** نسبة اكتمال الطيران (0..1) */
  progress: number;
}

// ──────────────────────────────────────────────────────────
// 8. أحداث
// ──────────────────────────────────────────────────────────
export type FlyoverEvent =
  | { type: 'timeupdate'; time: number; t: number }
  | { type: 'phasechange'; phase: FlyoverTimeline['phase'] }
  | { type: 'ended' }
  | { type: 'framepreview'; frame: FramePreview };

// ──────────────────────────────────────────────────────────
// 9. واجهة أمر التحكم (imperative handle)
// ──────────────────────────────────────────────────────────
export interface FlyoverHandle {
  /** الانتقال إلى زمن محدد (ثوانٍ) — للمعاينة الدقيقة */
  seekTo: (time: number) => void;
  /** الانتقال إلى زمن معيّر 0..1 */
  seekT: (t: number) => void;
  /** تشغيل */
  play: () => void;
  /** إيقاف مؤقت */
  pause: () => void;
  /** تبديل التشغيل */
  toggle: () => void;
  /** إعادة من البداية */
  restart: () => void;
  /** التقاط إطار حالي كـ data URL */
  captureFrame: () => string | undefined;
  /** الحصول على بيانات الإطار عند زمن محدد (يُصيّر الإطار دون تشغيل) — maxWidth للتصغير */
  getFrameAt: (time: number, maxWidth?: number) => Promise<string>;
  /** معلومات الخط الزمني الحالية */
  getTimeline: () => FlyoverTimeline;
  /** canvas الأساسي */
  canvas: HTMLCanvasElement | null;
  /** هل انتهت تهيئة المشهد والطبقات؟ */
  readonly isReady: boolean;
}
