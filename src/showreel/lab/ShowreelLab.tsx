/**
 * مختبر الموشن الشورييل — ?lab=showreel
 */

import { useState } from 'react';
import { ArrowRight, Film, Music, Layers, Zap, Sparkles, Palette, Box, Waves, Play, MonitorPlay } from 'lucide-react';
import { MotionShowreel } from '../MotionShowreel';
import { SHOWREEL_SCENES } from '../types';

export default function ShowreelLab() {
  const [brand, setBrand] = useState('STUDIO SHOWREEL');
  const [tagline, setTagline] = useState('حكاية تُروى بالحركة — Motion Design سينمائي');
  const [bpm, setBpm] = useState(128);
  const [sync, setSync] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <main dir="rtl" className="min-h-screen overflow-y-auto bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Film size={16} /> القالب · مختبر الموشن
            </div>
            <h1 className="mt-1 text-2xl font-black">العرض الإبداعي — Motion Design Showreel</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Motion Canvas (MIT) + GSAP — 15 ثانية سينمائية: Kinetic Typography و3D Transitions وParallax وGlitch وMorphing وParticles، مع Slide/Zoom وتزامن مع الموسيقى وتنسيق بصري جريء.
            </p>
          </div>
          <a href={window.location.pathname} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 p-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="relative">
            <MotionShowreel
              key={replayKey}
              config={{ brand, tagline, bpm, syncToMusic: sync }}
              height="560px"
            />
            <button
              onClick={() => setReplayKey((k) => k + 1)}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-white/15"
            >
              <Play size={12} /> إعادة التشغيل
            </button>
          </div>

          {/* خط زمني مرئي للمشاهد */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <MonitorPlay size={14} className="text-amber-300" /> خط زمني المشاهد — 15 ثانية
            </h3>
            <div className="mt-4 space-y-2">
              {SHOWREEL_SCENES.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-20 shrink-0 text-xs font-mono text-slate-500" dir="ltr">
                    {s.start.toFixed(1)}–{s.end.toFixed(1)}s
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ background: s.color, width: `${((s.end - s.start) / 15) * 100}%`, marginInlineStart: `${(s.start / 15) * 100}%` }} />
                      </div>
                      <span className="w-24 shrink-0 text-xs font-bold" style={{ color: s.color }}>
                        {s.title}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">{s.subtitle}</div>
                  </div>
                  <div className="flex gap-1">
                    {s.effects.map((e) => (
                      <span key={e} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* كتالوج التأثيرات */}
          <section className="grid gap-4 md:grid-cols-3">
            <FeatureCard icon={Layers} title="Kinetic Typography" desc="كلمات تتنفس وزناً — wght من 200 إلى 900، مع توهج وتتابع بالكلمات لا بالحروف (آمن للعربية)." />
            <FeatureCard icon={Box} title="3D Transitions" desc="انقلابات فراغية بمنظور حقيقي — rotationY/X مع حفظ الإضاءة، flip سلس بين المشاهد." />
            <FeatureCard icon={Waves} title="Parallax" desc="طبقات بسرعات متفاوتة — الخلفية أبطأ، المقدمة أسرع، تفاعل مع المؤشر + حركة تلقائية." />
            <FeatureCard icon={Zap} title="Glitch" desc="RGB split + scanlines + displacement — تشويش لحظي متزامن مع النبضة." />
            <FeatureCard icon={Palette} title="Morphing" desc="تحوّل الأشكال الهندسية — دائرة→مربع→مثلث→نجمة مع انتقال لوني متزامن (interpolation)." />
            <FeatureCard icon={Sparkles} title="Particles" desc="انفجار جسيمات مع كل Beat — Canvas2D خفيف، نبض متزامن مع BPM، تفاعل مع المؤشر." />
          </section>

          {/* Motion Canvas */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold">Motion Canvas (MIT) — كيف ندمجه؟</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              المشاهد مبنية بنفس فلسفة Motion Canvas: <code className="rounded bg-white/10 px-1">Scene → View → Txt/Rect/Circle</code> مع
              <code className="rounded bg-white/10 px-1">yield* waitFor / tween</code>. الفرق أننا نشغّلها عبر GSAP في المتصفح مباشرةً (بدون FFmpeg) لسهولة المعاينة. للتصدير كفيديو استعمل
              <code className="rounded bg-white/10 px-1">npm run showreel:export</code> (يُشغّل Motion Canvas خارجياً ويصدّر MP4).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <code className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-300" dir="ltr">gsap.timeline() + SplitText (words only)</code>
              <code className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-300" dir="ltr">ParticleSystem (Canvas2D)</code>
              <code className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-300" dir="ltr">interpolatePaths() for morph</code>
              <code className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-300" dir="ltr">Beat sync: 60/BPM</code>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:h-fit">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Music size={14} className="text-amber-300" /> التحكم في الشورييل
            </h3>
            <div className="mt-4 space-y-4">
              <label className="block space-y-1">
                <span className="text-xs text-slate-400">اسم الاستوديو / العلامة</span>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400/50" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-slate-400">العبارة المتحركة</span>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400/50" />
              </label>

              <label className="block space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">سرعة الإيقاع (BPM)</span>
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-amber-300">{bpm}</span>
                </div>
                <input type="range" min={90} max={160} step={4} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full accent-amber-400" />
                <span className="text-xs text-slate-500">النبضة = {((60 / bpm) * 1000).toFixed(0)}ms</span>
              </label>

              <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span className="text-xs font-bold">تزامن مع الموسيقى</span>
                <button
                  onClick={() => setSync((v) => !v)}
                  className={`relative h-6 w-10 rounded-full transition ${sync ? 'bg-amber-400' : 'bg-white/15'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${sync ? 'right-0.5' : 'right-[18px]'}`} />
                </button>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold">التنسيق البصري الجريء</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-400">
              <li>• <b className="text-white">خطوط متباينة:</b> Cairo Black للعناوين + Noto Naskh للنص + JetBrains للرمز — أحجام كبيرة (5xl–7xl) وتباعد أسطر ضيق.</li>
              <li>• <b className="text-white">أشكال هندسية:</b> دوائر ومربعات ومثلثات ونجوم تتحول بسلاسة، مع حدود سميكة وألوان ديناميكية متغيرة.</li>
              <li>• <b className="text-white">ألوان ديناميكية:</b> لوحة متغيرة مع كل مشهد (ذهبي → سماوي → بنفسجي → وردي → زمردي → فوشيا) مع توهج وضباب.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <h4 className="text-sm font-bold text-amber-200">Slide / Zoom — انتقالات سلسة</h4>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
              كل مشهد يدخل بـ <code className="rounded bg-black/20 px-1">slide-in + zoom + blur</code> ويخرج بـ
              <code className="rounded bg-black/20 px-1">slide-out</code> مع <code className="rounded bg-black/20 px-1">power3</code> —
              متزامن بدقة مع نبضات الموسيقى (Beat).
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ size: number; className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Icon size={14} className="text-amber-300" /> {title}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}
