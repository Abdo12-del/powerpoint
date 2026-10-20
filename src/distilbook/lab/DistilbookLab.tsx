import { useRef } from 'react';
import { LenisProvider } from '@/effects/lenis/LenisProvider';
import { DistilbookShowreel } from '../DistilbookShowreel';
import type { DistilbookShowreelHandle } from '../DistilbookShowreel';
import { DropMark } from '../scenes/shared';
import {
  DISTILBOOK_SCENES,
  DISTILBOOK_IDENTITY,
} from '../types';

/**
 * مختبر الموشن جرافيك البحثي — ?lab=distilbook
 * الشورييل القصصي الكامل + لوحة فصول للقفز بين المشاهد + هوية المنصة
 */

const IDENTITY_SWATCHES: Array<{ name: string; hex: string; role: string }> = [
  { name: 'Teal', hex: DISTILBOOK_IDENTITY.teal, role: 'النقاء والعلامة' },
  { name: 'Sky', hex: DISTILBOOK_IDENTITY.sky, role: 'التقطير ثلاثي الأبعاد' },
  { name: 'Amber', hex: DISTILBOOK_IDENTITY.amber, role: 'الأفكار المفتاحية' },
  { name: 'Violet', hex: DISTILBOOK_IDENTITY.violet, role: 'شبكة المراجع' },
  { name: 'Emerald', hex: DISTILBOOK_IDENTITY.emerald, role: 'الملخصات' },
  { name: 'Rose', hex: DISTILBOOK_IDENTITY.rose, role: 'ألم المشكلة' },
];

export function DistilbookLab() {
  const showreelRef = useRef<DistilbookShowreelHandle>(null);

  const jumpTo = (t: number) => {
    showreelRef.current?.seek(t);
    showreelRef.current?.play();
  };

  return (
    <LenisProvider>
      <div className="min-h-screen bg-slate-950 pb-24" dir="rtl">
        {/* الترويسة */}
        <header className="border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-9 text-center">
          <div className="flex items-center justify-center gap-3">
            <DropMark size={40} />
            <h1 className="text-3xl font-black text-white sm:text-4xl" dir="ltr">Distilbook</h1>
          </div>
          <p className="pt-2 text-sm font-bold text-teal-300">حزمة الموشن جرافيك البحثي — قصة المنصة في 20 ثانية</p>
          <p className="mx-auto max-w-2xl pt-3 text-sm leading-relaxed text-slate-400">
            Motion Canvas (فلسفة الخط الزمني الحتمي) + GSAP للتنفيذ — كتابة حركية، تصوّر بصري
            للأفكار والمراجع والملخصات، مشهد تقطير ثلاثي الأبعاد، Parallax وMorphing وParticles،
            وتزامن دقيق للحركة مع الإيقاع.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {['GSAP Master Timeline', 'BeatClock', 'Three.js', 'Motion Canvas Philosophy', '20s / 7 مشاهد'].map((b) => (
              <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
                {b}
              </span>
            ))}
          </div>
        </header>

        {/* الشورييل */}
        <section className="mx-auto max-w-5xl px-4 pt-10">
          <DistilbookShowreel ref={showreelRef} height="560px" />

          {/* فصول القصة — قفز مباشر */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-[11px] font-black text-slate-400">فصول القصة:</span>
            {DISTILBOOK_SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                data-testid={`chapter-${s.id}`}
                onClick={() => jumpTo(s.start)}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-bold transition hover:brightness-125"
                style={{ borderColor: `${s.accent}55`, color: s.accent, backgroundColor: `${s.accent}12` }}
              >
                {i + 1}. {s.title}
                <span className="ms-1.5 font-mono text-[10px] opacity-60">{s.start}s</span>
              </button>
            ))}
          </div>
        </section>

        {/* لوحة القصة */}
        <section className="mx-auto max-w-5xl px-4 pt-14">
          <h2 className="pb-2 text-xl font-black text-white">لوحة القصة — Storyboard</h2>
          <p className="pb-6 text-sm text-slate-400">سبع مشاهد تحكي رحلة البحث من الإغراق إلى النقاء.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DISTILBOOK_SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(s.start)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start transition hover:border-white/25"
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="font-mono text-[11px] text-slate-500">0{i + 1}</span>
                  <span className="h-2 w-8 rounded-full" style={{ backgroundColor: s.accent }} />
                </div>
                <p className="text-sm font-black text-white">{s.title}</p>
                <p className="pt-1 text-[11px] leading-relaxed text-slate-400">{s.subtitle}</p>
                <p className="pt-2 font-mono text-[10px] text-slate-600">
                  {s.start}s → {s.end}s · {s.transition}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* الهوية البصرية */}
        <section className="mx-auto max-w-5xl px-4 pt-14">
          <h2 className="pb-2 text-xl font-black text-white">الهوية البصرية</h2>
          <p className="pb-6 text-sm text-slate-400">
            لوحة واحدة تحكم كل المشاهد — كل لون له دور درامي في القصة، والقطرة رمز التقطير.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {IDENTITY_SWATCHES.map((s) => (
              <div key={s.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="h-10 w-10 shrink-0 rounded-xl" style={{ backgroundColor: s.hex }} />
                <div>
                  <p className="text-sm font-black text-white">{s.name}</p>
                  <p className="font-mono text-[10px] text-slate-500" dir="ltr">{s.hex}</p>
                  <p className="text-[11px] text-slate-400">{s.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* الاستعمال ككود */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="pb-2 text-sm font-black text-white">الاستعمال في الشرائح</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900/80 p-3 text-left font-mono text-[11px] leading-relaxed text-teal-200" dir="ltr">
{`import { DistilbookShowreel } from '@/distilbook';

<DistilbookShowreel
  config={{
    brand: 'DISTILBOOK',
    tagline: 'قراءة أقل · فهم أعمق',
    bpm: 124,
    ideas: ['سؤال البحث', 'المنهجية'],
  }}
  height="560px"
/>`}
            </pre>
          </div>
        </section>

        <footer className="mx-auto max-w-5xl px-4 pt-10 text-center text-[11px] text-slate-500">
          المحتوى كله من <span className="font-mono">DEFAULT_DISTILBOOK_CONFIG</span> — مرّر <span className="font-mono">config</span> خاصاً بك ·
          الدليل: <span className="font-mono">docs/DISTILBOOK_MOTION.md</span>
        </footer>
      </div>
    </LenisProvider>
  );
}

export default DistilbookLab;
