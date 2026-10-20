import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  DEFAULT_DISTILBOOK_CONFIG,
  DISTILBOOK_DURATION,
  sceneAt,
} from './types';
import type { DistilbookConfig, DistilbookSceneId } from './types';
import { buildDistilbookTimeline } from './timeline';
import type { DistilbookTimelineHandle } from './timeline';
import { OpeningScene } from './scenes/OpeningScene';
import { ProblemScene } from './scenes/ProblemScene';
import { DistillScene } from './scenes/DistillScene';
import { IdeasScene } from './scenes/IdeasScene';
import { ReferencesScene } from './scenes/ReferencesScene';
import { SummaryScene } from './scenes/SummaryScene';
import { FinaleScene } from './scenes/FinaleScene';

export interface DistilbookShowreelHandle {
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
  getDuration: () => number;
}

export interface DistilbookShowreelProps {
  config?: Partial<DistilbookConfig>;
  height?: string;
  className?: string;
  /** إجبار حالة التشغيل الابتدائية (للاختبارات) */
  autoPlay?: boolean;
  onTimeUpdate?: (time: number) => void;
  onSceneChange?: (id: DistilbookSceneId) => void;
}

/**
 * شورييل Distilbook — قصة المنصة في 20 ثانية
 * خط زمني GSAP حتمي (فلسفة Motion Canvas) + مشهد Three.js للتقطير
 * + تزامن نبضات BPM + انتقالات Slide/Zoom/Glitch سينمائية
 */
export const DistilbookShowreel = forwardRef<DistilbookShowreelHandle, DistilbookShowreelProps>(
  function DistilbookShowreel(
    { config: cfgOverride, height = '560px', className, autoPlay, onTimeUpdate, onSceneChange },
    ref,
  ) {
    const config: DistilbookConfig = { ...DEFAULT_DISTILBOOK_CONFIG, ...cfgOverride };
    const [playing, setPlaying] = useState(autoPlay ?? config.autoPlay);
    const [loop, setLoop] = useState(config.loop);
    const [bpm, setBpm] = useState(config.bpm);
    const [time, setTime] = useState(0);
    const [sceneId, setSceneId] = useState<DistilbookSceneId>('opening');

    const rootRef = useRef<HTMLDivElement>(null);
    const tlHandleRef = useRef<DistilbookTimelineHandle | null>(null);
    const playingRef = useRef(playing);
    playingRef.current = playing;
    const onTimeRef = useRef(onTimeUpdate);
    onTimeRef.current = onTimeUpdate;
    const onSceneRef = useRef(onSceneChange);
    onSceneRef.current = onSceneChange;

    // بناء الخط الزمني — يُعاد عند تغيير BPM أو الحلقة
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const resumeAt = tlHandleRef.current ? Math.min(tlHandleRef.current.tl.time(), DISTILBOOK_DURATION - 0.01) : 0;

      tlHandleRef.current?.destroy();
      const handle = buildDistilbookTimeline(root, {
        config: { ...config, bpm },
        loop,
        onTime: (t) => {
          setTime(t);
          onTimeRef.current?.(t);
          const s = sceneAt(t);
          setSceneId((prev) => {
            if (prev !== s.id) onSceneRef.current?.(s.id);
            return s.id;
          });
        },
      });
      tlHandleRef.current = handle;

      if (playingRef.current) {
        handle.tl.play(resumeAt);
      } else {
        handle.tl.pause(resumeAt);
      }
      return () => handle.destroy();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bpm, loop]);

    const play = useCallback(() => {
      const handle = tlHandleRef.current;
      if (!handle) return;
      if (handle.tl.time() >= DISTILBOOK_DURATION - 0.05) handle.tl.play(0);
      else handle.tl.play();
      playingRef.current = true;
      setPlaying(true);
    }, []);

    const pause = useCallback(() => {
      tlHandleRef.current?.tl.pause();
      playingRef.current = false;
      setPlaying(false);
    }, []);

    const seek = useCallback((t: number) => {
      const handle = tlHandleRef.current;
      if (!handle) return;
      handle.tl.time(Math.max(0, Math.min(t, DISTILBOOK_DURATION)));
      setTime(handle.tl.time());
      setSceneId(sceneAt(handle.tl.time()).id);
    }, []);

    useImperativeHandle(ref, () => ({ play, pause, seek, getDuration: () => DISTILBOOK_DURATION }));

    const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);

    const spec = sceneAt(time);
    const accent = spec.accent;

    return (
      <div
        data-testid="distilbook-showreel"
        className={className ?? 'relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl'}
        style={{ height }}
      >
        {/* خلفية تتنفس بلون المشهد الحالي */}
        <div
          className="pointer-events-none absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(ellipse at 50% 32%, ${accent}1c, transparent 62%)` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:64px_64px]" />

        {/* المسرح — المشاهد السبعة طبقات مطلقة */}
        <div
          ref={rootRef}
          className="absolute inset-0 overflow-hidden"
          style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
        >
          <OpeningScene brand={config.brand} tagline={config.tagline} />
          <ProblemScene />
          <DistillScene active={sceneId === 'distill' && playing} bpm={bpm} />
          <IdeasScene ideas={config.ideas} />
          <ReferencesScene />
          <SummaryScene cards={config.summaryCards} />
          <FinaleScene config={config} />
        </div>

        {/* شارات HUD */}
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2">
          <span data-testid="distilbook-scene" className="rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-black backdrop-blur" style={{ color: accent }}>
            {spec.title}
          </span>
          <span data-testid="distilbook-time" className="rounded-md bg-black/55 px-2 py-1 font-mono text-[11px] text-slate-300 backdrop-blur">
            {time.toFixed(1)}s / {DISTILBOOK_DURATION}s
          </span>
          <span className="rounded-md bg-black/55 px-2 py-1 font-mono text-[11px] text-emerald-300 backdrop-blur">{bpm} BPM</span>
        </div>

        {/* شريط التقدم */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-l from-teal-300 to-sky-500 transition-[width] duration-150"
            style={{ width: `${(time / DISTILBOOK_DURATION) * 100}%` }}
          />
        </div>

        {/* لوحة التحكم */}
        <div className="absolute bottom-4 left-1/2 flex w-[min(92%,640px)] -translate-x-1/2 flex-col gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="distilbook-play"
              onClick={toggle}
              className="rounded-lg bg-teal-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition hover:bg-teal-300"
            >
              {playing ? '⏸ إيقاف' : '▶ تشغيل'}
            </button>
            <button
              type="button"
              data-testid="distilbook-restart"
              onClick={() => { seek(0); play(); }}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              ↺ من البداية
            </button>
            <button
              type="button"
              data-testid="distilbook-loop"
              onClick={() => setLoop((l) => !l)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${loop ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-500 line-through'}`}
            >
              حلقة
            </button>

            <label className="ms-auto flex items-center gap-2 text-[11px] font-bold text-slate-400">
              الإيقاع
              <input
                type="range"
                data-testid="distilbook-bpm"
                min={80}
                max={160}
                step={2}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="h-1 w-28 accent-teal-400"
              />
            </label>
          </div>

          {/* المسح الزمني */}
          <input
            type="range"
            data-testid="distilbook-scrub"
            min={0}
            max={DISTILBOOK_DURATION}
            step={0.05}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 w-full accent-sky-400"
            aria-label="المسح الزمني"
          />
        </div>
      </div>
    );
  },
);
