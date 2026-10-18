import {
  Activity,
  ChartColumn,
  CircleCheck,
  Clock,
  Database,
  Hourglass,
  Info,
  Milestone,
  Receipt,
  Repeat,
  Smile,
  Table2,
  Trash2,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import { Badge, Num } from '@/components/ui';
import { ChapterPreface, ChapterSummary, DataTable, RelationDiagram, StatCounters, Timeline } from '@/components/archetypes';

const outline = ['مؤشرات الأداء الحالية', 'تدفق الطلبات في وقت الذروة', 'قاموس المعطيات', 'النموذج المفاهيمي للبيانات', 'مراحل التحسين المقترحة'];

/** الفصل 2 — الدراسة التحليلية: ما الحل؟ (أرقام، بيانات، نماذج) */
export const ch2: ChapterData = {
  id: 'ch2',
  title: 'الدراسة التحليلية',
  subtitle: 'ماذا تقول الأرقام؟ وما شكل الحل المناسب؟',
  icon: ChartColumn,
  color: 'from-violet-600/20 to-fuchsia-400/10',
  accent: 'text-violet-200 border-violet-400/40',
  slides: [
    {
      id: 'ch2-preface',
      chapterId: 'ch2',
      title: 'تمهيد الفصل الثاني',
      icon: Info,
      archetype: 'chapter-preface',
      content: (
        <ChapterPreface
          number={2}
          lead="بعد أن رأينا كيف يسير العمل، ننتقل من الملاحظة إلى القياس: ما حجم المشكلة بالأرقام؟ وما البيانات التي يحتاجها الحل؟"
          question="ما المؤشرات التي تؤكد التشخيص، وما نموذج البيانات الذي يبنى عليه الحل؟"
          outline={outline}
        />
      ),
    },
    {
      id: 'ch2-kpis',
      chapterId: 'ch2',
      title: 'مؤشرات الأداء الحالية',
      subtitle: 'نتائج القياس الميداني على مدى 6 أسابيع',
      icon: Activity,
      archetype: 'stats',
      content: (
        <StatCounters
          stats={[
            { icon: Clock, value: 23, suffix: 'دقيقة', label: 'متوسط زمن الخدمة', tag: 'مُقاس', tagTone: 'info', trend: { direction: 'up', note: 'يصل إلى 35 دقيقة في الذروة', positive: false } },
            { icon: Smile, value: 68, suffix: '%', label: 'نسبة رضا الزبائن', tag: 'استبيان 120', tagTone: 'info', trend: { direction: 'down', note: '31% لا ينوون العودة بسبب الانتظار', positive: false } },
            { icon: Trash2, value: 12, suffix: '%', label: 'هدر المواد الأولية شهرياً', tag: 'سجلات المشتريات', tagTone: 'info' },
            { icon: Receipt, value: 320, label: 'طلب يومياً في المتوسط', tag: '3 أشهر', tagTone: 'neutral' },
            { icon: TriangleAlert, value: 7, suffix: '%', label: 'طلبات بها خطأ أو إعادة', tag: 'مُقاس', tagTone: 'warning' },
            { icon: Repeat, value: 2.1, decimals: 1, label: 'معدل دوران الطاولة في الغداء', tag: 'مرة / خدمة', tagTone: 'neutral' },
          ]}
        />
      ),
    },
    {
      id: 'ch2-peak-flow',
      chapterId: 'ch2',
      title: 'تدفق الطلبات في وقت الذروة',
      subtitle: 'متوسط الطلبات في الساعة خلال خدمة الغداء',
      icon: Hourglass,
      archetype: 'timeline',
      content: (
        <Timeline
          items={[
            { label: '11:30', title: 'بداية الخدمة', description: <>≈ <Num>12</Num> طلباً / ساعة — المطبخ مرتاح.</> },
            { label: '12:00', title: 'تصاعد الطلب', description: <>≈ <Num>25</Num> طلباً / ساعة — بداية تجميع الأوراق.</> },
            { label: '12:30', title: 'الذروة القصوى', description: <>≈ <Num>58</Num> طلباً / ساعة — زمن الانتظار يبلغ 35 دقيقة.</>, highlight: true, icon: TriangleAlert },
            { label: '13:00', title: 'تكدّس في المطبخ', description: <>≈ <Num>46</Num> طلباً / ساعة — أخطاء الطلبات في أعلاها.</> },
            { label: '13:30', title: 'انفراج تدريجي', description: <>≈ <Num>30</Num> طلباً / ساعة — عودة الزمن إلى 18 دقيقة.</> },
            { label: '14:00', title: 'نهاية الذروة', description: <>≈ <Num>14</Num> طلباً / ساعة.</> },
          ]}
        />
      ),
    },
    {
      id: 'ch2-data-dictionary',
      chapterId: 'ch2',
      title: 'قاموس المعطيات',
      subtitle: 'أهم المعطيات المستخرجة من دراسة الوثائق (مقتطف)',
      icon: Table2,
      archetype: 'table',
      content: (
        <DataTable
          dense
          caption="المصدر: دفتر الطلبات، فاتورة الصندوق، بطاقة المخزون"
          columns={[
            { key: 'code', label: 'الرمز', mono: true, width: '16%' },
            { key: 'label', label: 'التسمية', width: '24%' },
            { key: 'type', label: 'النوع', mono: true, width: '14%' },
            { key: 'len', label: 'الطول', align: 'center', width: '10%' },
            { key: 'rule', label: 'قاعدة التسيير / ملاحظة' },
          ]}
          rows={[
            { code: 'NUM_CMD', label: 'رقم الطلب', type: 'N', len: 8, rule: <>معرّف فريد يُولَّد آلياً — <Badge tone="accent" className="text-xs">مفتاح</Badge></> },
            { code: 'DATE_CMD', label: 'تاريخ ووقت الطلب', type: 'DATETIME', len: '—', rule: 'يُسجَّل لحظة الإدخال؛ أساس حساب زمن الخدمة' },
            { code: 'NUM_TABLE', label: 'رقم الطاولة', type: 'N', len: 2, rule: 'من 1 إلى 40؛ فارغ للطلبات الخارجية' },
            { code: 'CODE_PLAT', label: 'رمز الطبق', type: 'AN', len: 6, rule: 'مرجع بطاقة الوصفة المعيارية' },
            { code: 'QTE', label: 'الكمية', type: 'N', len: 2, rule: 'أكبر من صفر؛ تُخصم من المخزون آلياً' },
            { code: 'PRIX_PLAT', label: 'سعر الطبق', type: 'DECIMAL', len: '8,2', rule: 'بالدينار؛ يُجمَّد في سطر الطلب عند التسجيل' },
            { code: 'ETAT_CMD', label: 'حالة الطلب', type: 'ENUM', len: '—', rule: 'مسجَّل ← قيد التحضير ← جاهز ← مُسلَّم ← مدفوع' },
          ]}
        />
      ),
    },
    {
      id: 'ch2-model',
      chapterId: 'ch2',
      title: 'النموذج المفاهيمي للبيانات',
      subtitle: 'MCD — الكيانات والعلاقات الأساسية',
      icon: Database,
      archetype: 'relation',
      content: (
        <RelationDiagram
          entities={[
            { id: 'client', name: 'زبون CLIENT', attributes: ['id_client', 'nom', 'telephone'], x: 14, y: 28 },
            { id: 'commande', name: 'طلب COMMANDE', attributes: ['num_cmd', 'date_cmd', 'etat_cmd'], x: 50, y: 28 },
            { id: 'table', name: 'طاولة TABLE', attributes: ['num_table', 'capacite', 'zone'], x: 86, y: 28 },
            { id: 'plat', name: 'طبق PLAT', attributes: ['code_plat', 'lib_plat', 'prix_plat', 'temps_ref'], x: 50, y: 78 },
            { id: 'categorie', name: 'فئة CATEGORIE', attributes: ['code_cat', 'lib_cat'], x: 86, y: 78 },
          ]}
          relations={[
            { from: 'client', to: 'commande', label: 'يقدّم', fromCard: '1,n', toCard: '0,1' },
            { from: 'table', to: 'commande', label: 'تستقبل', fromCard: '0,n', toCard: '0,1' },
            { from: 'commande', to: 'plat', label: 'يتضمن (qte)', fromCard: '1,n', toCard: '0,n' },
            { from: 'categorie', to: 'plat', label: 'تصنّف', fromCard: '1,n', toCard: '1,1' },
          ]}
        />
      ),
    },
    {
      id: 'ch2-roadmap',
      chapterId: 'ch2',
      title: 'مراحل التحسين المقترحة',
      subtitle: 'خارطة طريق على ثمانية أسابيع',
      icon: Milestone,
      archetype: 'timeline',
      content: (
        <Timeline
          orientation="vertical"
          items={[
            { label: 'الأسبوعان 1 – 2', title: 'رقمنة تسجيل الطلبات', description: 'لوحي لكل نادل + شاشة في المطبخ؛ إلغاء الدفتر الورقي.', icon: Receipt },
            { label: 'الأسبوعان 3 – 4', title: 'مؤقّتات المطبخ وربط المخزون', description: 'زمن مرجعي لكل طبق، وخصم آلي للمكونات عند كل طلب.', icon: Clock },
            { label: 'الأسبوعان 5 – 6', title: 'لوحة المتابعة والتدريب', description: 'مؤشرات يومية للمدير وتدريب الطاقم على الإجراء الجديد.', icon: Users, highlight: true },
            { label: 'بعد 8 أسابيع', title: 'التقييم والمقارنة', description: 'إعادة القياس بنفس الأدوات ومقارنة المؤشرات قبل/بعد.', icon: Activity },
          ]}
        />
      ),
    },
    {
      id: 'ch2-conclusion',
      chapterId: 'ch2',
      title: 'خلاصة الدراسة التحليلية',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: (
        <ChapterSummary
          points={[
            'الأرقام تؤكد التشخيص: 23 دقيقة متوسط الخدمة، و68% فقط من الزبائن راضون.',
            'ثلث الطلبات اليومية يتركّز في ساعة واحدة (12:30 – 13:30)؛ أي حل يجب أن يُصمَّم لهذه الساعة.',
            'قاموس المعطيات والنموذج المفاهيمي يغطيان دورة الطلب كاملة من التسجيل إلى الدفع والمخزون.',
            'خارطة طريق على 4 مراحل خلال 8 أسابيع، بتكلفة تقتصر على أجهزة لوحية وشاشة مطبخ.',
          ]}
          answer="الحل نظام معلوماتي خفيف يربط القاعة بالمطبخ والمخزن ويقيس كل خطوة — لا توسعة في الطاقم ولا في المطبخ."
          nextHint="الفصل الثالث يبيّن كيف ننجز هذا الحل تقنياً وكيف نحميه ونتابعه."
        />
      ),
    },
  ],
};
