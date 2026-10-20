import { useEffect } from 'react';
import { KEYS } from '@/config/controls';

export interface KeyboardHandlers {
  next: () => void;
  prev: () => void;
  map: () => void;
  escape: () => void;
  fullscreen: () => void;
  help: () => void;
  /** تبديل التعليق فوق الشريحة (C) */
  annotate?: () => void;
  /** تبديل السبورة المستقلة (B) */
  chalkboard?: () => void;
  /** مسح رسم الطبقة الحالية (Delete) */
  clearDrawing?: () => void;
}

const INTERACTIVE = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * عقد التحكم الإلزامي (§6):
 * → / Enter / Space: التالي | ←: السابق | ↓ / m / Esc: الخريطة | F: ملء الشاشة
 * (الأحرف العربية المقابلة على لوحة المفاتيح مدعومة أيضاً — انظر config/controls.ts)
 */
export function useKeyboardControls(handlers: KeyboardHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (INTERACTIVE.has(target.tagName) || target.isContentEditable)) return;

      // Enter/Space على زر مُركَّز يُنفَّذان بواسطة الزر نفسه — نتجنّب التنفيذ المزدوج.
      const onButton = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;
      if ((e.key === 'Enter' || e.key === ' ') && onButton) return;

      if (KEYS.next.includes(e.key)) {
        e.preventDefault();
        handlers.next();
      } else if (KEYS.prev.includes(e.key)) {
        e.preventDefault();
        handlers.prev();
      } else if (KEYS.escape.includes(e.key)) {
        e.preventDefault();
        handlers.escape();
      } else if (KEYS.map.includes(e.key)) {
        e.preventDefault();
        handlers.map();
      } else if (KEYS.fullscreen.includes(e.key)) {
        e.preventDefault();
        handlers.fullscreen();
      } else if (KEYS.help.includes(e.key)) {
        e.preventDefault();
        handlers.help();
      } else if (KEYS.annotate.includes(e.key) && handlers.annotate) {
        e.preventDefault();
        handlers.annotate();
      } else if (KEYS.chalkboard.includes(e.key) && handlers.chalkboard) {
        e.preventDefault();
        handlers.chalkboard();
      } else if (KEYS.clearDrawing.includes(e.key) && handlers.clearDrawing) {
        e.preventDefault();
        handlers.clearDrawing();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers, enabled]);
}
