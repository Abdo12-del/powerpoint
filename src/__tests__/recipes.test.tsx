// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Database, Globe, Monitor, Server, Shield } from 'lucide-react';
import * as recipes from '@/recipes';
import { StatsCountUp, RelationBeams, TitleHero, CodeTerminal, TimelineDraw, EcosystemOrbit, GsapTitleTimeline, BeforeAfterCompare } from '@/recipes';

const r = (el: React.ReactElement) => renderToStaticMarkup(el);

describe('الوصفات الجاهزة (src/recipes) تُعرض وتحترم القواعد', () => {
  it('الفهرس يصدّر 8 وصفات', () => {
    expect(Object.keys(recipes)).toHaveLength(8);
  });

  it('StatsCountUp: عدّادات + حلقة، الأرقام في حاوية LTR', () => {
    const html = r(<StatsCountUp stats={[{ label: 'مستخدم', value: 1250, suffix: '+' }, { label: 'رضا', value: 92.5, suffix: '%', decimals: 1 }]} ring={{ label: 'إنجاز', value: 80 }} />);
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('مستخدم');
    expect(html).toContain('80');
  });

  it('RelationBeams: عقد + أشعة بعدد الروابط', () => {
    const html = r(
      <RelationBeams
        nodes={[{ id: 'ui', label: 'الواجهة', icon: Monitor }, { id: 'api', label: 'الخادم', icon: Server }, { id: 'db', label: 'قاعدة البيانات', icon: Database }]}
        edges={[['ui', 'api'], ['api', 'db']]}
      />,
    );
    expect(html).toContain('الواجهة');
    expect((html.match(/<svg/g) ?? []).length).toBeGreaterThanOrEqual(2 + 3); // شعاعان + أيقونات lucide
  });

  it('TitleHero: العنوان بالكلمات لا بالحروف', () => {
    const html = r(<TitleHero title="تصميم نظام معلوماتي" rotating={['سريع', 'موثوق']} ctaLabel="ابدأ" />);
    expect(html).toContain('>تصميم<');
    expect(html).not.toContain('>ت<');
    expect(html).toContain('ابدأ');
  });

  it('CodeTerminal: طرفية LTR بأسطر مكتوبة ومخرجات', () => {
    const html = r(<CodeTerminal lines={[{ type: 'cmd', text: 'npm run check' }, { type: 'ok', text: '✔ passed' }, { type: 'err', text: '✖ failed' }]} />);
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('<pre');
    expect(html).toContain('text-emerald-400');
  });

  it('TimelineDraw: خط SVG واحد ومحطات بعدد العناصر، من اليمين إلى اليسار', () => {
    const ms = [{ id: 'a', label: 'أ', date: '2023' }, { id: 'b', label: 'ب', date: '2024' }, { id: 'c', label: 'ج' }];
    const html = r(<TimelineDraw milestones={ms} />);
    expect((html.match(/<circle/g) ?? []).length).toBe(3);
    expect(html).toContain('<line');
    const cx = [...html.matchAll(/cx="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(cx[0]).toBeGreaterThan(cx[1]);
    expect(cx[1]).toBeGreaterThan(cx[2]);
  });

  it('EcosystemOrbit: حلقتان مداريتان', () => {
    const html = r(<EcosystemOrbit center={{ icon: Server, label: 'النظام' }} inner={[Database, Shield]} outer={[Globe]} />);
    expect((html.match(/animate-orbit/g) ?? []).length).toBe(3);
    expect(html).toContain('النظام');
  });

  it('GsapTitleTimeline و BeforeAfterCompare تُعرض', () => {
    expect(r(<GsapTitleTimeline title="عنوان من ثلاث كلمات" items={['أ', 'ب', 'ج']} badge="شارة" />)).toContain('gsap-title');
    const cmp = r(<BeforeAfterCompare before={{ src: '/a.png', caption: 'قبل' }} after={{ src: '/b.png', caption: 'بعد' }} />);
    expect(cmp).toContain('alt="قبل"');
    expect(cmp).toContain('alt="بعد"');
  });
});
