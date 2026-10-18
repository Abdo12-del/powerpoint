import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Info } from 'lucide-react';
import {
  BulletCards,
  ChapterPreface,
  ChapterSummary,
  CodeBlock,
  Comparison,
  DataTable,
  OrgTree,
  ProcessFlow,
  ProfileCard,
  RelationDiagram,
  StatCounters,
  Timeline,
} from '@/components/archetypes';
import { Placeholder } from '@/components/ui';

/** كل نمط من العشرة يُعرض ببيانات دنيا ويُظهر نصوصه — يحمي المكونات بعد إفراغ القالب. */
describe('الأنماط العشرة تُعرض ببيانات دنيا', () => {
  it('1. ProfileCard', () => {
    const html = renderToStaticMarkup(<ProfileCard name="المؤسسة" description="وصف" facts={[{ label: 'التأسيس', value: '2012', icon: Info }]} />);
    expect(html).toContain('المؤسسة');
    expect(html).toContain('2012');
  });

  it('2. BulletCards (يقتطع عند 6 عناصر)', () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ title: `عنصر ${i + 1}` }));
    const html = renderToStaticMarkup(<BulletCards items={items} />);
    expect(html).toContain('عنصر 6');
    expect(html).not.toContain('عنصر 7');
  });

  it('3. Timeline أفقي ورأسي', () => {
    const items = [{ label: '2020', title: 'البداية' }, { label: '2024', title: 'التوسع', highlight: true }];
    expect(renderToStaticMarkup(<Timeline items={items} />)).toContain('التوسع');
    expect(renderToStaticMarkup(<Timeline items={items} orientation="vertical" />)).toContain('2020');
  });

  it('4. OrgTree', () => {
    const html = renderToStaticMarkup(<OrgTree root={{ label: 'المدير', children: [{ label: 'المصلحة أ', children: [{ label: 'العون' }] }, { label: 'المصلحة ب' }] }} />);
    for (const t of ['المدير', 'المصلحة أ', 'المصلحة ب', 'العون']) expect(html).toContain(t);
  });

  it('5. Comparison', () => {
    const html = renderToStaticMarkup(<Comparison fromTitle="قبل" toTitle="بعد" pairs={[{ from: 'ورقي', to: 'رقمي' }]} />);
    for (const t of ['قبل', 'بعد', 'ورقي', 'رقمي']) expect(html).toContain(t);
  });

  it('6. ProcessFlow', () => {
    const html = renderToStaticMarkup(<ProcessFlow steps={[{ title: 'استقبال', meta: '2 د' }, { title: 'تحضير', highlight: true }]} />);
    expect(html).toContain('الخطوة 1');
    expect(html).toContain('2 د');
  });

  it('7. DataTable', () => {
    const html = renderToStaticMarkup(
      <DataTable caption="المصدر" columns={[{ key: 'code', label: 'الرمز', mono: true }, { key: 'label', label: 'التسمية' }]} rows={[{ code: 'NUM_CMD', label: 'رقم الطلب' }]} />,
    );
    expect(html).toContain('NUM_CMD');
    expect(html).toContain('رقم الطلب');
    expect(html).toContain('المصدر');
  });

  it('8. RelationDiagram', () => {
    const html = renderToStaticMarkup(
      <RelationDiagram
        entities={[{ id: 'a', name: 'زبون', attributes: ['id_client'], x: 20, y: 50 }, { id: 'b', name: 'طلب', attributes: ['num_cmd'], x: 80, y: 50 }]}
        relations={[{ from: 'a', to: 'b', label: 'يقدّم', fromCard: '1,n', toCard: '1,1' }]}
      />,
    );
    for (const t of ['زبون', 'طلب', 'يقدّم', '1,n']) expect(html).toContain(t);
  });

  it('9. CodeBlock بأرقام أسطر وشرح جانبي', () => {
    const html = renderToStaticMarkup(<CodeBlock title="schema.sql" language="SQL" code={'CREATE TABLE t (\n  id INT\n);'} highlightLines={[1]} aside={{ title: 'ملاحظات', points: ['نقطة'] }} />);
    expect(html).toContain('CREATE TABLE t (');
    expect(html).toContain('schema.sql');
    expect(html).toContain('ملاحظات');
  });

  it('10. StatCounters', () => {
    const html = renderToStaticMarkup(<StatCounters stats={[{ value: 85, suffix: '%', label: 'الرضا', tag: 'هدف', trend: { direction: 'up', note: 'مقابل 68%' } }]} />);
    expect(html).toContain('الرضا');
    expect(html).toContain('مقابل 68%');
  });

  it('شريحتا الحصر: ChapterPreface و ChapterSummary', () => {
    expect(renderToStaticMarkup(<ChapterPreface number={1} lead="تمهيد" question="سؤال؟" outline={['أ', 'ب']} />)).toContain('سؤال؟');
    expect(renderToStaticMarkup(<ChapterSummary points={['١', '٢', '٣']} answer="الإجابة" nextHint="التالي" />)).toContain('الإجابة');
  });

  it('Placeholder يعرض الأنماط العشرة كتذكير', () => {
    const html = renderToStaticMarkup(<Placeholder suggested="bullets" />);
    expect(html).toContain('شريحة فارغة');
    for (const c of ['ProfileCard', 'BulletCards', 'Timeline', 'OrgTree', 'Comparison', 'ProcessFlow', 'DataTable', 'RelationDiagram', 'CodeBlock', 'StatCounters'])
      expect(html).toContain(c);
    expect(renderToStaticMarkup(<Placeholder compact hint="تلميح" />)).toContain('تلميح');
  });
});
