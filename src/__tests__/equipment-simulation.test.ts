import { describe, expect, it } from 'vitest';
import { EQUIPMENT, assetById } from '@/equipment/catalog';
import {
  PH_SAMPLES,
  PROCEDURES,
  PROCEDURE_COUNT,
  autoclaveReadout,
  balanceReadout,
  bloodPressureReadout,
  centrifugeState,
  clampNumber,
  compassReadout,
  flameState,
  focusBlur,
  focusClarity,
  incubatorReadout,
  phReadout,
  phSample,
  procedureFor,
  relativeCentrifugalForce,
  signalReadout,
  stirState,
  strikeLabel,
  titrationColor,
  titrationReadout,
  DIASTOLIC_MMHG,
  SYSTOLIC_MMHG,
  TITRATION_EQUIVALENCE_ML,
} from '@/equipment/simulation';

describe('الإجراءات المخبرية المصغّرة — النماذج الحسابية', () => {
  it('تعريف الإجراءات: 8 إجراءات مرتبطة بأصول موجودة فعلاً في الكتالوج', () => {
    expect(PROCEDURE_COUNT).toBe(12);
    expect(Object.keys(PROCEDURES)).toHaveLength(12);
    for (const [assetId, procedure] of Object.entries(PROCEDURES)) {
      expect(procedure.assetId).toBe(assetId);
      const asset = assetById(assetId);
      expect(asset).toBeDefined();
      expect(procedureFor(assetId)).toBe(procedure);
      expect(procedure.title.trim().length).toBeGreaterThan(0);
      expect(procedure.hint.trim().length).toBeGreaterThan(0);
      expect(procedure.unit.trim().length).toBeGreaterThan(0);
    }
    expect(procedureFor('beaker')).toBeUndefined();
    expect(procedureFor('unknown-asset')).toBeUndefined();
  });

  it('تغطي الإجراءات مجالات LMD العلمية الخمسة (D02/D04/D05/D15)', () => {
    const categories = new Set(
      Object.keys(PROCEDURES)
        .map((id) => assetById(id)?.category)
        .filter(Boolean),
    );
    for (const required of ['chemistry', 'physics', 'biology', 'geology', 'health']) {
      expect(categories.has(required as never)).toBe(true);
    }
    // كل الإجراءات مرتبطة بأصول موجودة في الحزمة (لا معرّفات شبحية)
    const ids = new Set(EQUIPMENT.map((asset) => asset.id));
    for (const assetId of Object.keys(PROCEDURES)) expect(ids.has(assetId)).toBe(true);
  });

  it('المعايرة: اللون يتحول عند نقطة التكافؤ والخطأ يُحسب بدقة', () => {
    expect(titrationColor(0)).toBe('#fde68a');
    expect(titrationColor(TITRATION_EQUIVALENCE_ML - 1)).toBe('#fde68a');
    expect(titrationColor(TITRATION_EQUIVALENCE_ML)).toBe('#ec4899');
    expect(titrationColor(25)).toBe('#ec4899');

    const atEquivalence = titrationReadout(TITRATION_EQUIVALENCE_ML);
    expect(atEquivalence.passed).toBe(true);
    expect(atEquivalence.errorMl).toBe(0);
    expect(atEquivalence.verdict).toContain('ممتاز');

    const before = titrationReadout(8);
    expect(before.passed).toBe(false);
    expect(before.verdict).toContain('لم تصل');
    expect(before.errorMl).toBeCloseTo(4.5);

    const far = titrationReadout(30); // قصّ إلى 25 mL
    expect(far.volumeMl).toBe(25);
    expect(far.verdict).toContain('تجاوز كبير');
  });

  it('لهب البنسن: الحرارة تتصاعد مع الهواء ويتحول اللون إلى أزرق', () => {
    const low = flameState(0);
    const high = flameState(100);
    expect(low.temperatureC).toBeLessThan(high.temperatureC);
    expect(low.sooty).toBe(true);
    expect(high.sooty).toBe(false);
    expect(low.color).toBe('#f59e0b');
    expect(high.color).toBe('#60a5fa');
    expect(flameState(60).label).toContain('أزرق');
  });

  it('المقلب المغناطيسي: الدوّامة مرتبطة بالسرعة وتحذير عند تجاوز المجال الآمن', () => {
    expect(stirState(0).vortex).toBe(0);
    expect(stirState(700).vortex).toBeCloseTo(0.5, 2);
    expect(stirState(700).safe).toBe(true);
    expect(stirState(1400).safe).toBe(false);
    expect(stirState(1400).label).toContain('خطر');
    expect(stirState(-50).rpm).toBe(0);
  });

  it('راسم الاهتزاز: الدور والذروة إلى الذروة ومسار الموجة', () => {
    const signal = signalReadout({ freqHz: 100, ampV: 2 });
    expect(signal.periodMs).toBe(10);
    expect(signal.vpp).toBe(4);
    expect(signal.path.startsWith('M')).toBe(true);
    expect(signal.path).toContain('L');
    expect(signal.path.split('L')).toHaveLength(97); // 96 خطوة
    // تردد أعلى ⇒ دور أقصر، وذروة أعلى ⇒ Vpp أكبر
    expect(signalReadout({ freqHz: 500, ampV: 2 }).periodMs).toBeLessThan(signal.periodMs);
    expect(signalReadout({ freqHz: 100, ampV: 5 }).vpp).toBe(10);
    // قصّ الحدود
    expect(signalReadout({ freqHz: 0, ampV: 0 }).freqHz).toBe(10);
    expect(signalReadout({ freqHz: 5000, ampV: 9 }).ampV).toBe(5);
  });

  it('المجهر: البؤرة عند 50% والضبابية تتناقص مع الاقتراب', () => {
    expect(focusBlur(50)).toBe(0);
    expect(focusClarity(50)).toBe(100);
    expect(focusBlur(0)).toBe(8);
    expect(focusBlur(100)).toBe(8);
    expect(focusClarity(45)).toBeGreaterThan(focusClarity(20));
  });

  it('الطرد المركزي: RCF والنسبة المئوية للانفصال', () => {
    expect(relativeCentrifugalForce(0)).toBe(0);
    // 6000 rpm على نصف قطر 8cm ≈ 3220 ×g
    expect(relativeCentrifugalForce(6000)).toBe(3220);
    expect(centrifugeState(0, 60).separation).toBe(0);
    expect(centrifugeState(6000, 0).separation).toBe(0);
    expect(centrifugeState(6000, 120).separation).toBe(100); // سقف 100%
    expect(centrifugeState(6000, 30).separation).toBeGreaterThan(0);
    expect(centrifugeState(6000, 30).label).toContain('ترسّب');
  });

  it('البوصلة الجيولوجية: الاتجاه بالربع والميل', () => {
    expect(strikeLabel(0)).toContain('N');
    expect(strikeLabel(45)).toContain('NE');
    expect(strikeLabel(90)).toContain('E');
    expect(strikeLabel(360)).toContain('0°');
    const read = compassReadout(135, 45);
    expect(read.strike).toBe(135);
    expect(read.strikeText).toContain('SE');
    expect(read.dip).toBe(45);
    expect(read.label).toContain('متوسط');
    expect(compassReadout(200, 0).label).toContain('أفقية');
    expect(compassReadout(200, 90).label).toContain('عمودية');
    expect(compassReadout(-10, 120).strike).toBe(350);
    expect(compassReadout(-10, 120).dip).toBe(90);
  });

  it('ضغط الدم: مراحل التفريغ والصوت الانقباضي/الانبساطي', () => {
    const high = bloodPressureReadout(180);
    expect(high.phase).toBe('high');
    expect(high.pulseHeard).toBe(false);
    expect(high.reading).toBe('— / —');

    const systolic = bloodPressureReadout(SYSTOLIC_MMHG);
    expect(systolic.phase).toBe('systolic');
    expect(systolic.pulseHeard).toBe(true);
    expect(systolic.reading).toBe(`${SYSTOLIC_MMHG} / —`);

    const between = bloodPressureReadout(100);
    expect(between.pulseHeard).toBe(true);

    const diastolic = bloodPressureReadout(DIASTOLIC_MMHG - 5);
    expect(diastolic.phase).toBe('diastolic');
    expect(diastolic.pulseHeard).toBe(false);
    expect(diastolic.reading).toBe(`${SYSTOLIC_MMHG} / ${DIASTOLIC_MMHG}`);

    expect(bloodPressureReadout(0).phase).toBe('low');
    expect(bloodPressureReadout(500).pressure).toBe(200);
  });

  it('مقياس pH: ثلاث عينات قياسية وتصنيف صحيح للوسط', () => {
    expect(PH_SAMPLES).toHaveLength(3);
    expect(phSample('acid').ph).toBe(2);
    expect(phSample('water').ph).toBe(7);
    expect(phSample('base').ph).toBe(12);
    expect(phSample('unknown').id).toBe('water'); // احتياط آمن

    const acid = phReadout(2);
    expect(acid.nature).toBe('حمضي');
    expect(acid.color).toBe('#ef4444');
    expect(acid.label).toContain('H₃O⁺');

    expect(phReadout(7).nature).toBe('معتدل');
    const base = phReadout(12);
    expect(base.nature).toBe('قاعدي');
    expect(base.label).toContain('OH⁻');
    expect(phReadout(7.2).nature).toBe('معتدل');
    expect(phReadout(20).ph).toBe(14); // قصّ
  });

  it('الميزان التحليلي: تصفير وكتلة صافية بدقة 0.1 mg وسعة', () => {
    const raw = balanceReadout(12.5);
    expect(raw.netG).toBe(12.5);
    expect(raw.display).toBe('12.5000 g');
    expect(raw.stable).toBe(false);

    const tared = balanceReadout(12.5, 12.5);
    expect(tared.netG).toBe(0);
    expect(tared.stable).toBe(true);
    expect(tared.label).toContain('صفر');

    const net = balanceReadout(30.25, 10);
    expect(net.netG).toBe(20.25);
    expect(net.display).toBe('20.2500 g');

    const over = balanceReadout(200);
    expect(over.overCapacity).toBe(true);
    expect(over.sampleG).toBe(120);
    expect(over.label).toContain('تجاوز');
  });

  it('الحاضنة: النمو الأمثل عند 37°C بعد 24 ساعة', () => {
    const optimal = incubatorReadout(37, 24);
    expect(optimal.growth).toBe(100);
    expect(optimal.optimal).toBe(true);
    expect(optimal.label).toBe('نمو ممتاز');

    expect(incubatorReadout(37, 0).growth).toBe(0);
    expect(incubatorReadout(25, 24).growth).toBeLessThan(optimal.growth);
    expect(incubatorReadout(37, 12).growth).toBe(50);
    expect(incubatorReadout(45, 24).label).toBe('نمو ضعيف');
    expect(incubatorReadout(37, 200).hours).toBe(72);
  });

  it('الأوتوكلاف: التعقيم الكامل عند 121°C و15 دقيقة', () => {
    const sterile = autoclaveReadout(121, 15);
    expect(sterile.sterile).toBe(true);
    expect(sterile.label).toContain('تعقيم كامل');
    expect(sterile.pressureBar).toBeCloseTo(1.5, 2);

    expect(autoclaveReadout(110, 30).sterile).toBe(false);
    expect(autoclaveReadout(110, 30).label).toContain('أقل من 121');
    expect(autoclaveReadout(121, 5).sterile).toBe(false);
    expect(autoclaveReadout(121, 5).label).toContain('الزمن');
    expect(autoclaveReadout(134, 60).sterile).toBe(true);
    expect(autoclaveReadout(200, 90).tempC).toBe(134);
  });

  it('قصّ الأرقام يتحمّل القيم غير الصالحة', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-5, 0, 10)).toBe(0);
    expect(clampNumber(50, 0, 10)).toBe(10);
    expect(clampNumber(Number.NaN, 0, 10)).toBe(0);
    expect(clampNumber(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
  });
});
