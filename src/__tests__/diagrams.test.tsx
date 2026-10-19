import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CodeBlock } from '@/components/archetypes/CodeBlock';
import { normalizeCodeLanguage, parseDiffLine, tokenizeCode } from '@/components/archetypes/shiki';
import { ExcalidrawBoard } from '@/components/diagrams/ExcalidrawBoard';
import { NodeDiagram } from '@/components/diagrams/NodeDiagram';
import { defaultDiagramDirection, layoutWithDagre } from '@/components/diagrams/layout';
import { makePresentationMermaidConfig } from '@/components/diagrams/theme';
import type { DiagramEdge, DiagramNode } from '@/components/diagrams/types';

const render = (element: React.ReactElement) => renderToStaticMarkup(element);

describe('مكوّنات المخططات والكود التقنية', () => {
  it('Shiki يطبع أسطر الكود بشكل آمن في SSR مع التمييز وفروق Git', () => {
    const html = render(
      <CodeBlock
        title="schema.ts"
        language="TypeScript"
        code={'const status = \'draft\';\nconst count = 2;'}
        highlightLines={[2]}
        revealLines={false}
      />,
    );
    expect(html).toContain('schema.ts');
    expect(html).toContain('const status');
    expect(html).toContain('data-line="2"');
    expect(html).toContain('data-highlighted="true"');

    const diff = render(<CodeBlock language="TypeScript" diff code={'-const active = false;\n+const active = true;'} revealLines={false} />);
    expect(diff).toContain('DIFF');
    expect(diff).toContain('const active');
    expect(diff).toContain('bg-emerald-400');
    expect(diff).toContain('bg-rose-400');
  });

  it('تطبيع اللغات وتحليل unified diff يعزلان الترويسة والعلامة عن الشفرة', () => {
    expect(normalizeCodeLanguage('PostgreSQL')).toBe('sql');
    expect(normalizeCodeLanguage('TypeScript')).toBe('typescript');
    expect(parseDiffLine('@@ -2 +2 @@').kind).toBe('meta');
    expect(parseDiffLine('-  oldValue').body).toBe('  oldValue');
    expect(parseDiffLine('+  newValue')).toEqual({ kind: 'added', marker: '+', body: '  newValue' });
  });

  it('Shiki يلوّن الشفرة ويدعم diff مضمّناً مع لغة المصدر', async () => {
    const tokens = await tokenizeCode('const answer: number = 42;', 'typescript');
    expect(tokens[0].map((token) => token.content).join('')).toBe('const answer: number = 42;');
    expect(tokens[0].some((token) => token.color)).toBe(true);

    const diffTokens = await tokenizeCode('@@ -1 +1 @@\n-const n = 1;\n+const n = 2;', 'typescript', true);
    expect(diffTokens[0][0].content).toContain('@@');
    expect(diffTokens[1].map((token) => token.content).join('')).toBe('const n = 1;');
    expect(diffTokens[2].map((token) => token.content).join('')).toBe('const n = 2;');
  });

  it('Mermaid يعتمد سمة القالب الآمنة وقواعد RTL والحد من حجم الرسم', () => {
    const config = makePresentationMermaidConfig();
    expect(config.theme).toBe('base');
    expect(config.securityLevel).toBe('strict');
    expect(config.secure).toContain('themeVariables');
    expect(config.secure).toContain('securityLevel');
    expect(config.layout).toBe('dagre');
    expect(config.htmlLabels).toBe(true);
    expect(config.themeCSS).toContain('unicode-bidi: plaintext');
    expect(config.themeVariables?.primaryColor).toBe('#0f172a');
    expect(config.maxEdges).toBe(120);
  });

  it('Dagre ينسّق العقد آلياً مع اتجاه RTL ولا يغيّر بياناتها الأصلية', async () => {
    const nodes: DiagramNode[] = [
      { id: 'source', label: 'المصدر' },
      { id: 'target', label: 'الهدف' },
    ];
    const edges: DiagramEdge[] = [{ source: 'source', target: 'target' }];
    const placed = await layoutWithDagre(nodes, edges, { direction: 'RL' });
    expect(placed[0].position!.x).toBeGreaterThan(placed[1].position!.x);
    expect(nodes[0].position).toBeUndefined();
    expect(defaultDiagramDirection('process')).toBe('RL');
    expect(defaultDiagramDirection('tree')).toBe('TB');
  });

  it('React Flow وExcalidraw كسولان، وتظهر واجهة انتظار مفهومة قبل تحميلهما', () => {
    const nodes = [{ id: 'a', label: 'الواجهة' }];
    expect(render(<NodeDiagram nodes={nodes} edges={[]} height={320} />)).toContain('جارٍ تحميل مخطط العقد');
    expect(render(<ExcalidrawBoard height={320} />)).toContain('جارٍ تحميل لوحة الرسم');
  });
});
