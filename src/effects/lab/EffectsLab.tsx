import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LenisProvider } from '../lenis/LenisProvider';
import { ThreeShowreel } from '../ThreeShowreel';
import type { ThreeShowreelHandle } from '../ThreeShowreel';
import { useThreeScene } from '../three/useThreeScene';
import { MorphBlob } from '../three/MorphBlob';
import { ParticleField } from '../three/ParticleField';
import { createGlitchQuad, updateGlitchQuad } from '../three/GlitchQuad';
import { transitionSwap } from '../transitions/dom';
import type { DomTransitionStyle } from '../transitions/dom';

/**
 * مختبر المؤثرات السينمائية — ?lab=effects
 * شورييل Three.js كامل + كتالوج مؤثرات حي (Morph/Particles/Glitch)
 * + انتقالات DOM ديناميكية + بارالاكس انسيابي بـ Lenis
 */

// ── بطاقة مصغّرة 1: مجسّم يتنفس (Morphing) ──
function MorphMiniCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef = useRef<MorphBlob | null>(null);
  useThreeScene(canvasRef, {
    onInit: ({ scene, camera }) => {
      const blob = new MorphBlob(4);
      blobRef.current = blob;
      scene.add(blob.mesh);
      scene.add(new THREE.PointLight(0x38bdf8, 14, 20).translateX(-3).translateY(2).translateZ(2));
      camera.position.set(0, 0, 3.4);
    },
    onFrame: ({ time, delta }) => {
      blobRef.current?.update(time, delta);
    },
  });
  return (
    <EffectCard title="Morphing — تحوّل ضوضائي" hint="Icosahedron + Fresnel rim، uMorph يتنفس بسينا">
      <canvas ref={canvasRef} className="h-44 w-full rounded-xl" />
    </EffectCard>
  );
}

// ── بطاقة مصغّرة 2: حقل جسيمات ──
function ParticlesMiniCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);
  const accRef = useRef(0);
  useThreeScene(canvasRef, {
    onInit: ({ scene, camera }) => {
      const field = new ParticleField(700);
      fieldRef.current = field;
      scene.add(field.points);
      camera.position.set(0, 0, 5);
      field.burst(new THREE.Vector3(0, 0, 0), 180, 3);
    },
    onFrame: ({ delta }) => {
      accRef.current += delta;
      if (accRef.current > 60 / 128) {
        accRef.current = 0;
        fieldRef.current?.burst(new THREE.Vector3(0, 0, 0), 24, 3.6);
      }
      fieldRef.current?.update(delta);
    },
  });
  return (
    <EffectCard title="Particles — نبض بالإيقاع" hint="Points + AdditiveBlending، انفجار كل نبضة (128 BPM)">
      <canvas ref={canvasRef} className="h-44 w-full rounded-xl" />
    </EffectCard>
  );
}

// ── بطاقة مصغّرة 3: غليتش على نسيج إجرائي ──
function GlitchMiniCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quadRef = useRef<THREE.Mesh | null>(null);
  useThreeScene(canvasRef, {
    onInit: ({ scene, camera }) => {
      const quad = createGlitchQuad();
      quadRef.current = quad;
      scene.add(quad);
      camera.position.set(0, 0, 1.62);
    },
    onFrame: ({ time }) => {
      if (quadRef.current) updateGlitchQuad(quadRef.current, time);
    },
  });
  return (
    <EffectCard title="Glitch — تشويش رقمي" hint="إزاحة أشرطة + RGB Split + شرائط لونية (ShaderMaterial)">
      <canvas ref={canvasRef} className="h-44 w-full rounded-xl" />
    </EffectCard>
  );
}

function EffectCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="overflow-hidden rounded-xl">{children}</div>
      <figcaption className="px-1 pt-3">
        <p className="text-sm font-black text-white">{title}</p>
        <p className="pt-1 text-[11px] leading-relaxed text-slate-400">{hint}</p>
      </figcaption>
    </figure>
  );
}

// ── عرض انتقالات DOM: تبديل بطاقة بثلاثة أنماط ──
const SWAP_CONTENTS = [
  { title: 'انزلاق', body: 'Slide — خروج أفقي ثم دخول بـ power3.out', accent: 'from-amber-400 to-orange-500' },
  { title: 'تكبير', body: 'Zoom — scale 1.35→1 مع ضبابية تتلاشى', accent: 'from-sky-400 to-blue-600' },
  { title: 'غليتش', body: 'Glitch — قصّات clip-line بخطوات صارمة ورجّة أفقية', accent: 'from-rose-400 to-fuchsia-600' },
];

function TransitionDemoCard() {
  const boxRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const [style, setStyle] = useState<DomTransitionStyle>('slide');
  const [idx, setIdx] = useState(0);

  const next = () => {
    const box = boxRef.current;
    if (!box) return;
    transitionSwap(box, () => {
      idxRef.current = (idxRef.current + 1) % SWAP_CONTENTS.length;
      setIdx(idxRef.current);
    }, style);
  };

  const c = SWAP_CONTENTS[idx];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(['slide', 'zoom', 'glitch'] as DomTransitionStyle[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStyle(s)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition ${
              style === s ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={next}
          className="ms-auto rounded-lg bg-amber-400 px-3 py-1 text-[11px] font-black text-slate-950 transition hover:bg-amber-300"
        >
          انتقال ←
        </button>
      </div>
      <div ref={boxRef} className="overflow-hidden rounded-xl">
        <div className={`rounded-xl bg-gradient-to-bl ${c.accent} p-5`}>
          <p className="text-lg font-black text-white">{c.title}</p>
          <p className="pt-1 text-xs text-white/85">{c.body}</p>
        </div>
      </div>
    </div>
  );
}

// ── بارالاكس انسيابي: طبقات تتحرك بسرعات مختلفة مع التمرير (Lenis يمنح النعومة) ──
const PARALLAX_LAYERS = [
  { label: 'طبقة خلفية — بطيئة', speed: 0.12, cls: 'bg-sky-500/10 text-sky-200' },
  { label: 'طبقة وسطى — متوسطة', speed: 0.3, cls: 'bg-violet-500/10 text-violet-200' },
  { label: 'طبقة أمامية — سريعة', speed: 0.55, cls: 'bg-amber-400/10 text-amber-200' },
];

function LenisParallaxSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-speed]'));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = 1 - (rect.top + rect.height / 2) / (vh + rect.height / 2);
        layers.forEach((layer) => {
          const speed = Number(layer.dataset['speed'] ?? 0.2);
          layer.style.transform = `translateY(${(0.5 - progress) * speed * 300}px)`;
        });
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={rootRef} className="relative mx-auto max-w-5xl px-4 py-16">
      <h2 className="pb-2 text-xl font-black text-white">Parallax + Lenis — حركة انسيابية مربوطة بالتمرير</h2>
      <p className="pb-8 text-sm leading-relaxed text-slate-400">
        Lenis يخفّف عجلة الفأرة وحركة اللمس فيتفحّم التمرير بسلاسة؛ كل طبقة هنا تستجيب لتقدّم القسم
        بسرعة مختلفة (<code className="font-mono text-[11px] text-sky-300">data-speed</code>) — جرّب التمرير.
      </p>
      <div className="space-y-4">
        {PARALLAX_LAYERS.map((l) => (
          <div key={l.label} data-speed={l.speed} className={`flex h-24 items-center justify-between rounded-2xl border border-white/10 px-5 ${l.cls}`}>
            <p className="text-sm font-black">{l.label}</p>
            <p className="font-mono text-[11px] opacity-70">speed = {l.speed}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── الصفحة الكاملة ──
export function EffectsLab() {
  const [bpm, setBpm] = useState(128);
  const showreelRef = useRef<ThreeShowreelHandle>(null);

  const capture = () => {
    const url = showreelRef.current?.captureFrame();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'three-showreel-frame.png';
    a.click();
  };

  return (
    <LenisProvider>
      <div className="min-h-screen bg-slate-950 pb-24" dir="rtl">
        {/* الترويسة */}
        <header className="border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-center">
          <p className="font-mono text-[11px] tracking-[0.4em] text-amber-300">CINEMATIC EFFECTS LAB</p>
          <h1 className="pt-2 text-3xl font-black text-white sm:text-4xl">حزمة المؤثرات السينمائية</h1>
          <p className="mx-auto max-w-2xl pt-3 text-sm leading-relaxed text-slate-400">
            Three.js (MIT) لمشاهد ثلاثية الأبعاد + Lenis (MIT) للحركة الانسيابية — Parallax وMorphing
            وGlitch وParticles وتشوهات بصرية وانتقالات ديناميكية وتزامن كامل مع الإيقاع.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {['three r186', 'lenis 1.3', 'EffectComposer', 'BeatClock', 'GSAP'].map((b) => (
              <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
                {b}
              </span>
            ))}
          </div>
        </header>

        {/* المسرح الرئيسي */}
        <section className="mx-auto max-w-5xl px-4 pt-10">
          <ThreeShowreel ref={showreelRef} bpm={bpm} brand="ARENA STUDIO" tagline="ثلاثية الأبعاد — إيقاع وتشوّه" height="540px" />

          {/* أدوات المسرح */}
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <label className="flex items-center gap-3 text-xs font-bold text-slate-300">
              الإيقاع
              <input
                type="range"
                min={70}
                max={180}
                step={1}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="h-1 w-44 accent-amber-400"
              />
              <span data-testid="bpm-value" className="w-16 font-mono text-emerald-300">{bpm} BPM</span>
            </label>
            <button
              type="button"
              onClick={capture}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/10"
            >
              📸 التقط إطاراً (PNG)
            </button>
            <p className="text-[11px] text-slate-500">
              المقاطع تُقص كل 4 ثوانٍ بانتقال غليتش/وميض — الحركة كلها مضروبة بساعة BeatClock.
            </p>
          </div>
        </section>

        {/* كتالوج التأثيرات */}
        <section className="mx-auto max-w-5xl px-4 pt-14">
          <h2 className="pb-2 text-xl font-black text-white">كتالوج التأثيرات الحي</h2>
          <p className="pb-6 text-sm text-slate-400">كل بطاقة مشهد Three.js مستقل — انسخها مباشرة إلى شرائحك.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <MorphMiniCard />
            <ParticlesMiniCard />
            <GlitchMiniCard />
          </div>
        </section>

        {/* انتقالات DOM */}
        <section className="mx-auto max-w-5xl px-4 pt-14">
          <h2 className="pb-2 text-xl font-black text-white">انتقالات ديناميكية (GSAP)</h2>
          <p className="pb-6 text-sm text-slate-400">ثلاثة أنماط جاهزة لتبديل البطاقات — اختر النمط ثم اضغط «انتقال».</p>
          <TransitionDemoCard />
        </section>

        {/* بارالاكس Lenis */}
        <LenisParallaxSection />

        <footer className="mx-auto max-w-5xl px-4 pt-6 text-center text-[11px] text-slate-500">
          <code className="font-mono">&lt;ThreeShowreel brand tagline bpm /&gt;</code> — مكوّن جاهز للشرائح ·
          الدليل الكامل: <span className="font-mono">docs/CINEMATIC_EFFECTS.md</span>
        </footer>
      </div>
    </LenisProvider>
  );
}

export default EffectsLab;
