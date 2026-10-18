import { motion } from 'framer-motion';
import { Stagger, popIn } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface Entity {
  id: string;
  name: string;
  /** الخصائص؛ الأولى تُعتبر المفتاح (تُسطَّر) */
  attributes: string[];
  /** الموضع بالنسبة المئوية داخل اللوحة (0–100) */
  x: number;
  y: number;
}

export interface Relation {
  from: string;
  to: string;
  /** اسم العلاقة: «يقدّم» */
  label: string;
  /** الكاردينالية عند الطرفين: «1,n» */
  fromCard: string;
  toCard: string;
}

export interface RelationDiagramProps {
  entities: Entity[];
  relations: Relation[];
  /** نسبة أبعاد اللوحة */
  aspect?: string;
}

/** النمط 8 — مخطط علائقي: كيانات + خطوط ربط + تسميات (MCD / ER). */
export function RelationDiagram({ entities, relations, aspect = '16 / 8' }: RelationDiagramProps) {
  const byId = new Map(entities.map((e) => [e.id, e]));
  return (
    <div className="flex h-full items-center justify-center">
      <Stagger className="relative w-full max-w-5xl" style={{ aspectRatio: aspect }}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {relations.map((r) => {
            const a = byId.get(r.from);
            const b = byId.get(r.to);
            if (!a || !b) return null;
            return (
              <motion.line
                key={`${r.from}-${r.to}-${r.label}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(251,191,36,0.55)"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            );
          })}
        </svg>

        {relations.map((r) => {
          const a = byId.get(r.from);
          const b = byId.get(r.to);
          if (!a || !b) return null;
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const nearA = { x: a.x + (b.x - a.x) * 0.22, y: a.y + (b.y - a.y) * 0.22 };
          const nearB = { x: a.x + (b.x - a.x) * 0.78, y: a.y + (b.y - a.y) * 0.78 };
          return (
            <div key={`lbl-${r.from}-${r.to}-${r.label}`}>
              <motion.span
                variants={popIn}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/40 bg-slate-950 px-3 py-1 text-sm font-bold text-amber-200 shadow"
                style={{ left: `${mid.x}%`, top: `${mid.y}%` }}
              >
                {r.label}
              </motion.span>
              <span
                dir="ltr"
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-slate-950/90 px-1.5 font-mono text-xs text-sky-200"
                style={{ left: `${nearA.x}%`, top: `${nearA.y}%` }}
              >
                {r.fromCard}
              </span>
              <span
                dir="ltr"
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-slate-950/90 px-1.5 font-mono text-xs text-sky-200"
                style={{ left: `${nearB.x}%`, top: `${nearB.y}%` }}
              >
                {r.toCard}
              </span>
            </div>
          );
        })}

        {entities.map((e) => (
          <motion.div
            key={e.id}
            variants={popIn}
            className="absolute w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-sky-400/40 bg-slate-900 shadow-xl"
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            <div className="bg-sky-400/15 px-3 py-1.5 text-center font-extrabold text-sky-100">{e.name}</div>
            <ul className="px-3 py-2 text-sm leading-6">
              {e.attributes.map((attr, i) => (
                <li key={attr} dir="ltr" className={cn('text-start font-mono text-[12px] text-slate-200', i === 0 && 'underline decoration-amber-300/70 underline-offset-2')}>
                  {attr}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </Stagger>
    </div>
  );
}
