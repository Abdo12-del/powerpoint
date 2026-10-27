import { Atom, Dna, FunctionSquare, Orbit } from 'lucide-react';
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
    } else {
      const amplitude = values.amplitude ?? 1.6;
      const frequency = values.frequency ?? 1.5;
      const phase = (values.phase ?? 30) * Math.PI / 180;
      y = amplitude * Math.sin(x * Math.PI * 2 * frequency + phase + time * 0.25);
      value = amplitude; label = 'السعة العظمى'; unit = 'وحدة';
      insight = `الدالة الحالية: f(x) = ${amplitude.toFixed(1)} sin(${frequency.toFixed(1)}x + ${Math.round(values.phase ?? 30)}°).`;
    }
    return { x, y };
  });
  return { value, label, unit, insight, points };
}
