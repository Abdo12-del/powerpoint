import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { SHORTCUTS } from '@/config/controls';

/** نافذة اختصارات لوحة المفاتيح (تُفتح بـ ? أو H). */
export function KeyboardHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-label="اختصارات لوحة المفاتيح"
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Keyboard className="h-5 w-5 text-amber-300" /> اختصارات لوحة المفاتيح
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-2.5">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-200">{s.label}</span>
                  <span dir="ltr" className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-xs text-slate-100">
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-400">
              يمكن التنقل أيضاً بالفأرة (أزرار شريط التحكم وبطاقات الخريطة) وباللمس (سحب يميناً/يساراً).
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
