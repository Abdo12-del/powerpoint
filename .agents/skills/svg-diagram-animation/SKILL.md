---
name: svg-diagram-animation
description: Animate diagrams in slides — relation/architecture diagrams, process flows, org trees, and timelines — with SVG path drawing (pathLength / stroke-dashoffset), AnimatedBeam connectors between DOM nodes, animated markers and pulses, and RTL-correct ordering. Use for the relation, process, tree and timeline archetypes or whenever boxes must be connected with animated lines/arrows. تحريك المخططات والروابط والخطوط الزمنية.
metadata:
  short-description: مخططات متحركة — خطوط تُرسم وأشعة تربط العقد
---

# تحريك المخططات (relation / process / tree / timeline)

ثلاث تقنيات تكفي 95% من الحالات. اختر واحدة لكل شريحة.

## أ) `AnimatedBeam` — شعاع بين عنصرين DOM (الأسهل والأجمل)

مناسب لمخطط المعمارية (قاعدة بيانات ↔ خادم ↔ واجهة) ولسير الإجراء. يحسب المسار من `getBoundingClientRect` فلا يهمّه RTL.

```tsx
import { useRef } from 'react';
import { AnimatedBeam } from '@/components/gallery';

function Diagram() {
  const box = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  return (
    <div ref={box} className="relative flex items-center justify-between gap-10 p-8">
      <Node ref={a}>واجهة المستخدم</Node>
      <Node ref={b}>الخادم</Node>
      <Node ref={c}>قاعدة البيانات</Node>
      <AnimatedBeam containerRef={box} fromRef={a} toRef={b} curvature={-40} duration={3} delay={0.4} gradientStartColor="#fbbf24" gradientStopColor="#38bdf8" />
      <AnimatedBeam containerRef={box} fromRef={b} toRef={c} curvature={40} duration={3} delay={0.9} reverse />
    </div>
  );
}
```
- `Node` = `forwardRef` حول `div` بـ `relative z-10` (الأشعة خلف العقد).
- `curvature` سالب = قوس للأعلى. `reverse` يعكس اتجاه التدفق. `duration` 2–4 ث هادئة؛ `repeat` افتراضي لا نهائي — مقبول كمؤثر مستمر وحيد.
- الوصفة الجاهزة: `src/recipes/RelationBeams.tsx`.

## ب) رسم مسار SVG (`pathLength`) — للخطوط الزمنية والأسهم الثابتة

```tsx
<svg viewBox="0 0 600 120" className="w-full" dir="ltr">
  <motion.line x1="580" y1="60" x2="20" y2="60" stroke="#fbbf24" strokeWidth="3"
    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
  {milestones.map((m, i) => (
    <motion.g key={m.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + i * 0.25, type: 'spring', stiffness: 300, damping: 20 }} style={{ transformOrigin: `${m.x}px 60px` }}>
      <circle cx={m.x} cy={60} r={8} fill="#0f172a" stroke="#fbbf24" strokeWidth="3" />
    </motion.g>
  ))}
</svg>
```
- **RTL**: ابدأ الخط من اليمين (`x1` كبير → `x2` صغير) ورتّب المحطات بنقصان `x`؛ ضع `dir="ltr"` على `svg` كي لا يتغيّر نظام الإحداثيات. النصوص العربية فوق المحطات في طبقة HTML (أسهل من `<text>`).
- الأسهم: `markerEnd="url(#arrow)"` مع `<marker orient="auto">`؛ مع `pathLength` يظهر الرأس مع نهاية الرسم.
- بديل GSAP: `strokeDasharray/strokeDashoffset` (انظر مهارة `gsap-react-timelines`) أو `DrawSVGPlugin`.
- الوصفة: `src/recipes/TimelineDraw.tsx`.

## ج) النبض والتدفق على روابط موجودة

للمخطط العلائقي الحالي (`RelationDiagram`) أو أي خط SVG ثابت:
```tsx
<motion.circle r={4} fill="#fbbf24" animate={{ offsetDistance: ['0%', '100%'] }} style={{ offsetPath: `path('${d}')` }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
```
أو بخط متقطع يتحرك: `strokeDasharray="6 8"` + `animate={{ strokeDashoffset: [0, -28] }}` (`repeat: Infinity, ease: 'linear', duration: 1`).

## تسلسل القراءة (مهم في RTL)

ترتيب الظهور = ترتيب الشرح: العقدة الأولى (يمين) → الرابط → العقدة التالية. لا تُظهر كل الروابط دفعة واحدة؛ `delay` تراكمي 0.3–0.5 ث لكل حافة.
في الهيكل الشجري: المستوى الأعلى أولاً ثم الأبناء من اليمين إلى اليسار؛ الروابط تُرسم من الأب إلى الابن (`pathLength`).

## الهيكل الشجري والدائري
- شجرة: `OrgTree` (النمط 4) + `pathLength` على الروابط، أو `AnimatedBeam` من الأب إلى كل ابن (`curvature: 0`).
- نظام ومكوناته حوله: `OrbitingCircles` (المعرض) بنصف قطرين (`radius={80}` و`radius={140}` مع `reverse` للثاني).

## قواعد
- مؤثر واحد مهيمن: إمّا رسم الخطوط وإمّا الأشعة المستمرة — لا كلاهما.
- الخطوط بلون واحد من لوحة الفصل (`chapter.color`) مع تدرّج خفيف؛ العقد بخلفية داكنة صلبة كي لا تمرّ الأشعة فوق النص.
- لا تتجاوز 8 عقد و10 روابط في الشريحة — قسّم المخطط على شريحتين (قاعدة فكرة واحدة).
- `prefers-reduced-motion`: أظهر المخطط كاملاً بلا رسم (`initial={false}`).
