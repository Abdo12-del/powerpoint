# كتالوج مكتبات الحركة المثبتة (Animation Toolkit)

كل ما يلي **مثبت وجاهز** في `package.json`، وله مغلّف بسيط في `src/components/effects/` يُستورد هكذا:

```tsx
import {
  // قصاصات احتفالية
  fireConfetti, useConfetti, ConfettiOnMount,
  // خلفيات جسيمات
  ParticlesBackground,
  // رسوم Lottie
  LottiePlayer,
  // نصوص
  Typewriter, Annotate,
  // عمق وتتابع وقوائم
  TiltCard, GsapReveal, AutoAnimate,
  // GSAP مُهيّأ + أدوات
  gsap, useGSAP, splitWords, SplitText, Flip, TextPlugin, MotionPathPlugin,
  prefersReducedMotion,
} from '@/components/effects';
```

> **قاعدة البيت (§9.5)**: لا يُقسَّم النص العربي إلى حروف منفصلة في أي حركة. استعمل `WordReveal` أو `splitWords()` (كلمات/أسطر فقط). الآلة الكاتبة (`Typewriter`) آمنة لأنها تُبقي النص عقدة واحدة.

---

## جدول القرار: ماذا أريد ← ماذا أستعمل

| أريد… | استعمل | المكتبة |
|---|---|---|
| إظهار الكتل والبطاقات تباعاً، انتقال الشاشات، حركات الحالة | `Stagger` / `Card` / `motion.*` (موجودة في `ui/`) | framer-motion |
| كشف عنوان كلمةً كلمة | `WordReveal` (في `ui/`) | framer-motion |
| عدّادات أرقام | `StatCounters` (نمط 10) | framer-motion `animate()` |
| تسلسل زمني معقّد على شريحة واحدة (A ثم B ثم C مع تداخل)، مسارات حركة، Flip layout | `useGSAP` + `gsap.timeline()` / `GsapReveal` | GSAP + @gsap/react |
| تقسيم عنوان إلى كلمات لتحريكها بـ GSAP | `splitWords(el)` | GSAP SplitText |
| احتفال في شريحة الشكر / إعلان نتيجة | `ConfettiOnMount` أو `fireConfetti('fireworks')` | canvas-confetti |
| خلفية نجوم/شبكة/ثلج لشاشة العنوان أو فصل | `ParticlesBackground preset="stars"` | tsParticles (slim) |
| أيقونة/رسم متحرك (After Effects, LottieFiles) | `LottiePlayer src={json}` | lottie-react |
| نص يُكتب أمام الجمهور (الإشكالية مثلاً) | `Typewriter` | react-type-animation |
| تحديد/تدوير/تظليل كلمة مفتاحية بخط اليد | `Annotate type="circle"` | rough-notation |
| بطاقة تميل مع المؤشر (شاشة العنوان، الخريطة) | `TiltCard` | react-parallax-tilt |
| قائمة تتغيّر أثناء العرض (كشف تدريجي، فلترة) | `AutoAnimate` | @formkit/auto-animate |
| حركة سريعة بأصناف CSS فقط | `className="animate-in fade-in slide-in-from-bottom-4 duration-700"` | tw-animate-css |

---

## 1. framer-motion (الأساس — موجود منذ البداية)

- **الاستعمال**: كل انتقالات الشاشات والـ stagger و`whileHover`/`whileTap` والعدّادات.
- **جاهز في** `src/components/ui/motion.ts` (`fadeUp`, `popIn`, `staggerContainer`, `screenVariants`).
- **مثال داخل شريحة**:

```tsx
<Stagger className="grid gap-4 sm:grid-cols-3">
  <Card>…</Card><Card>…</Card><Card>…</Card>
</Stagger>
```

## 2. GSAP + @gsap/react (`gsap`, `@gsap/react`)

كل الإضافات مجانية (SplitText, Flip, TextPlugin, MotionPathPlugin, ScrollTrigger…). استورد دائماً من `@/lib/gsap` أو من الفهرس حتى تكون الإضافات مسجّلة.

```tsx
import { useRef } from 'react';
import { gsap, useGSAP, splitWords } from '@/components/effects';

function HeroTitle() {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const split = splitWords('.title');                       // كلمات فقط — آمن للعربية
    gsap.timeline()
      .from(split.words, { y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' })
      .from('.subtitle', { opacity: 0, y: 12 }, '-=0.2')
      .from('.cta', { scale: 0.8, opacity: 0, ease: 'back.out(1.7)' });
  }, { scope });
  return (
    <div ref={scope}>
      <h1 className="title">تصميم نظام معلوماتي لتسيير المخزون</h1>
      <p className="subtitle">…</p>
      <button className="cta">ابدأ</button>
    </div>
  );
}
```

- `GsapReveal`: إظهار متتابع جاهز بلا كتابة timeline:
  ```tsx
  <GsapReveal stagger={0.1} y={30}><Card/><Card/><Card/></GsapReveal>
  ```
- **ملاحظة**: `useGSAP` ينظّف كل الحركات عند خروج الشريحة تلقائياً (context + scope).

## 3. canvas-confetti (`canvas-confetti`)

```tsx
// تلقائياً في الخاتمة: final.celebrate = true | 'burst' | 'cannons' | 'rain' | 'stars' | 'fireworks'
// يدوياً:
<ConfettiOnMount preset="fireworks" delay={800} />
const stop = fireConfetti('cannons', { duration: 4000, colors: ['#fbbf24', '#38bdf8'] });
```

- يحترم `prefers-reduced-motion` تلقائياً.
- للعروض الرسمية (مناقشة أمام لجنة): `celebrate: false`.

## 4. tsParticles (`@tsparticles/react`, `@tsparticles/slim`, `@tsparticles/engine`)

```tsx
// تلقائياً في شاشة العنوان: meta.background = 'stars' | 'network' | 'snow' | 'bubbles' | 'fireflies' | 'none'
// في أي شريحة/فصل:
<div className="relative h-full">
  <ParticlesBackground preset="network" density={0.8} color="#a78bfa" />
  <div className="relative z-10">…</div>
</div>
```

- يُحمَّل كسولاً (chunk منفصل ≈ 80KB) ولا يعترض نقرات المستخدم.
- لإعدادات مخصّصة مرّر `options={{ … }}` (مخطط tsParticles v3/v4).

## 5. Lottie (`lottie-react` → `lottie-web`)

```tsx
import celebrate from '@/assets/lottie/celebrate.json';   // ضع ملفات .json في src/assets/lottie/
<LottiePlayer src={celebrate} loop className="h-64 w-64" />
<LottiePlayer src="/lottie/rocket.json" loop={false} speed={1.2} />  // من public/
```

- مصادر مجانية: lottiefiles.com (نزّل JSON). يعمل دون اتصال.
- يُحمَّل كسولاً (≈ 300KB لا تدخل الحزمة إلا عند أول استعمال).
- تحكم متقدم: `import { Lottie, useLottie } from 'lottie-react'`.

## 6. react-type-animation (`Typewriter`)

```tsx
<Typewriter as="h2" className="text-3xl font-bold" text="كيف يمكن أتمتة تسيير المخزون دون رفع التكاليف؟" speed={60} />
<Typewriter text={['سريع', 'موثوق', 'قابل للقياس']} repeat={Infinity} pause={1200} />
<Typewriter text="…" byWord />   // كلمةً كلمة بدل حرفاً حرفاً
```

## 7. rough-notation (`Annotate`)

```tsx
<p>
  العنصر الحاسم هو <Annotate type="circle" color="#fbbf24" delay={800}>زمن الخدمة</Annotate> لا عدد الطاقم.
</p>
<Annotate type="highlight" color="rgba(251,191,36,.35)">15 دقيقة</Annotate>
<Annotate type="bracket" brackets={['right']}>…</Annotate>
```

- الأنواع: `underline | box | circle | highlight | strike-through | crossed-off | bracket`.
- `rtl` مفعّل افتراضياً فيُرسم الخط من اليمين.

## 8. react-parallax-tilt (`TiltCard`)

```tsx
<TiltCard maxAngle={10} glare>
  <Card>بطاقة المُنجزين</Card>
</TiltCard>
```

## 9. @formkit/auto-animate (`AutoAnimate`)

```tsx
const [shown, setShown] = useState(1);
<AutoAnimate as="ul" className="grid gap-3">
  {points.slice(0, shown).map((p) => <li key={p}>{p}</li>)}
</AutoAnimate>
```

## 10. tw-animate-css (أصناف Tailwind)

مستورد في `src/index.css`. أصناف جاهزة بلا JavaScript:

```html
<div class="animate-in fade-in slide-in-from-bottom-6 duration-700">…</div>
<div class="animate-in zoom-in-95 delay-300 fill-mode-both">…</div>
<div class="animate-out fade-out slide-out-to-left-4">…</div>
<span class="animate-pulse | animate-bounce | animate-spin">   (Tailwind الأصلية)
```

---

## قواعد الاستعمال في العروض

1. **مؤثر واحد مهيمن لكل شريحة** — الحركة تخدم الفكرة ولا تنافسها.
2. **لا حروف عربية منفصلة** — كلمات فقط (`WordReveal`, `splitWords`).
3. **احترام تقليل الحركة** — المغلّفات تفعل ذلك؛ في الحركات اليدوية استعمل `prefersReducedMotion()`.
4. **الخلفيات بلا تفاعل** (`pointer-events-none`) حتى لا تعيق الأزرار والخريطة.
5. **التحميل الكسول للثقيل** — Lottie وtsParticles مفصولان؛ GSAP لا يدخل الحزمة إلا إذا استوردته.
6. **التنظيف** — أي حركة يدوية داخل `useEffect`/`useGSAP` تُعاد عند الخروج (الشرائح تُفكَّك عند التنقل).

## إضافة مكتبة جديدة

1. `npm install <pkg>`.
2. مغلّف صغير في `src/components/effects/` (كسول إن كانت ثقيلة) وتصدير من `index.ts`.
3. سطر في جدول القرار أعلاه + مثال.
4. اختبار عرض في `src/__tests__/effects.test.tsx`.
