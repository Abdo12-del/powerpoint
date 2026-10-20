import type { ChalkboardMode, ChalkStroke, ChalkTool } from './types';

/**
 * واجهة تحكم السبورة — عقد مشترك بين العرض المباشر والمختبر
 */
export interface ChalkboardController {
  /** نمط العمل الحالي */
  mode: ChalkboardMode;
  tool: ChalkTool;
  color: string;
  size: number;
  /** صفحة السبورة الحالية (0-based) */
  boardPage: number;
  boardPageCount: number;
  /** يرتفع مع كل تعديل — استعمله مفتاح إعادة رسم */
  revision: number;

  setTool: (t: ChalkTool) => void;
  setColor: (c: string) => void;
  setSize: (s: number) => void;
  /** تسجيل الشاشة الفعّالة — تُستعمل في التراجع/المسح/التصدير */
  setLayer: (layerKey: string) => void;

  notesFor: (layerKey: string) => ChalkStroke[];
  commitNote: (layerKey: string, stroke: ChalkStroke) => void;
  boardStrokesFor: (page: number) => ChalkStroke[];
  commitBoardStroke: (page: number, stroke: ChalkStroke) => void;

  nextPage: () => void;
  prevPage: () => void;
  undo: () => void;
  clear: () => void;

  toggleNotes: () => void;
  toggleBoard: () => void;
  close: () => void;

  exportPNG: () => void;
  /** مسح كل الرسومات والحفظ المحلي (للمختبر) */
  resetAll: () => void;
}
