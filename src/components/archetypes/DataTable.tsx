import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Stagger, fadeUp } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface DataColumn {
  key: string;
  label: string;
  /** للمعرفات والأكواد: LTR + mono */
  mono?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: string;
}

export interface DataTableProps {
  columns: DataColumn[];
  rows: Record<string, ReactNode>[];
  caption?: string;
  /** تكثيف الصفوف للجداول الطويلة */
  dense?: boolean;
}

/** النمط 7 — جدول/بطاقات بيانات: قاموس المعطيات، المقارنات الكمية. */
export function DataTable({ columns, rows, caption, dense }: DataTableProps) {
  return (
    <div className="flex h-full flex-col justify-center">
      <Stagger stagger={0.05} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full border-collapse text-start">
          {caption && <caption className="px-4 py-3 text-start text-sm text-slate-400">{caption}</caption>}
          <thead>
            <tr className="bg-white/[0.06] text-sm text-slate-300">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width }}
                  className={cn('px-4 py-3 font-bold', c.align === 'center' ? 'text-center' : c.align === 'end' ? 'text-end' : 'text-start')}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr key={i} variants={fadeUp} className="border-t border-white/[0.06] odd:bg-white/[0.015]">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    dir={c.mono ? 'ltr' : undefined}
                    className={cn(
                      'px-4 align-top',
                      dense ? 'py-2 text-[15px]' : 'py-3',
                      c.mono && 'font-mono text-sm text-sky-200',
                      c.align === 'center' ? 'text-center' : c.align === 'end' ? 'text-end' : 'text-start',
                    )}
                  >
                    {row[c.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Stagger>
    </div>
  );
}
