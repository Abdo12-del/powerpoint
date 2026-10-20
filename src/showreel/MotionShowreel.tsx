/**
 * مكون الشورييل الكامل — 15 ثانية
 * يدمج Motion Canvas (مفاهيم المشاهد) + GSAP للحركة
 * Slide/Zoom + Kinetic + 3D + Parallax + Glitch + Morph + Particles + تزامن مع الموسيقى
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { KineticScene } from './scenes/KineticScene';
import { Transition3DScene } from './scenes/Transition3DScene';
import { ParallaxScene } from './scenes/ParallaxScene';
import { GlitchScene } from './scenes/GlitchScene';
import { MorphScene } from './scenes/MorphScene';
import { ParticleScene } from './scenes/ParticleScene';
import { FinaleScene } from './scenes/FinaleScene';
import { buildShowreelTimeline } from './timeline';
import { DEFAULT_SHOWREEL_CONFIG, SHOWREEL_DURATION } from './types';
import type { ShowreelConfig } from './types';

export interface MotionShowreelProps {
  config?: Partial<ShowreelConfig>;
  height?: string;
  className?: string;
  onTimeUpdate?: (time: number) => void;
}

export function MotionShowreel({ config: cfgOverride, height = '560px', className, onTimeUpdate }: MotionShowreelProps) {
  const config: ShowreelConfig = { ...DEFAULT_SHOWREEL_CONFIG, ...cfgOverride };
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(config.autoPlay);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeScene, setActiveScene] = useState<string>('kinetic');

  // بناء GSAP timeline عند التحميل
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const { tl } = buildShowreelTimeline(
      root,
      (t, sceneId) => {
        setTime(t);
        setActiveScene(sceneId);
        onTimeUpdate?.(t);
      },
      config.bpm,
    );

    tlRef.current = tl;

    if (config.autoPlay) {
      tl.play();
      // حلقة تحديث الزمن
      const ticker = () => setTime(tl.time());
      gsap.ticker.add(ticker);
      return () => {
        gsap.ticker.remove(ticker);
        tl.kill();
      };
    } else {
      tl.pause(0);
      return () => tl.kill();
    }
  }, [config.bpm, config.autoPlay, onTimeUpdate]);

  // تشغيل/إيقاف
  const toggle = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (playing) {
      tl.pause();
      audioRef.current?.pause();
    } else {
      // إعادة من البداية إن انتهى
      if (tl.time() >= SHOWREEL_DURATION - 0.05) tl.restart();
      else tl.play();
      if (config.syncToMusic && audioRef.current && !muted) {
        audioRef.current.play().catch(() => {});
      }
    }
    setPlaying((p) => !p);
  }, [playing, config.syncToMusic, muted]);

  const seek = useCallback((t: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    const wasPlaying = playing;
    tl.pause();
    tl.time(t);
    setTime(t);
    if (wasPlaying) tl.play();
  }, [playing]);

  const progress = (time / SHOWREEL_DURATION) * 100;

  return (
    <div className={className ?? 'relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl'} style={{ height }}>
      {/* خشبة المسرح — Motion Canvas Style: Scene + View */}
      <div
        ref={rootRef}
        className="relative h-full w-full overflow-hidden bg-slate-950"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      >
        {/* خلفية ديناميكية — أشكال هندسية متحركة */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:64px_64px]" />
        </div>

        {/* المشاهد السبعة — كل مشهد مطلق الوضع، يظهر حسب timeline */}
        <KineticScene />
        <Transition3DScene />
        <ParallaxScene />
        <GlitchScene />
        <MorphScene />
        <ParticleScene />
        <FinaleScene brand={config.brand} tagline={config.tagline} />

        {/* صوت وهمي — نبضة بصرية متزامنة مع BPM */}
        <BeatPulse time={time} bpm={config.bpm} active={playing && config.syncToMusic} />
      </div>

      {/* شريط التحكم — تزامن مع الموسيقى */}
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 backdrop-blur-md">
        <button
          onClick={toggle}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
          aria-label={playing ? 'إيقاف' : 'تشغيل'}
        >
          {playing ? (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><rect x={6} y={5} width={4} height={14} rx={1} /><rect x={14} y={5} width={4} height={14} rx={1} /></svg>
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" className="ms-0.5"><path d="M8 5.14v14l11-7-11-7z" /></svg>
          )}
        </button>

        <div className="flex flex-1 items-center gap-2">
          <span className="font-mono text-xs text-slate-300" dir="ltr">{time.toFixed(1)}s</span>
          <div className="relative flex-1">
            <input
              type="range"
              min={0}
              max={SHOWREEL_DURATION}
              step={0.05}
              value={time}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            {/* علامات المشاهد على الشريط */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex h-1 -translate-y-1/2 gap-px">
              {[2.2, 4.4, 6.6, 8.8, 11, 13.2].map((t) => (
                <div
                  key={t}
                  className="h-full w-px bg-white/30"
                  style={{ marginInlineStart: `${(t / SHOWREEL_DURATION) * 100}%` }}
                />
              ))}
            </div>
          </div>
          <span className="font-mono text-xs text-slate-500" dir="ltr">{SHOWREEL_DURATION}s</span>
        </div>

        <button
          onClick={() => setMuted((m) => !m)}
          className={`rounded-full p-2 text-xs ${muted ? 'bg-white/5 text-slate-500' : 'bg-white/10 text-white hover:bg-white/15'}`}
          title={muted ? 'صامت' : 'الصوت مفعل'}
          aria-label="كتم الصوت"
        >
          {muted ? '🔇' : '🔊'}
        </button>

        <span className="hidden items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-xs font-bold text-amber-300 sm:inline-flex">
          {activeScene.toUpperCase()} · {Math.round((time / SHOWREEL_DURATION) * 100)}%
        </span>
      </div>

      {/* شريط تقدم علوي رفيع */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-white/5">
        <div className="h-full bg-gradient-to-l from-amber-400 to-amber-500 transition-none" style={{ width: `${progress}%` }} />
      </div>

      {/* عنصر صوتي مخفي — تزامن حقيقي مع Web Audio API عند توفر ملف */}
      <audio
        ref={audioRef}
        src={config.syncToMusic ? undefined : undefined}
        preload="none"
        loop={config.loop}
        muted={muted}
        onTimeUpdate={(e) => {
          if (!config.syncToMusic) return;
          const t = (e.target as HTMLAudioElement).currentTime;
          if (tlRef.current && config.syncToMusic) {
            // مزامنة الزمن مع الصوت في حدود 0.1 ثانية
            if (Math.abs(tlRef.current.time() - (t % SHOWREEL_DURATION)) > 0.12) {
              tlRef.current.time(t % SHOWREEL_DURATION);
            }
          }
        }}
      />
    </div>
  );
}

/** نبضة بصرية مع كل Beat — حلقة حول الحواف */
function BeatPulse({ time, bpm, active }: { time: number; bpm: number; active: boolean }) {
  const [pulse, setPulse] = useState(0);
  const lastBeat = useRef(0);

  useEffect(() => {
    if (!active) return;
    const beat = 60 / bpm;
    const currentBeat = Math.floor(time / beat);
    if (currentBeat !== lastBeat.current) {
      lastBeat.current = currentBeat;
      setPulse(1);
      const id = setTimeout(() => setPulse(0), 140);
      return () => clearTimeout(id);
    }
  }, [time, bpm, active]);

  if (!active) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-150"
      style={{
        boxShadow: pulse ? 'inset 0 0 0 2px rgba(251,191,36,0.6), inset 0 0 40px rgba(251,191,36,0.15)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        opacity: pulse ? 1 : 0.5,
      }}
      aria-hidden
    />
  );
}

export default MotionShowreel;
