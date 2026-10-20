/**
 * ساعة الإيقاع — Beat Clock
 * تزامن الحركة مع الإيقاع: طور النبضة 0..1، فهرس النبضة، وبيئة اضمحلال أسّية
 * تُستعمل لدفع نبضات الكاميرا والجسيمات والتوهج في مشاهد Three.js
 */

export interface BeatEvent {
  /** فهرس النبضة (يبدأ من 0) */
  index: number;
  /** الزمن بالثواني منذ بدء الساعة */
  time: number;
  /** الشدة 0..1 (كل نبضة رابعة أقوى — «الداون-بيت») */
  intensity: number;
}

export class BeatClock {
  private _bpm: number;
  private startedAt = 0;
  private lastBeatIndex = -1;
  private lastBeatTime = 0;
  running = false;

  constructor(bpm = 128) {
    this._bpm = BeatClock.clampBpm(bpm);
  }

  static clampBpm(v: number): number {
    return Math.max(20, Math.min(300, v));
  }

  get bpm(): number {
    return this._bpm;
  }

  set bpm(v: number) {
    this._bpm = BeatClock.clampBpm(v);
  }

  /** مدة النبضة الواحدة بالثواني */
  get beatDuration(): number {
    return 60 / this.bpm;
  }

  /** فهرس النبضة الحالية عند زمن معيّن */
  indexAt(time: number): number {
    return Math.floor(time / this.beatDuration);
  }

  /** طور النبضة الحالية 0..1 */
  phaseAt(time: number): number {
    return (time % this.beatDuration) / this.beatDuration;
  }

  /** بيئة الاضمحلال بعد النبضة — 1 لحظة النبضة ثم تتلاشى أسّياً */
  envAt(time: number, halfLife = 0.14): number {
    const since = time - this.lastBeatTime;
    if (since < 0) return 0;
    return Math.pow(0.5, since / halfLife);
  }

  start(now: number = performance.now() / 1000): void {
    this.startedAt = now;
    this.lastBeatIndex = -1;
    this.lastBeatTime = now;
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  /**
   * تحديث الساعة — يُستدعى من حلقة الرسم، يطلق onBeat عند عبور حدود النبضات
   */
  update(
    now: number,
    onBeat?: (e: BeatEvent) => void,
  ): void {
    if (!this.running) return;
    const time = now - this.startedAt;
    const index = this.indexAt(time);
    if (index > this.lastBeatIndex) {
      this.lastBeatIndex = index;
      this.lastBeatTime = now;
      // كل نبضة رابعة أقوى (داون-بيت) — 1.0 / 0.6
      const intensity = index % 4 === 0 ? 1 : 0.6;
      onBeat?.({ index, time, intensity });
    }
  }
}

/**
 * خط زمني للمشاهد (Shots) — يحدد شكل الكاميرا والإبراز في كل مقطع من الشورييل
 */
export interface Shot {
  id: 'shapes' | 'morph' | 'storm' | 'finale';
  /** بداية المقطع بالثواني */
  start: number;
  /** نهاية المقطع بالثواني */
  end: number;
  /** نصف قطر مدار الكاميرا */
  radius: number;
  /** ارتفاع الكاميرا */
  height: number;
  /** سرعة دوران الكاميرا حول المركز (راديان/ثانية) */
  orbitSpeed: number;
  /** ما يُبرَز في هذا المقطع */
  emphasis: 'ring' | 'blob' | 'particles' | 'all';
}

export const SHOWREEL_SHOTS: Shot[] = [
  { id: 'shapes', start: 0, end: 4, radius: 7.2, height: 2.4, orbitSpeed: 0.22, emphasis: 'ring' },
  { id: 'morph', start: 4, end: 8, radius: 4.4, height: 1.3, orbitSpeed: 0.34, emphasis: 'blob' },
  { id: 'storm', start: 8, end: 12, radius: 5.6, height: 3.4, orbitSpeed: 0.5, emphasis: 'particles' },
  { id: 'finale', start: 12, end: 16, radius: 6.8, height: 2.0, orbitSpeed: 0.18, emphasis: 'all' },
];

export const SHOWREEL_LOOP_DURATION = 16;

/** إرجاع المقطع عند زمن معيّن (يلف حلقيّاً) */
export function shotAt(time: number, shots: Shot[] = SHOWREEL_SHOTS): Shot {
  const total = shots[shots.length - 1].end;
  const t = ((time % total) + total) % total;
  return shots.find((s) => t >= s.start && t < s.end) ?? shots[0];
}

/** هل نحن داخل نافذة انتقال بين مقطعين؟ — يرجع 0..1 (شدّة الانتقال) */
export function transitionIntensity(time: number, window = 0.45, shots: Shot[] = SHOWREEL_SHOTS): number {
  const shot = shotAt(time, shots);
  const total = shots[shots.length - 1].end;
  const t = ((time % total) + total) % total;
  const sinceStart = t - shot.start;
  if (sinceStart >= 0 && sinceStart < window && shot.id !== shots[0].id) {
    // منحنى اضمحلال سريع بعد القص
    return 1 - sinceStart / window;
  }
  return 0;
}

/** استيفاء سلس بين معاملين بمقطع smoothstep */
export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
