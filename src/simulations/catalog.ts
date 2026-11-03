import { Atom, Dna, FunctionSquare, Orbit, Waves, Move3D, CircleDot, Sparkles } from 'lucide-react';
import type { SimulationDefinition, SimulationDomain, SimulationValues } from './types';

export const domains: { id: SimulationDomain; label: string; short: string }[] = [
  { id: 'physics', label: 'الفيزياء', short: 'فيزياء' },
  { id: 'chemistry', label: 'الكيمياء', short: 'كيمياء' },
  { id: 'biology', label: 'الأحياء', short: 'أحياء' },
  { id: 'mathematics', label: 'الرياضيات', short: 'رياضيات' },
];

export const simulations: SimulationDefinition[] = [
  {
    id: 'projectile', domain: 'physics', title: 'حركة المقذوفات', subtitle: 'مختبر الحركة · تجربة 01',
    description: 'غيّر سرعة الإطلاق وزاويته، ثم راقب المسار والمدى والزمن لحظياً.', accent: '#f6a96b', icon: Orbit,
    parameters: [
      { id: 'speed', label: 'سرعة الإطلاق', unit: 'م/ث', min: 8, max: 30, step: 1, initial: 20 },
      { id: 'angle', label: 'زاوية الإطلاق', unit: '°', min: 15, max: 75, step: 1, initial: 45 },
      { id: 'gravity', label: 'تسارع الجاذبية', unit: 'م/ث²', min: 3, max: 15, step: 0.1, initial: 9.8 },
    ],
  },
  {
    id: 'molecule', domain: 'chemistry', title: 'حركية التفاعل', subtitle: 'مختبر الكيمياء · تجربة 02',
    description: 'استكشف أثر الحرارة والتركيز في سرعة تصادم الجزيئات ومعدل التفاعل.', accent: '#ae9aff', icon: Atom,
    parameters: [
      { id: 'temperature', label: 'درجة الحرارة', unit: '°م', min: 10, max: 90, step: 1, initial: 35 },
      { id: 'concentration', label: 'تركيز المتفاعلات', unit: 'مول/ل', min: 0.2, max: 2, step: 0.1, initial: 1 },
      { id: 'catalyst', label: 'تركيز العامل الحفاز', unit: '%', min: 0, max: 100, step: 1, initial: 20 },
    ],
  },
  {
    id: 'cell', domain: 'biology', title: 'انتشار عبر الغشاء', subtitle: 'مختبر الأحياء · تجربة 03',
    description: 'تابع انتقال الجزيئات عبر غشاء الخلية، وعدّل فرق التركيز ونفاذية الغشاء.', accent: '#76d6b1', icon: Dna,
    parameters: [
      { id: 'gradient', label: 'فرق التركيز', unit: 'وحدة', min: 1, max: 10, step: 0.5, initial: 6 },
      { id: 'permeability', label: 'نفاذية الغشاء', unit: '%', min: 10, max: 100, step: 1, initial: 55 },
      { id: 'molecules', label: 'عدد الجزيئات', unit: 'جزيء', min: 10, max: 80, step: 1, initial: 42 },
    ],
  },
  {
    id: 'wave', domain: 'mathematics', title: 'الموجة الجيبية', subtitle: 'مختبر الرياضيات · تجربة 04',
    description: 'شكّل الدالة بتغيير السعة والتردد والطور، وشاهد أثر كل متغير على المنحنى.', accent: '#75b9ff', icon: FunctionSquare,
    parameters: [
      { id: 'amplitude', label: 'السعة', unit: 'وحدة', min: 0.5, max: 3, step: 0.1, initial: 1.6 },
      { id: 'frequency', label: 'التردد', unit: 'دورة', min: 0.5, max: 4, step: 0.1, initial: 1.5 },
      { id: 'phase', label: 'فرق الطور', unit: '°', min: 0, max: 180, step: 1, initial: 30 },
    ],
  },
  {
    id: 'lorenz', domain: 'physics', title: 'جاذب لورنز', subtitle: 'الفوضى الحتمية · BN Lab',
    description: 'غيّر معاملات نظام لورنز وتتبّع كيف تنشأ حركة حساسة للبدايات من معادلات حتمية.', accent: '#63d6c2', icon: Orbit, engine: 'bn-lab',
    parameters: [
      { id: 'rho', label: 'عدد رايلي ρ', unit: '', min: 1, max: 60, step: 0.5, initial: 28 },
      { id: 'sigma', label: 'عدد برانتل σ', unit: '', min: 1, max: 20, step: 0.5, initial: 10 },
      { id: 'beta', label: 'المعامل الهندسي β', unit: '', min: 0.5, max: 5, step: 0.05, initial: 8 / 3 },
    ],
  },
  {
    id: 'pendulum', domain: 'physics', title: 'البندول المزدوج', subtitle: 'الحركة والفوضى · BN Lab',
    description: 'كتلتان وقضيبان ومعادلات لاغرانج؛ حرّك المؤشر فوق المشهد لبدء الحركة من وضع جديد.', accent: '#ff9b79', icon: Move3D, engine: 'bn-lab',
    parameters: [
      { id: 'g', label: 'الجاذبية', unit: 'م/ث²', min: 0.1, max: 2, step: 0.05, initial: 0.6 },
      { id: 'damp', label: 'التخميد', unit: '', min: 0.99, max: 1, step: 0.0005, initial: 0.9999 },
      { id: 'm2', label: 'كتلة الجسم السفلي', unit: 'وحدة', min: 1, max: 40, step: 1, initial: 10 },
    ],
  },
  {
    id: 'doubleslit', domain: 'physics', title: 'تجربة الشقين', subtitle: 'التداخل والقياس · BN Lab',
    description: 'راقب نمط التداخل، ثم غيّر إعداد الكاشف لمقارنة أثر معرفة المسار على الأهداب.', accent: '#c7a0ff', icon: Waves, engine: 'bn-lab',
    parameters: [
      { id: 'watch', label: 'كاشف عند الشقين', unit: '', min: 0, max: 1, step: 1, initial: 0 },
      { id: 'eff', label: 'دقة الكاشف', unit: '', min: 0, max: 1, step: 0.01, initial: 1 },
      { id: 'sep', label: 'المسافة بين الشقين', unit: 'px', min: 20, max: 140, step: 2, initial: 62 },
      { id: 'lam', label: 'الطول الموجي', unit: 'px', min: 8, max: 40, step: 1, initial: 18 },
    ],
  },
  {
    id: 'grayscott', domain: 'chemistry', title: 'أنماط التفاعل والانتشار', subtitle: 'التفاعلات الكيميائية · BN Lab',
    description: 'عدّل معدلات التغذية والإزالة وشاهد ظهور البقع والخطوط من معادلات Gray–Scott.', accent: '#92dc91', icon: Atom, engine: 'bn-lab',
    parameters: [
      { id: 'F', label: 'معدل التغذية F', unit: '', min: 0.01, max: 0.08, step: 0.001, initial: 0.037 },
      { id: 'k', label: 'معدل الإزالة k', unit: '', min: 0.045, max: 0.07, step: 0.0005, initial: 0.06 },
      { id: 'it', label: 'خطوات حسابية/إطار', unit: '', min: 1, max: 14, step: 1, initial: 6 },
    ],
  },
  {
    id: 'chladni', domain: 'mathematics', title: 'أشكال كلادني', subtitle: 'الموجات والأنماط · BN Lab',
    description: 'غيّر أرقام الأنماط لرؤية العقد التي تتجمع عندها الحبيبات على صفيحة مهتزة.', accent: '#f3d174', icon: Waves, engine: 'bn-lab',
    parameters: [
      { id: 'm', label: 'النمط m', unit: '', min: 1, max: 9, step: 1, initial: 3 },
      { id: 'n', label: 'النمط n', unit: '', min: 1, max: 9, step: 1, initial: 5 },
      { id: 'grain', label: 'عدد الحبيبات', unit: '', min: 400, max: 6000, step: 100, initial: 2600 },
    ],
  },
  {
    id: 'kepler', domain: 'physics', title: 'مدارات كبلر', subtitle: 'الجاذبية والمدارات · BN Lab',
    description: 'استكشف أثر الشذوذ المداري وعدد الكواكب واضطراب الكتلة في حركة المدارات.', accent: '#7bc8ff', icon: Orbit, engine: 'bn-lab',
    parameters: [
      { id: 'ecc', label: 'الشذوذ المداري', unit: '', min: 0, max: 0.9, step: 0.01, initial: 0.55 },
      { id: 'planets', label: 'عدد الكواكب', unit: '', min: 1, max: 6, step: 1, initial: 3 },
      { id: 'perturb', label: 'كتلة المؤشر', unit: 'وحدة', min: 0, max: 4000, step: 100, initial: 900 },
    ],
  },
  {
    id: 'collision', domain: 'physics', title: 'تصادم الأجسام', subtitle: 'ميكانيكا ثنائية الأبعاد · Matter.js',
    description: 'راقب انتقال الحركة في تصادمات أجسام صلبة ثنائية الأبعاد، وعدّل الجاذبية والارتداد والزمن.', accent: '#ffb36b', icon: CircleDot, engine: 'matter-js',
    parameters: [
      { id: 'gravity', label: 'الجاذبية', unit: 'نسبي', min: 0, max: 2, step: 0.05, initial: 0.8 },
      { id: 'restitution', label: 'معامل الارتداد', unit: '', min: 0, max: 1, step: 0.05, initial: 0.82 },
      { id: 'speed', label: 'سرعة الزمن', unit: '×', min: 0.5, max: 2, step: 0.1, initial: 1 },
    ],
  },
  {
    id: 'interference', domain: 'mathematics', title: 'تداخل الموجات', subtitle: 'موجات ثنائية الأبعاد · p5.js',
    description: 'غيّر طول الموجة وعدد المصادر وسرعتها لرؤية جبهات التداخل في مشهد 2D.', accent: '#88c9ff', icon: Sparkles, engine: 'p5',
    parameters: [
      { id: 'lambda', label: 'الطول الموجي', unit: 'px', min: 12, max: 70, step: 1, initial: 34 },
      { id: 'sources', label: 'عدد المصادر', unit: '', min: 2, max: 5, step: 1, initial: 2 },
      { id: 'speed', label: 'سرعة الانتشار', unit: '×', min: 0, max: 4, step: 0.1, initial: 2.2 },
    ],
  },
];

export function initialValues(definition: SimulationDefinition): SimulationValues {
  return Object.fromEntries(definition.parameters.map((parameter) => [parameter.id, parameter.initial]));
}

export function calculateResult(id: SimulationDefinition['id'], values: SimulationValues, time: number) {
  const count = 80;
  let value = 0;
  let label = '';
  let unit = '';
  let insight = '';
  const points = Array.from({ length: count }, (_, index) => {
    const x = index / (count - 1);
    let y = 0;
    if (id === 'projectile') {
      const speed = values.speed ?? 20;
      const angle = (values.angle ?? 45) * Math.PI / 180;
      const gravity = values.gravity ?? 9.8;
      const totalTime = (2 * speed * Math.sin(angle)) / gravity;
      const t = x * totalTime;
      y = Math.max(0, speed * Math.sin(angle) * t - 0.5 * gravity * t * t);
      value = (speed * speed * Math.sin(2 * angle)) / gravity;
      label = 'المدى الأفقي'; unit = 'م';
      insight = `يقطع المقذوف ${value.toFixed(1)} متر قبل ملامسة الأرض.`;
    } else if (id === 'molecule') {
      const temp = values.temperature ?? 35;
      const concentration = values.concentration ?? 1;
      const catalyst = values.catalyst ?? 20;
      const rate = Math.exp((temp - 35) / 55) * concentration * (1 + catalyst / 100);
      y = 100 * (1 - Math.exp(-rate * x * 0.8));
      value = rate; label = 'سرعة التفاعل'; unit = 'نسبي';
      insight = `يزداد معدل التفاعل مع الحرارة والتركيز؛ وصلت المحاكاة إلى ${Math.round(y)}٪ من الناتج.`;
    } else if (id === 'cell') {
      const gradient = values.gradient ?? 6;
      const permeability = values.permeability ?? 55;
      const flux = gradient * permeability / 100;
      y = 100 * (1 - Math.exp(-flux * x / 3));
      value = flux; label = 'معدل الانتشار'; unit = 'نسبي';
      insight = `فرق التركيز يدفع الجزيئات نحو الاتزان عبر الغشاء شبه المنفذ.`;
    } else if (id === 'wave') {
      const amplitude = values.amplitude ?? 1.6;
      const frequency = values.frequency ?? 1.5;
      const phase = (values.phase ?? 30) * Math.PI / 180;
      y = amplitude * Math.sin(x * Math.PI * 2 * frequency + phase + time * 0.25);
      value = amplitude; label = 'السعة العظمى'; unit = 'وحدة';
      insight = `الدالة الحالية: f(x) = ${amplitude.toFixed(1)} sin(${frequency.toFixed(1)}x + ${Math.round(values.phase ?? 30)}°).`;
    } else {
      value = Object.values(values)[0] ?? 0;
      y = Math.sin(x * Math.PI * 2 + time) * value;
      label = 'قيمة المتغير';
      unit = '';
      insight = 'تعمل التجربة في محرك تفاعلي ثنائي الأبعاد؛ راقب أثر المتغيرات مباشرة على المشهد.';
    }
    return { x, y };
  });
  return { value, label, unit, insight, points };
}
