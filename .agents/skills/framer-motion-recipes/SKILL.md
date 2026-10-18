---
name: framer-motion-recipes
description: framer-motion (motion) patterns used by this presentation template — variants and stagger, AnimatePresence, layout animations, animate() counters, SVG pathLength draw-on, useInView, useReducedMotion, and the shared tokens in src/components/ui/motion.ts. Use when adding or tuning enter/exit/hover animations in a slide, or when extending an archetype with motion. وصفات framer-motion للشرائح.
metadata:
  short-description: framer-motion — variants وstagger وpathLength داخل الشرائح
---

# framer-motion في هذا القالب

الحزمة: `framer-motion@12` (نفس `motion/react`). الرموز المشتركة في `src/components/ui/motion.ts`:
`fadeUp`, `popIn`, `staggerContainer(stagger, delayChildren)`, `screenVariants`. المكونات الجاهزة: `Stagger` (حاوية stagger)، `WordReveal` (كلمات)، `Card` (بطاقة بحركة دخول وتحويم).

```tsx
import { motion, AnimatePresence, animate, useInView, useReducedMotion } from 'framer-motion';
import { fadeUp, popIn, staggerContainer } from '@/components/ui/motion';
import { Stagger, WordReveal, Card } from '@/components/ui';
```

## 1. stagger بالمتغيرات (النمط الأكثر استعمالاً)

```tsx
<motion.ul variants={staggerContainer(0.08, 0.2)} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
  {items.map((it) => (
    <motion.li key={it.id} variants={fadeUp}>…</motion.li>
  ))}
</motion.ul>
```
- الأبناء يرثون `initial/animate` من الحاوية؛ لا تكرّرها عليهم.
- `fadeUp` يُحرّك `y` و`opacity` فقط (آمن للأداء).

## 2. WordReveal — نص عربي كلمةً كلمة
```tsx
<WordReveal text="تصميم نظام معلوماتي لتسيير المخزون" className="text-3xl font-extrabold" delay={0.3} />
```
لا تكتب تقسيماً خاصاً بالحروف. إن احتجت تأثيراً آخر (ضبابية/تكبير) استعمل `TextAnimate` من المعرض مع `by="word"`.

## 3. AnimatePresence — عنصر يظهر ويختفي داخل الشريحة
```tsx
<AnimatePresence mode="wait">
  <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
    {panels[step]}
  </motion.div>
</AnimatePresence>
```
(`TransitionPanel` من المعرض يغلّف هذا النمط.) غيّر `step` بزر داخل الشريحة — **لا تربطه بمفاتيح التنقل** (محجوزة للعرض).

## 4. layout — إعادة ترتيب سلسة
```tsx
<motion.div layout transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}>…</motion.div>
```
أضف `layout` لكل عنصر يتغيّر موضعه (فلترة، فرز، قبل/بعد). للعناصر المتبادلة بين حاويات: `layoutId` نفسه.

## 5. عدّاد رقمي بـ `animate()`
```tsx
useEffect(() => {
  const controls = animate(0, value, {
    duration: 1.2, ease: 'easeOut', delay: 0.4,
    onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-US'); },
  });
  return () => controls.stop();
}, [value]);
<span ref={ref} dir="ltr" className="tabular-nums" />
```
(هذا ما يفعله `StatCounters`؛ للعدّاد بنابض استعمل `NumberTicker` من المعرض.)

## 6. رسم خط/مسار SVG (`pathLength`)
```tsx
<motion.path d={d} fill="none" stroke="currentColor" strokeWidth={2}
  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
  transition={{ pathLength: { duration: 1, ease: 'easeInOut', delay: 0.3 }, opacity: { duration: 0.2 } }} />
```
يعمل مع `path`, `line`, `circle`, `rect`. للخط الزمني: ارسم الخط أولاً ثم أظهر المحطات بـ stagger يبدأ بعد `delay + duration`.

## 7. نبض/توهّج مستمر (هادئ)
```tsx
<motion.span animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
```
مؤثر مستمر واحد لكل شريحة على الأكثر.

## 8. hover/tap على البطاقات
```tsx
<motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} />
```
(`Card` يطبّق ذلك افتراضياً.)

## 9. تقليل الحركة
```tsx
const reduce = useReducedMotion();
<motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} />
```

## 10. `useInView` — فقط للمحتوى الطويل القابل للتمرير داخل الشريحة
الشرائح لا تتمرّر عادة؛ شغّل الحركة عند الدخول (`animate`) لا عند الظهور (`whileInView`). إن استعملت مكوّن معرض يملك `startOnView` فاضبطه `false` أو تأكد أن العنصر ظاهر من البداية.

## اتجاهات RTL
- «من بداية القراءة» (يمين) = `x: 24`؛ «من النهاية» = `x: -24`؛ عند الشك استعمل `y`.
- `transformOrigin` للأشرطة التي تنمو: `originX: 1` (يمين).

## أخطاء شائعة
- وضع `initial/animate` على الأبناء وعلى الحاوية معاً → يبطل stagger.
- `key` غير ثابت في القوائم → إعادة تشغيل الحركة في كل تصيير.
- تحريك `height: 'auto'` لعناصر كبيرة → تقطيع؛ استعمل `layout` أو `scaleY` مع `originY: 0`.
- مزج GSAP وframer-motion على نفس العنصر.
