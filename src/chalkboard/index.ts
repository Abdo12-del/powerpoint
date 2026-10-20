/**
 * حزمة السبورة والتعليق — Chalkboard & Annotation
 * منفذة بنموذج إضافة chalkboard من reveal.js-plugins (MIT) على نظام العروض الحالي
 */

export { useChalkboard } from './useChalkboard';
export type { ChalkboardController } from './controller-types';
export { ChalkboardOverlay, ChalkboardToolbar } from './ChalkboardOverlay';
export { ChalkboardCanvas } from './ChalkboardCanvas';
export { ChalkboardStore, loadPersist, savePersist, clearPersisted, STORAGE_KEY } from './store';
export { drawStroke, renderStrokes, simplifyPoints, strokesToPNG, downloadDataURL } from './renderer';
export {
  CHALK_COLORS,
  MARKER_COLORS,
  STROKE_WIDTHS,
  INITIAL_BOARD_PAGES,
  DEFAULT_TOOL,
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  ERASER_SCALE,
} from './types';
export type { ChalkTool, ChalkboardMode, ChalkPoint, ChalkStroke, ChalkColorOption, ChalkboardPersist } from './types';
export { ChalkboardLab } from './lab/ChalkboardLab';
