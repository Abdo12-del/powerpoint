/**
 * مؤقت العرض — منطق نقي حتمي (بلا DOM ولا React)
 * وحدات الثواني تُمرَّر من المستدعي (performance.now()/1000 في الواجهة)
 * فيبقى الاختبار ومعاينة الإطارات حتميين تماماً.
 */

/** تنسيق الوقت المنقضي: MM:SS أو H:MM:SS إن تجاوزت ساعة */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * مؤقت المعلم: تشغيل/إيقاف مؤقت/تصفير — يجمع الفترات ويجمد الزمن عند الإيقاف
 */
export class PresenterTimer {
  private base = 0;
  private startedAt: number | null = null;

  /** بدء/استئناف العدّ */
  start(now: number): void {
    if (this.startedAt === null) this.startedAt = now;
  }

  /** إيقاف مؤقت — يجمّد الزمن ويحفظ المجموع */
  pause(now: number): void {
    if (this.startedAt !== null) {
      this.base += now - this.startedAt;
      this.startedAt = null;
    }
  }

  /** تصفير كامل مع إيقاف العدّ */
  reset(): void {
    this.base = 0;
    this.startedAt = null;
  }

  get running(): boolean {
    return this.startedAt !== null;
  }

  /** الزمن المنقضي بالثواني لحظة now */
  elapsed(now: number): number {
    return this.base + (this.startedAt === null ? 0 : Math.max(0, now - this.startedAt));
  }

  /** الوقت المنسّق لحظة now */
  formatted(now: number): string {
    return formatElapsed(this.elapsed(now));
  }
}

/** ساعة الحائط الحالية بصيغة HH:MM (للعرض في نافذة المعلم) */
export function wallClock(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
