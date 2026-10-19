import { useState, type ReactNode } from 'react';
import { ArrowRight, Code2, Database, GitBranch, PencilRuler, RefreshCw } from 'lucide-react';
import { CodeBlock } from '@/components/archetypes/CodeBlock';
import { ExcalidrawBoard } from '@/components/diagrams/ExcalidrawBoard';
import { MermaidDiagram } from '@/components/diagrams/MermaidDiagram';
import { NodeDiagram } from '@/components/diagrams/NodeDiagram';
import type { DiagramDirection, DiagramEdge, DiagramNode, DiagramPattern } from '@/components/diagrams/types';
import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import { cn } from '@/lib/cn';

const MERMAID_SAMPLES = {
  flowchart: `flowchart RL
  A[طلب جديد] --> B{البيانات مكتملة؟}
  B -- نعم --> C[إرسال الطلب]
  B -- لا --> D[استكمال النواقص]
  D --> B`,
  sequence: `sequenceDiagram
  participant API as الخادم
  participant UI as الواجهة
  participant U as المستخدم
  U->>UI: يرسل بيانات الدخول
  UI->>API: POST /login
  API-->>UI: رمز الجلسة
  UI-->>U: دخول ناجح`,
  er: `erDiagram
  COMMANDE }o--|| CLIENT : يقدّم
  COMMANDE ||--|{ LIGNE_COMMANDE : يحتوي
  PRODUIT ||--o{ LIGNE_COMMANDE : يظهر`,
  uml: `classDiagram
  class CLIENT {
    +id_client : INT
    +nom : VARCHAR
  }
  class COMMANDE {
    +num_cmd : INT
    +date_cmd : DATE
    +id_client : INT
  }
  CLIENT "1" --> "0..*" COMMANDE : يقدّم`,
} as const;

type MermaidSample = keyof typeof MERMAID_SAMPLES;

const NODE_SAMPLES: Record<DiagramPattern, { direction: DiagramDirection; nodes: DiagramNode[]; edges: DiagramEdge[] }> = {
  tree: {
    direction: 'TB',
    nodes: [
      { id: 'root', label: 'إدارة النظام', description: 'الجذر', kind: 'start' },
      { id: 'users', label: 'تسيير المستخدمين', kind: 'entity' },
      { id: 'requests', label: 'معالجة الطلبات', kind: 'entity' },
      { id: 'roles', label: 'الصلاحيات', kind: 'default' },
      { id: 'archive', label: 'الأرشيف', kind: 'end' },
    ],
    edges: [
      { source: 'root', target: 'users' },
      { source: 'root', target: 'requests' },
      { source: 'users', target: 'roles' },
      { source: 'requests', target: 'archive' },
    ],
  },
  relation: {
    direction: 'RL',
    nodes: [
      { id: 'client', label: 'الزبون', description: 'CLIENT', kind: 'entity' },
      { id: 'order', label: 'الطلب', description: 'COMMANDE', kind: 'entity' },
      { id: 'line', label: 'سطر الطلب', description: 'LIGNE_COMMANDE', kind: 'entity' },
      { id: 'product', label: 'المنتج', description: 'PRODUIT', kind: 'entity' },
    ],
    edges: [
      { source: 'client', target: 'order', label: '1 : n' },
      { source: 'order', target: 'line', label: '1 : n' },
      { source: 'product', target: 'line', label: '1 : n' },
    ],
  },
  process: {
    direction: 'RL',
    nodes: [
      { id: 'start', label: 'استلام الطلب', kind: 'start' },
      { id: 'check', label: 'فحص البيانات', kind: 'default' },
      { id: 'decision', label: 'مكتمل؟', kind: 'decision' },
      { id: 'accept', label: 'تأكيد الطلب', kind: 'end' },
      { id: 'fix', label: 'طلب استكمال', kind: 'end' },
    ],
    edges: [
      { source: 'start', target: 'check' },
      { source: 'check', target: 'decision' },
      { source: 'decision', target: 'accept', label: 'نعم' },
      { source: 'decision', target: 'fix', label: 'لا' },
    ],
  },
};

const EXCALIDRAW_SAMPLE: ExcalidrawElementSkeleton[] = [
  { type: 'rectangle', id: 'ui', x: 80, y: 125, width: 180, height: 100, label: { text: 'الواجهة' } },
  { type: 'diamond', id: 'service', x: 350, y: 125, width: 180, height: 100, label: { text: 'المعالجة' } },
  { type: 'ellipse', id: 'data', x: 630, y: 125, width: 200, height: 100, label: { text: 'قاعدة البيانات' } },
  { type: 'arrow', x: 260, y: 175, points: [[0, 0], [90, 0]] },
  { type: 'arrow', x: 540, y: 175, points: [[0, 0], [90, 0]] },
];

const DIAGRAM_TITLES: Record<DiagramPattern, string> = {
  tree: 'شجرة',
  relation: 'علاقات',
  process: 'سير إجراء',
};

/** ?lab=diagrams — practical Mermaid, Shiki, React Flow/Dagre and Excalidraw examples. */
export default function DiagramsLab() {
  const [mermaidSample, setMermaidSample] = useState<MermaidSample>('flowchart');
  const [pattern, setPattern] = useState<DiagramPattern>('process');
  const [beams, setBeams] = useState(true);
  const [replay, setReplay] = useState(0);
  const flow = NODE_SAMPLES[pattern];

  return (
    <main dir="rtl" className="min-h-full overflow-y-auto bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-amber-300">القالب · مختبر المخططات والكود</div>
            <h1 className="mt-1 text-4xl font-black">مخططات تقنية للمذكرات</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              Mermaid للنماذج النصية، Shiki للشفرة والفروق، React Flow للعقد التفاعلية، وExcalidraw للرسم الحرّ — كلها بسمة القالب وبدعم RTL.
            </p>
          </div>
          <a href={window.location.pathname} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </header>

        <section className="space-y-4" id="lab-mermaid">
          <SectionHeading icon={<GitBranch size={18} />} title="Mermaid 12 — من النص إلى المخطط" description="تدفق، تسلسل، ERD / MCD، وUML/MLD. السمة داكنة موحّدة، التسميات عربية مع عزل ثنائي الاتجاه، والروابط تُرسم بالتتابع." />
          <div className="flex flex-wrap gap-2">
            {(['flowchart', 'sequence', 'er', 'uml'] as const).map((sample) => (
              <button key={sample} type="button" onClick={() => setMermaidSample(sample)} className={pillClass(mermaidSample === sample)}>
                {sample === 'flowchart' ? 'تدفّق' : sample === 'sequence' ? 'تسلسل' : sample === 'er' ? 'كيانات وعلاقات' : 'UML / MLD'}
              </button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <CodeBlock title="diagram.mmd" language="Mermaid" code={MERMAID_SAMPLES[mermaidSample]} revealLines={false} />
            <MermaidDiagram key={mermaidSample} source={MERMAID_SAMPLES[mermaidSample]} label={`مخطط ${mermaidSample}`} minHeight={340} />
          </div>
        </section>

        <section className="space-y-4" id="lab-shiki">
          <SectionHeading icon={<Code2 size={18} />} title="Shiki 4 — شفرة وفروق واضحة" description="تلوين احترافي، تمييز أسطر، عرض unified diff، وكشف سطرٍ بعد سطر. يظهر النص الخام أولاً ثم تُحمّل اللغة المطلوبة عند الحاجة." />
          <CodeBlock
            title="schema.ts · diff"
            language="TypeScript"
            diff
            highlightLines={[4]}
            aside={{ title: 'ما الذي تغيّر؟', points: ['تحوّل الحقل إلى إلزامي.', 'حُفظت قاعدة التحقق في النموذج.', 'السطر المميّز يشرح نقطة التعديل.'] }}
            code={`@@ -1,5 +1,5 @@
 export interface Request {
-  status?: 'draft' | 'sent';
+  status: 'draft' | 'sent' | 'approved';
   createdAt: Date;
 }
`}
          />
        </section>

        <section className="space-y-4" id="lab-flow">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading icon={<WorkflowIcon />} title="React Flow + Dagre — عقد قابلة للتفاعل" description="أنماط شجرة / علاقة / إجراء، ترتيب آلي مناسب للعربية، سحب وتكبير، مع طبقة AnimatedBeam اختيارية." />
            <button type="button" onClick={() => setReplay((value) => value + 1)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15">
              <RefreshCw size={14} /> إعادة الترتيب
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(NODE_SAMPLES) as DiagramPattern[]).map((kind) => (
              <button key={kind} type="button" onClick={() => setPattern(kind)} className={pillClass(pattern === kind)}>
                {DIAGRAM_TITLES[kind]}
              </button>
            ))}
            <button type="button" onClick={() => setBeams((value) => !value)} className={pillClass(beams)}>
              <span aria-hidden className={cn('inline-block h-2 w-2 rounded-full', beams ? 'bg-amber-300' : 'bg-slate-500')} />
              AnimatedBeam {beams ? 'مفعّل' : 'متوقف'}
            </button>
          </div>
          <NodeDiagram key={`${pattern}-${replay}`} pattern={pattern} direction={flow.direction} nodes={flow.nodes} edges={flow.edges} animatedBeams={beams} interactive height={500} />
        </section>

        <section className="space-y-4" id="lab-excalidraw">
          <SectionHeading icon={<PencilRuler size={18} />} title="Excalidraw — رسم حرّ بخط اليد" description="محرر عربي اختياري؛ اللوحة للعرض فقط في الشرائح، ويمكن تفعيل التحرير وحفظ المشهد عبر onChange." />
          <ExcalidrawBoard editable elements={EXCALIDRAW_SAMPLE} height={520} />
        </section>

        <footer className="flex items-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-4 text-sm leading-relaxed text-sky-100">
          <Database className="h-4 w-4 shrink-0" aria-hidden />
          جميع الأدوات مثبّتة برخصة MIT؛ تخطيط العقد يستخدم Dagre. tldraw غير مضمّن. الدليل العملي: <code dir="ltr" className="rounded bg-black/20 px-1.5 py-0.5">docs/DIAGRAMS_CODE.md</code>.
        </footer>
      </div>
    </main>
  );
}

function WorkflowIcon() {
  return <GitBranch size={18} />;
}

function SectionHeading({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">{icon}</span>
      <div>
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 max-w-4xl text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function pillClass(active: boolean) {
  return cn(
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition',
    active ? 'bg-amber-300 text-slate-950' : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10',
  );
}
