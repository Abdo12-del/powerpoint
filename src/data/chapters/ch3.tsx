import {
  BadgeCheck,
  CircleCheck,
  Clock,
  CodeXml,
  Cpu,
  Fingerprint,
  HardDrive,
  Info,
  KeyRound,
  LayoutDashboard,
  Rocket,
  ScrollText,
  ShieldCheck,
  Smile,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import { Badge, Term } from '@/components/ui';
import { BulletCards, ChapterPreface, ChapterSummary, CodeBlock, DataTable, StatCounters } from '@/components/archetypes';

const outline = ['التقنيات المستخدمة', 'النموذج المنطقي للبيانات', 'لوحة المتابعة والأهداف', 'الأمن وجودة الخدمة'];

const MLD_SQL = `
CREATE TABLE plat (
  code_plat   VARCHAR(6)    PRIMARY KEY,
  lib_plat    VARCHAR(80)   NOT NULL,
  prix_plat   DECIMAL(8,2)  NOT NULL CHECK (prix_plat > 0),
  temps_ref   SMALLINT      NOT NULL,            -- زمن التحضير المرجعي (دقائق)
  code_cat    CHAR(3)       NOT NULL REFERENCES categorie(code_cat)
);

CREATE TABLE commande (
  num_cmd     BIGSERIAL     PRIMARY KEY,
  date_cmd    TIMESTAMP     NOT NULL DEFAULT now(),
  etat_cmd    VARCHAR(12)   NOT NULL DEFAULT 'ENREG',
  num_table   SMALLINT      REFERENCES "table"(num_table),
  id_client   INTEGER       REFERENCES client(id_client)
);

CREATE TABLE ligne_commande (
  num_cmd     BIGINT        REFERENCES commande(num_cmd) ON DELETE CASCADE,
  code_plat   VARCHAR(6)    REFERENCES plat(code_plat),
  qte         SMALLINT      NOT NULL CHECK (qte > 0),
  prix_unit   DECIMAL(8,2)  NOT NULL,            -- السعر مُجمَّد لحظة الطلب
  pret_a      TIMESTAMP,                         -- يُملأ من مؤقّت المطبخ
  PRIMARY KEY (num_cmd, code_plat)
);
`;

/** الفصل 3 — خطة التنفيذ: كيف نُنجز؟ (أدوات، نموذج منطقي، متابعة، حماية) */
export const ch3: ChapterData = {
  id: 'ch3',
  title: 'خطة التنفيذ',
  subtitle: 'كيف نُنجز الحل تقنياً ونضمن استمراره؟',
  icon: Rocket,
  color: 'from-emerald-600/20 to-teal-400/10',
  accent: 'text-emerald-200 border-emerald-400/40',
  slides: [
    {
      id: 'ch3-preface',
      chapterId: 'ch3',
      title: 'تمهيد الفصل الثالث',
      icon: Info,
      archetype: 'chapter-preface',
      content: (
        <ChapterPreface
          number={3}
          lead="بعد تحديد الحل ونموذج بياناته، يبقى السؤال العملي: بأي أدوات نبنيه، وكيف نتابعه ونحميه بعد الإطلاق؟"
          question="كيف نحوّل التصميم إلى نظام يعمل فعلاً في مطعم النخيل، ونتحقق من أثره؟"
          outline={outline}
        />
      ),
    },
    {
      id: 'ch3-stack',
      chapterId: 'ch3',
      title: 'التقنيات المستخدمة',
      subtitle: 'اختيارات مجانية مفتوحة المصدر تعمل على شبكة المطعم المحلية',
      icon: Cpu,
      archetype: 'table',
      content: (
        <DataTable
          columns={[
            { key: 'layer', label: 'الطبقة', width: '22%' },
            { key: 'tech', label: 'التقنية', mono: true, width: '26%' },
            { key: 'role', label: 'الدور في النظام' },
            { key: 'why', label: 'سبب الاختيار', width: '24%' },
          ]}
          rows={[
            { layer: 'واجهة النادل (لوحي)', tech: 'React + PWA', role: 'تسجيل الطلب وإرساله فورياً إلى المطبخ', why: 'تعمل دون اتصال وتُثبَّت كتطبيق' },
            { layer: 'شاشة المطبخ', tech: 'React + WebSocket', role: 'قائمة الطلبات بالأولوية مع مؤقّت لكل طبق', why: 'تحديث لحظي دون إعادة تحميل' },
            { layer: 'الخادم', tech: 'Node.js + Express', role: 'قواعد التسيير، الخصم من المخزون، واجهة REST', why: 'خفيف ويعمل على حاسوب عادي' },
            { layer: 'قاعدة البيانات', tech: 'PostgreSQL 16', role: 'تخزين الطلبات والأطباق والمخزون', why: 'موثوقية وقيود تكامل قوية' },
            { layer: 'لوحة المتابعة', tech: 'Grafana', role: 'المؤشرات اليومية للمدير على الهاتف', why: 'جاهزة بلا تطوير إضافي' },
            { layer: 'الاستضافة', tech: 'Docker + NAS محلي', role: 'تشغيل كل الخدمات على شبكة المطعم', why: 'لا اعتماد على الإنترنت أو اشتراكات' },
          ]}
        />
      ),
    },
    {
      id: 'ch3-schema',
      chapterId: 'ch3',
      title: 'النموذج المنطقي للبيانات',
      subtitle: 'MLD — ترجمة النموذج المفاهيمي إلى جداول SQL',
      icon: CodeXml,
      archetype: 'code',
      content: (
        <CodeBlock
          title="schema.sql"
          language="PostgreSQL"
          code={MLD_SQL}
          highlightLines={[2, 10, 18, 19, 23]}
          aside={{
            title: 'قواعد الترجمة المطبّقة',
            points: [
              'كل كيان ← جدول، والمعرّف ← مفتاح رئيسي.',
              'علاقة (1,1)–(1,n) ← مفتاح أجنبي في جهة (1,1): الطبق يحمل رمز فئته.',
              'علاقة (n,n) «يتضمن» ← جدول وسيط ligne_commande بمفتاح مركّب.',
              'السعر يُجمَّد في سطر الطلب حتى لا تتأثر الفواتير القديمة بتغيير الأسعار.',
              'عمود pret_a هو مصدر حساب زمن التحضير الفعلي لكل طبق.',
            ],
          }}
        />
      ),
    },
    {
      id: 'ch3-dashboard',
      chapterId: 'ch3',
      title: 'لوحة المتابعة والأهداف',
      subtitle: 'المؤشرات التي ستُعرض يومياً والقيم المستهدفة بعد 6 أشهر',
      icon: LayoutDashboard,
      archetype: 'stats',
      content: (
        <StatCounters
          stats={[
            { icon: Clock, value: 15, suffix: 'دقيقة', label: 'زمن الخدمة المستهدف', tag: 'هدف', tagTone: 'success', trend: { direction: 'down', note: 'مقابل 23 دقيقة حالياً', positive: true } },
            { icon: Smile, value: 85, suffix: '%', label: 'رضا الزبائن المستهدف', tag: 'هدف', tagTone: 'success', trend: { direction: 'up', note: 'مقابل 68% حالياً', positive: true } },
            { icon: Trash2, value: 8, suffix: '%', label: 'سقف هدر المواد الأولية', tag: 'هدف', tagTone: 'success', trend: { direction: 'down', note: 'مقابل 12% حالياً', positive: true } },
            { icon: TriangleAlert, value: 2, suffix: '%', label: 'سقف الطلبات الخاطئة', tag: 'هدف', tagTone: 'success', trend: { direction: 'down', note: 'مقابل 7% حالياً', positive: true } },
            { icon: BadgeCheck, value: 100, suffix: '%', label: 'الطلبات المسجَّلة رقمياً', tag: 'شرط التشغيل', tagTone: 'accent' },
            { icon: LayoutDashboard, value: 6, label: 'مؤشرات على لوحة المدير', tag: 'يومي', tagTone: 'info' },
          ]}
        />
      ),
    },
    {
      id: 'ch3-security',
      chapterId: 'ch3',
      title: 'الأمن وجودة الخدمة',
      subtitle: 'ضمانات استمرارية النظام وثبات الجودة',
      icon: ShieldCheck,
      archetype: 'bullets',
      content: (
        <BulletCards
          items={[
            { icon: KeyRound, title: 'صلاحيات حسب الدور', description: <>نادل / طاهٍ / صندوق / مدير — كلٌّ يرى ما يخصّه فقط (<Term>RBAC</Term>).</> },
            { icon: Fingerprint, title: 'مصادقة آمنة', description: <>كلمات مرور مشفّرة بـ <Term>bcrypt</Term> ورمز PIN سريع على لوحي القاعة.</> },
            { icon: HardDrive, title: 'نسخ احتياطي يومي', description: 'نسخة آلية لقاعدة البيانات كل ليلة مع اختبار استرجاع شهري.' },
            { icon: ScrollText, title: 'سجل العمليات', description: 'كل تعديل على طلب أو سعر يُسجَّل باسم المستخدم والوقت.' },
            { icon: BadgeCheck, title: 'بطاقة الوصفة المعيارية', description: 'مكونات وزمن مرجعي لكل طبق — أساس ثبات الجودة بين الورديات.' },
            { icon: ShieldCheck, title: 'وضع الطوارئ', description: <>عند تعطّل الشبكة يعمل اللوحي محلياً ويُزامن لاحقاً <Badge tone="info" className="text-xs">PWA</Badge>.</> },
          ]}
        />
      ),
    },
    {
      id: 'ch3-conclusion',
      chapterId: 'ch3',
      title: 'خلاصة خطة التنفيذ',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: (
        <ChapterSummary
          points={[
            'حزمة تقنية مفتوحة المصدر بالكامل تعمل على شبكة المطعم دون اشتراكات.',
            'نموذج منطقي من خمسة جداول يغطي الطلب والطبق والمخزون مع تجميد الأسعار.',
            'لوحة متابعة بستة مؤشرات يومية وأهداف رقمية واضحة بعد ستة أشهر.',
            'الأمن مبني على الأدوار والسجلات والنسخ الاحتياطي، والجودة على بطاقة وصفة معيارية.',
          ]}
          answer="التنفيذ ممكن بأجهزة لوحية وشاشة مطبخ وحاسوب واحد — والقياس المستمر هو ما يضمن ألا يعود المطعم إلى الورق."
        />
      ),
    },
  ],
};
