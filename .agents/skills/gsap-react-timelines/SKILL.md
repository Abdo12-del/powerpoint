---
name: gsap-react-timelines
description: Build GSAP animations inside this React/Vite template — useGSAP hook, timelines, SplitText (words only for Arabic), Flip, MotionPath, TextPlugin, cleanup and reduced-motion. Use when a slide needs a sequenced/choreographed animation (A then B then C), path motion, layout flip, or precise control that framer-motion variants cannot express. استعمل GSAP داخل الشريحة بتسلسل زمني دقيق.
metadata:
  short-description: GSAP داخل الشريحة — timelines وSplitText بالكلمات
---

# GSAP في هذا القالب

**استورد دائماً من `@/lib/gsap`** (أو من `@/components/effects`) — الإضافات مسجّلة هناك مرة واحدة: `useGSAP`, `SplitText`, `Flip`, `TextPlugin`, `MotionPathPlugin`. كل إضافات GSAP مجانية منذ 3.13 (بما فيها SplitText وMorphSVG لو ثبّتها).

```tsx
import { useRef } from 'react';
import { gsap, useGSAP, splitWords } from '@/lib/gsap';
```

## متى GSAP ومتى framer-motion؟

| الحاجة | الأداة |
|---|---|
| دخول/خروج عناصر، stagger بسيط، حالات hover | framer-motion (`Stagger`, `motion.*`) — موجود |
| تسلسل: «العنوان ثم الخط ثم الأرقام ثم الشارة» بتداخل زمني دقيق | **GSAP timeline** |
| تحريك عنصر على مسار SVG | **MotionPathPlugin** |
| إعادة ترتيب/تغيير تخطيط بحركة (قبل/بعد) | **Flip** |
| كتابة نص تدريجياً | `Typewriter` (effects) — أو **TextPlugin** داخل timeline |
| تقسيم عنوان لكلمات وتحريكها | **`splitWords()`** (SplitText بالكلمات فقط) |

## النمط القياسي (انسخه)

```tsx
function SequencedSlide() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } });
      const title = splitWords('.title');                     // كلمات فقط (قاعدة §9.5)
      tl.from(title.words, { y: 24, opacity: 0, stagger: 0.06 })
        .from('.line', { scaleX: 0, transformOrigin: 'right center' }, '-=0.2') // RTL: الأصل يمين
        .from('.item', { x: 24, opacity: 0, stagger: 0.1 }, '-=0.3')
        .from('.badge', { scale: 0, ease: 'back.out(1.7)', duration: 0.4 });
      return () => title.revert();                           // اختياري: useGSAP ينظّف tweens تلقائياً
    },
    { scope },                                               // المحددات تُحلّ داخل scope فقط
  );

  return (
    <div ref={scope} className="space-y-6">
      <h3 className="title text-3xl font-extrabold">عنوان الشريحة</h3>
      <div className="line h-1 w-full bg-amber-400" />
      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="item">…</li><li className="item">…</li><li className="item">…</li>
      </ul>
      <span className="badge">…</span>
    </div>
  );
}
```

### لماذا `useGSAP` وليس `useEffect`؟
- ينشئ `gsap.context()` تلقائياً ويعيد كل شيء (`revert`) عند الخروج — ضروري لأن الشرائح تُفكَّك عند التنقل.
- آمن مع React StrictMode (التنفيذ المزدوج في التطوير).
- `scope` يحصر المحددات (`.item`) داخل الشريحة فلا تصيب شرائح أخرى.
- `dependencies: [...]` لإعادة التشغيل عند تغيّر props؛ `revertOnUpdate: true` لإرجاع الحالة قبل إعادة التشغيل.

### الحدث بدل الدخول (contextSafe)
```tsx
const { contextSafe } = useGSAP({ scope });
const onHover = contextSafe(() => gsap.to('.icon', { rotate: 15, yoyo: true, repeat: 1, duration: 0.2 }));
```

## وصفات

### 1. عدّاد رقمي بلا مكتبة
```tsx
const obj = { v: 0 };
tl.to(obj, { v: 1250, duration: 1.2, ease: 'power1.out', onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('en-US'); } });
```
(للأرقام الجاهزة استعمل `NumberTicker` من المعرض.)

### 2. رسم خط SVG (draw-on)
```tsx
gsap.set('.path', { strokeDasharray: (i, el) => el.getTotalLength(), strokeDashoffset: (i, el) => el.getTotalLength() });
tl.to('.path', { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' });
```
(أو `DrawSVGPlugin` — مجاني، يحتاج `gsap.registerPlugin(DrawSVGPlugin)` في `src/lib/gsap.ts`.)

### 3. حركة على مسار
```tsx
tl.to('.dot', { motionPath: { path: '#route', align: '#route', alignOrigin: [0.5, 0.5], autoRotate: false }, duration: 2, ease: 'none' });
```

### 4. Flip (قبل/بعد إعادة الترتيب)
```tsx
const state = Flip.getState('.card');
container.classList.toggle('grid-cols-3');   // غيّر التخطيط
Flip.from(state, { duration: 0.6, ease: 'power2.inOut', stagger: 0.03, absolute: true });
```

### 5. نص يتغيّر (TextPlugin)
```tsx
tl.to('.kpi-label', { text: { value: 'بعد التحسين', delimiter: ' ' }, duration: 0.6 }); // delimiter مسافة = كلمات
```

### 6. `GsapReveal` الجاهز (بلا كتابة timeline)
```tsx
<GsapReveal stagger={0.1} y={30} delay={0.4}>{cards}</GsapReveal>
```

## قواعد خاصة بالعربية وRTL
- `splitWords()` فقط — **لا** `new SplitText(el, { type: 'chars' })` (يكسر اتصال الحروف).
- `transformOrigin` للخطوط والأشرطة: `'right center'` كي تنمو من جهة بداية القراءة.
- الإزاحة «من بداية القراءة» = `x: +`؛ «من النهاية» = `x: -`.
- الأرقام: `toLocaleString('en-US')` (أرقام غربية ثابتة العرض) داخل عنصر `dir="ltr"`.

## قواعد الأداء والتنظيف
- حرّك `x/y/scale/rotate/opacity` فقط؛ تجنّب `width/height/top/left`.
- `clearProps: 'transform,opacity'` في نهاية tweens الدخول إذا كان العنصر سيتفاعل لاحقاً مع hover من Tailwind.
- لا `ScrollTrigger` هنا — الشرائح لا تتمرّر (استعمل `startOnView` في مكونات المعرض فقط عند الحاجة).
- `prefersReducedMotion()` من `@/lib/motion-prefs`: إن كانت صحيحة → `gsap.set(..., finalState)` بدل timeline.

## الأخطاء الشائعة
- نسيان `scope` → المحدد يصيب عناصر شريحة أخرى ما تزال في AnimatePresence.
- `gsap.from` على عنصر يملك `initial` من framer-motion → تعارض؛ لا تخلط الأداتين على **نفس** العنصر.
- استيراد `gsap` مباشرة من `'gsap'` في ملف شريحة → الإضافات غير مسجّلة؛ استورد من `@/lib/gsap`.
