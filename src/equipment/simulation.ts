/**
 * نماذج الإجراءات المخبرية المصغّرة — دوال نقية بلا React ولا DOM.
 *
 * الهدف: أن «تعمل» المعدات المُدرجة فعلياً داخل الشريحة (معايرة، لهب، خلط،
 * إشارة، تركيز، طرد مركزي، بوصلة، ضغط دم) بمنطق حسابي حقيقي قابل للاختبار،
 * دون صفحة مستقلة ودون مختبر محاكاة منفصل ودون أي اعتمادية جديدة.
 *
 * كل الإجراءات تعليمية مبسّطة: النتائج تُظهر الاتجاه الصحيح والعلاقات
 * الفيزيائية المعروفة، ولا تُعدّ بديلاً عن جهاز حقيقي أو معايرة مخبرية.
 */

/** نوع الإجراء التفاعلي المرتبط بأصل من الكتالوج */
export type ProcedureKind =
  | 'titration'
  | 'flame'
  | 'stir'
  | 'wave'
  | 'focus'
  | 'centrifuge'
  | 'compass'
  | 'blood-pressure';

/** تعريف إجراء: الأصل المرتبط + العنوان + التلميح + وحدة القياس المعروضة */
export interface ProcedureDef {
  assetId: string;
  kind: ProcedureKind;
  /** اسم الإجراء كما يظهر في رأس البطاقة */
  title: string;
  /** سطر إرشادي قصير */
  hint: string;
  /** وحدة القياس الأساسية (للعرض) */
  unit: string;
}

/**
 * الإجراءات المتاحة. المفاتيح هي `asset.id` نفسها، فيبقى ربط المعدة
 * بإجرائها ثابتاً مع الكتالوج المحفوظ في localStorage.
 */
export const PROCEDURES: Readonly<Record<string, ProcedureDef>> = {
  burette: {
    assetId: 'burette',
    kind: 'titration',
    title: 'معايرة حجمية',
    hint: 'أضف محلول الصودا تدريجياً حتى يتحول الفينولفثالين إلى الوردي عند نقطة التكافؤ.',
    unit: 'mL',
  },
  'bunsen-burner': {
    assetId: 'bunsen-burner',
    kind: 'flame',
    title: 'ضبط اللهب',
    hint: 'زد فتحة الهواء: يتحول اللهب من أصفر مدخّن إلى أزرق حار.',
    unit: '°C',
  },
  'magnetic-stirrer': {
    assetId: 'magnetic-stirrer',
    kind: 'stir',
    title: 'الخلط المغناطيسي',
    hint: 'ارفع سرعة المقلب تدريجياً حتى تتشكل دوّامة دون رشق السائل.',
    unit: 'rpm',
  },
  oscilloscope: {
    assetId: 'oscilloscope',
    kind: 'wave',
    title: 'قراءة الإشارة',
    hint: 'غيّر التردد والسعة وراقب الموجة وقيم الذروة إلى الذروة والدور.',
    unit: 'Hz',
  },
  microscope: {
    assetId: 'microscope',
    kind: 'focus',
    title: 'التركيز والتكبير',
    hint: 'حرّك عجلة التركيز حتى تتضح الخلايا؛ الخروج عن البؤرة يضبّب الصورة.',
    unit: '%',
  },
  centrifuge: {
    assetId: 'centrifuge',
    kind: 'centrifuge',
    title: 'الطرد المركزي',
    hint: 'زد السرعة والزمن فيترسّب الراسب في قاع الأنبوب.',
    unit: '×g',
  },
  'geological-compass': {
    assetId: 'geological-compass',
    kind: 'compass',
    title: 'قياس الاتجاه والميل',
    hint: 'أدر القرص لقراءة الاتجاه (strike) واضبط الميل (dip) للطبقة.',
    unit: '°',
  },
  'blood-pressure-monitor': {
    assetId: 'blood-pressure-monitor',
    kind: 'blood-pressure',
    title: 'قياس ضغط الدم',
    hint: 'انفخ الكُمّ ثم فرّغه ببطء: أول صوت = الانقباضي، وتوقفه = الانبساطي.',
    unit: 'mmHg',
  },
} as const;

/** عدد الإجراءات التفاعلية (يُستعمل في الوثائق والاختبارات) */
export const PROCEDURE_COUNT = Object.keys(PROCEDURES).length;

export function procedureFor(assetId: string): ProcedureDef | undefined {
  return PROCEDURES[assetId];
}

/** قصّ قيمة بين حدّين */
export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  // اللانهاية الموجبة/السالبة تُقصّ طبيعياً إلى الحدّين
  return Math.min(max, Math.max(min, value));
}

// ── المعايرة الحجمية ────────────────────────────────────────────────

/** حجم التكافؤ التعليمي: 10 mL حمض + 12.5 mL من الصودا 0.1 M */
export const TITRATION_EQUIVALENCE_ML = 12.5;
/** أقصى حجم في السحاحة */
export const TITRATION_MAX_ML = 25;

/** لون المحلول: أصفر شاحب قبل التكافؤ → برتقالي قرب النهاية → وردي بعده */
export function titrationColor(volumeMl: number, equivalenceMl = TITRATION_EQUIVALENCE_ML): string {
  const v = clampNumber(volumeMl, 0, TITRATION_MAX_ML);
  if (v < equivalenceMl - 0.3) return '#fde68a';
  if (v < equivalenceMl) return '#fdba74';
  return '#ec4899';
}

export interface TitrationReadout {
  volumeMl: number;
  equivalenceMl: number;
  color: string;
  /** الخطأ المطلق عن نقطة التكافؤ (mL) */
  errorMl: number;
  passed: boolean;
  verdict: string;
}

/** قراءة المعايرة: اللون + الخطأ + حكم تعليمي بسيط */
export function titrationReadout(
  volumeMl: number,
  equivalenceMl = TITRATION_EQUIVALENCE_ML,
): TitrationReadout {
  const v = Math.round(clampNumber(volumeMl, 0, TITRATION_MAX_ML) * 10) / 10;
  const errorMl = Math.round(Math.abs(v - equivalenceMl) * 10) / 10;
  const passed = v >= equivalenceMl;
  let verdict: string;
  if (!passed) verdict = 'لم تصل نقطة التكافؤ بعد — أضف ببطء';
  else if (errorMl <= 0.2) verdict = 'ممتاز: عند نقطة التكافؤ تقريباً';
  else if (errorMl <= 0.6) verdict = 'مقبول: تجاوزت التكافؤ قليلاً';
  else verdict = 'تجاوز كبير: أعد المعايرة';
  return { volumeMl: v, equivalenceMl, color: titrationColor(v, equivalenceMl), errorMl, passed, verdict };
}

// ── لهب البنسن ─────────────────────────────────────────────────────

export interface FlameState {
  airPercent: number;
  temperatureC: number;
  /** لون اللهب الخارجي */
  color: string;
  /** لون النواة */
  core: string;
  sooty: boolean;
  label: string;
}

/** كل زيادة في فتحة الهواء ترفع الحرارة وتبدّل اللون من أصفر إلى أزرق */
export function flameState(airPercent: number): FlameState {
  const air = Math.round(clampNumber(airPercent, 0, 100));
  const temperatureC = 700 + air * 11;
  const sooty = air < 35;
  const color = air < 20 ? '#f59e0b' : air < 55 ? '#fbbf24' : '#60a5fa';
  const core = air < 55 ? '#fef08a' : '#bfdbfe';
  const label = sooty
    ? 'لهب أصفر مدخّن — احتراق غير تام'
    : air >= 80
      ? 'لهب أزرق حار — احتراق كامل'
      : 'لهب أزرق متوسط';
  return { airPercent: air, temperatureC, color, core, sooty, label };
}

// ── المقلب المغناطيسي ───────────────────────────────────────────────

export interface StirState {
  rpm: number;
  /** عمق الدوّامة 0..1 */
  vortex: number;
  /** هل السرعة داخل المجال الآمن للكأس؟ */
  safe: boolean;
  label: string;
}

export function stirState(rpm: number): StirState {
  const value = Math.round(clampNumber(rpm, 0, 1400));
  const vortex = Math.round((value / 1400) * 100) / 100;
  const safe = value <= 1000;
  const label =
    value === 0
      ? 'متوقف'
      : !safe
        ? 'سريع جداً — خطر رشق السائل'
        : value < 150
          ? 'خلط بطيء'
          : 'خلط منتظم';
  return { rpm: value, vortex, safe, label };
}

// ── راسم الاهتزاز ───────────────────────────────────────────────────

export interface SignalInput {
  freqHz: number;
  ampV: number;
}

export interface SignalReadout {
  freqHz: number;
  ampV: number;
  /** الدور بالمللي ثانية */
  periodMs: number;
  /** الذروة إلى الذروة بالفولت */
  vpp: number;
  path: string;
}

/**
 * مسار موجة جيبية داخل شاشة 240×100. نافذة العرض 20ms، فتزداد الدورات
 * مع التردد كما في راسم حقيقي عند ثبات قاعدة الزمن.
 */
export function signalReadout({ freqHz, ampV }: SignalInput, width = 240, height = 100): SignalReadout {
  const freq = Math.round(clampNumber(freqHz, 10, 1000));
  const amp = Math.round(clampNumber(ampV, 0.5, 5) * 10) / 10;
  const cycles = clampNumber(freq * 0.02, 0.5, 10);
  const mid = height / 2;
  const peak = (amp / 5) * (height / 2 - 8);
  const steps = 96;
  let path = '';
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width;
    const y = mid - Math.sin((i / steps) * Math.PI * 2 * cycles) * peak;
    path += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return {
    freqHz: freq,
    ampV: amp,
    periodMs: Math.round((1000 / freq) * 10) / 10,
    vpp: Math.round(2 * amp * 10) / 10,
    path,
  };
}

// ── المجهر: التركيز ─────────────────────────────────────────────────

/** ضبابية الصورة بالبكسل: صفر عند البؤرة (50%) وتزداد كلما ابتعدت */
export function focusBlur(focusPercent: number): number {
  const focus = clampNumber(focusPercent, 0, 100);
  return Math.round((Math.abs(focus - 50) / 50) * 8 * 10) / 10;
}

/** وضوح الصورة 0..100% */
export function focusClarity(focusPercent: number): number {
  return Math.max(0, Math.round(100 - focusBlur(focusPercent) * 12));
}

// ── الطرد المركزي ───────────────────────────────────────────────────

/** نصف قطر الدوّار بالسنتيمتر (أنبوب قياسي) */
export const ROTOR_RADIUS_CM = 8;

/** قوة الطرد النسبية ×g من السرعة (RCF = 1.118e-5 × r × rpm²) */
export function relativeCentrifugalForce(rpm: number, radiusCm = ROTOR_RADIUS_CM): number {
  const value = clampNumber(rpm, 0, 20000);
  return Math.round(1.118e-5 * radiusCm * value * value);
}

export interface CentrifugeState {
  rpm: number;
  seconds: number;
  rcf: number;
  /** نسبة الانفصال 0..100 */
  separation: number;
  label: string;
}

export function centrifugeState(rpm: number, seconds: number): CentrifugeState {
  const r = Math.round(clampNumber(rpm, 0, 12000) / 100) * 100;
  const t = Math.round(clampNumber(seconds, 0, 120) / 5) * 5;
  const rcf = relativeCentrifugalForce(r);
  const separation = Math.round(clampNumber((rcf / 4000) * (t / 60), 0, 1) * 100);
  const label =
    separation === 0
      ? 'لا ترسّب بعد'
      : separation < 40
        ? 'ترسّب جزئي'
        : separation < 90
          ? 'ترسّب واضح'
          : 'راسب متماسك';
  return { rpm: r, seconds: t, rcf, separation, label };
}

// ── البوصلة الجيولوجية ─────────────────────────────────────────────

/** اتجاه الطبقة بصيغة righthand rule: 0..360 */
export function strikeLabel(strikeDeg: number): string {
  const s = ((Math.round(strikeDeg) % 360) + 360) % 360;
  const sectors: Array<[string, number]> = [
    ['N', 0],
    ['NE', 45],
    ['E', 90],
    ['SE', 135],
    ['S', 180],
    ['SW', 225],
    ['W', 270],
    ['NW', 315],
  ];
  let best = sectors[0];
  let bestDiff = 999;
  for (const sector of sectors) {
    const diff = Math.min(Math.abs(s - sector[1]), 360 - Math.abs(s - sector[1]));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = sector;
    }
  }
  return `${s}° (${best[0]})`;
}

export interface CompassReadout {
  strike: number;
  dip: number;
  strikeText: string;
  /** وصف تعليمي بسيط للطبقة */
  label: string;
}

export function compassReadout(strikeDeg: number, dipDeg: number): CompassReadout {
  // الاتجاه دائري: -10° = 350°، و360° = 0° (بخلاف الميل الذي يُقصّ خطياً)
  const rounded = Number.isFinite(strikeDeg) ? Math.round(strikeDeg) : 0;
  const strike = ((rounded % 360) + 360) % 360;
  const dip = Math.round(clampNumber(dipDeg, 0, 90));
  const label = dip === 0 ? 'طبقة أفقية' : dip < 30 ? 'ميل ضعيف' : dip < 60 ? 'ميل متوسط' : 'طبقة شبه عمودية';
  return { strike, dip, strikeText: strikeLabel(strike), label };
}

// ── ضغط الدم ────────────────────────────────────────────────────────

/** ضغط انقباضي/انبساطي تعليمي للمريض الافتراضي */
export const SYSTOLIC_MMHG = 120;
export const DIASTOLIC_MMHG = 80;

export type BloodPressurePhase = 'high' | 'systolic' | 'diastolic' | 'low';

export interface BloodPressureReadout {
  pressure: number;
  phase: BloodPressurePhase;
  /** هل يُسمع صوت كوروتكوف عند هذا الضغط؟ */
  pulseHeard: boolean;
  reading: string;
  label: string;
}

export function bloodPressureReadout(pressureMmHg: number): BloodPressureReadout {
  const pressure = Math.round(clampNumber(pressureMmHg, 0, 200));
  let phase: BloodPressurePhase;
  if (pressure > SYSTOLIC_MMHG) phase = 'high';
  else if (pressure >= DIASTOLIC_MMHG) phase = 'systolic';
  else if (pressure > 0) phase = 'diastolic';
  else phase = 'low';
  const pulseHeard = phase === 'systolic';
  const reading =
    pressure > SYSTOLIC_MMHG
      ? '— / —'
      : phase === 'systolic'
        ? `${SYSTOLIC_MMHG} / —`
        : `${SYSTOLIC_MMHG} / ${DIASTOLIC_MMHG}`;
  const label =
    phase === 'high'
      ? 'ضغط الكُمّ أعلى من الانقباضي: لا صوت بعد'
      : phase === 'systolic'
        ? 'أول صوت مسموع = الضغط الانقباضي'
        : phase === 'diastolic'
          ? 'توقف الصوت = الضغط الانبساطي'
          : 'الكُمّ فارغ — أعد النفخ';
  return { pressure, phase, pulseHeard, reading, label };
}
