/**
 * حزمة ملاحظات المعلم ومؤقت العرض — Presenter Notes & Timer
 * نموذج إضافة Reveal Notes المدمجة مع reveal.js (MIT) على نظام العروض الحالي
 */

export { PresenterWindow } from './PresenterWindow';
export type { PresenterWindowProps } from './PresenterWindow';
export { PresenterTimer, formatElapsed, wallClock } from './timer';
export { notesFor, screenInfo, slidesOf, slideById } from './notes';
export type { ScreenInfo } from './notes';
export {
  EMPTY_NOTES_HINT,
  PRESENTER_WINDOW_NAME,
  PRESENTER_WINDOW_FEATURES,
  PREVIEW_W,
  PREVIEW_H,
  PREVIEW_CURRENT_W,
  PREVIEW_NEXT_W,
  TIMER_TICK_MS,
} from './types';
export { PresenterLab } from './lab/PresenterLab';
