import { Compass, Goal, Lightbulb, MessageCircleQuestion } from 'lucide-react';
import {
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Recycle,
  Smile,
  Timer,
  MapPin,
  CalendarDays,
  Users,
  Search,
} from 'lucide-react';
import type { PresentationData } from '@/types/presentation';
import { Badge, Card, Num, Stagger, Term } from '@/components/ui';
import { BulletCards, ProcessFlow } from '@/components/archetypes';
import { chapters } from './chapters';

/**
 * مثال تعبئة مكتمل (§8): مشروع وهمي «تقرير دراسة تحسين أداء مطعم النخيل».
 * استبدل هذا الملف ومجلد chapters/ ببيانات مشروعك — العقود في types/presentation.ts.
 */
export const presentation: PresentationData = {
  // ── 2.1 شاشة العنوان ───────────────────────────────────────────────────
  meta: {
    organization: [
      'الجمهورية الجزائرية الديمقراطية الشعبية',
      'وزارة التعليم العالي والبحث العلمي',
      'جامعة الشهيد حمه لخضر — الوادي',
      'كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
    ],
    workType: 'تقرير دراسة ميدانية',
    title: 'دراسة تحسين أداء مطعم «النخيل»',
    subtitle: 'تشخيص سير الخدمة واقتراح خطة تحسين قابلة للقياس — دراسة تطبيقية بمدينة الوادي',
    authors: [
      { role: 'إعداد الطلبة', names: ['أحمد بن صالح', 'سارة مرابط'] },
      { role: 'تحت إشراف', names: ['د. كمال بوزيد'] },
    ],
    date: 'السنة الجامعية 2025 / 2026 — دفعة 2026',
    startLabel: 'اضغط للبدء',
  },

  // ── 2.2 المقدمة: 4 خطوات ───────────────────────────────────────────────
  preface: [
    {
      id: 'preface-context',
      kind: 'context',
      title: 'لماذا أداء المطاعم موضوع يستحق الدراسة؟',
      icon: Lightbulb,
      content: (
        <Stagger className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="space-y-4 p-7 text-xl leading-relaxed">
            <p>
              يشهد قطاع المطاعم في الجزائر نمواً متسارعاً، لكن أغلب المطاعم العائلية ما تزال تُدار بأساليب يدوية لا تتيح
              قياس الأداء أو تحسينه.
            </p>
            <p>
              في مطعم «النخيل» يُسجَّل الطلب على الورق، ويُنقل إلى المطبخ باليد، ولا يُعرف زمن التحضير إلا بالتقدير —
              وهو ما ينعكس مباشرة على تجربة الزبون.
            </p>
          </Card>
          <div className="grid gap-3">
            <Card className="flex items-center gap-4">
              <Users className="h-8 w-8 text-amber-300" />
              <div>
                <div className="text-sm text-slate-400">زبائن المطعم يومياً</div>
                <div className="text-2xl font-black tabular-nums">≈ 320 طلباً</div>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <Timer className="h-8 w-8 text-amber-300" />
              <div>
                <div className="text-sm text-slate-400">زمن الانتظار في الذروة</div>
                <div className="text-2xl font-black tabular-nums">حتى 35 دقيقة</div>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <Recycle className="h-8 w-8 text-amber-300" />
              <div>
                <div className="text-sm text-slate-400">هدر المواد الأولية</div>
                <div className="text-2xl font-black tabular-nums">12% شهرياً</div>
              </div>
            </Card>
          </div>
        </Stagger>
      ),
    },
    {
      id: 'preface-problem',
      kind: 'problem',
      title: 'الإشكالية',
      icon: MessageCircleQuestion,
      content: (
        <Stagger className="mx-auto flex max-w-5xl flex-col gap-6">
          <Card highlight className="p-8 text-center">
            <div className="text-sm font-bold text-amber-300">سؤال البحث المركزي</div>
            <p className="mt-3 text-3xl font-extrabold leading-snug">
              كيف يمكن تقليص زمن الخدمة وتثبيت جودتها في مطعم «النخيل» دون رفع التكاليف التشغيلية؟
            </p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <Badge tone="danger">العَرَض 1</Badge>
              <h4 className="mt-2 text-lg font-bold">بطء الخدمة في الذروة</h4>
              <p className="mt-1 text-slate-300">
                متوسط الانتظار <Num>23 دقيقة</Num> ويبلغ <Num>35</Num> بين 12:30 و13:30.
              </p>
            </Card>
            <Card>
              <Badge tone="danger">العَرَض 2</Badge>
              <h4 className="mt-2 text-lg font-bold">تذبذب الجودة</h4>
              <p className="mt-1 text-slate-300">
                نفس الطبق يختلف تحضيره باختلاف الطاهي والوردية — <Num>7%</Num> من الطلبات تُعاد.
              </p>
            </Card>
            <Card>
              <Badge tone="danger">العَرَض 3</Badge>
              <h4 className="mt-2 text-lg font-bold">هدر المواد</h4>
              <p className="mt-1 text-slate-300">
                غياب ربط المخزون بالطلبات يؤدي إلى هدر <Num>12%</Num> من المشتريات شهرياً.
              </p>
            </Card>
          </div>
        </Stagger>
      ),
    },
    {
      id: 'preface-objectives',
      kind: 'objectives',
      title: 'أهداف الدراسة',
      icon: Goal,
      content: (
        <BulletCards
          items={[
            { icon: Timer, title: 'تقليص زمن الانتظار', description: <>إلى أقل من <Num>15 دقيقة</Num> في أوقات الذروة.</> },
            { icon: Smile, title: 'رفع رضا الزبائن', description: <>من <Num>68%</Num> إلى <Num>85%</Num> خلال ستة أشهر.</> },
            { icon: Recycle, title: 'تقليل الهدر', description: <>خفض هدر المواد الأولية بنسبة <Num>20%</Num> على الأقل.</> },
            { icon: ClipboardList, title: 'توحيد إجراءات التحضير', description: 'بطاقة وصفة معيارية لكل طبق مع زمن مرجعي.' },
            { icon: LayoutDashboard, title: 'بناء لوحة متابعة يومية', description: 'مؤشرات لحظية للمدير بدل التقارير الأسبوعية.' },
            { icon: Gauge, title: 'قياس الأثر', description: 'مقارنة المؤشرات قبل وبعد التنفيذ بأسلوب موحّد.' },
          ]}
        />
      ),
    },
    {
      id: 'preface-scope',
      kind: 'scope',
      title: 'النطاق والمنهجية',
      icon: Compass,
      content: (
        <Stagger className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4">
              <MapPin className="h-8 w-8 text-amber-300" />
              <div>
                <div className="text-sm text-slate-400">مكان التطبيق</div>
                <div className="text-lg font-bold">مطعم النخيل — فرع واحد، 40 طاولة</div>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <CalendarDays className="h-8 w-8 text-amber-300" />
              <div>
                <div className="text-sm text-slate-400">مدة الدراسة الميدانية</div>
                <div className="text-lg font-bold tabular-nums">6 أسابيع (فيفري – مارس 2026)</div>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <Search className="h-8 w-8 text-amber-300" />
              <div>
                <div className="text-sm text-slate-400">المنهج</div>
                <div className="text-lg font-bold">
                  وصفي تحليلي + نمذجة بـ <Term>MERISE</Term>
                </div>
              </div>
            </Card>
          </div>
          <Card className="p-6">
            <div className="mb-2 text-sm font-bold text-amber-300">أدوات جمع البيانات</div>
            <ProcessFlow
              steps={[
                { title: 'ملاحظة مباشرة', meta: '12 يوماً', description: 'تسجيل أزمنة الخدمة في الذروة والهدوء.' },
                { title: 'استبيان الزبائن', meta: '120 استمارة', description: 'قياس الرضا وأسباب عدم العودة.' },
                { title: 'مقابلات الطاقم', meta: '9 مقابلات', description: 'المدير، رئيس الطهاة، النُّدُل.' },
                { title: 'تحليل سجلات الطلبات', meta: '3 أشهر', description: 'توزيع الطلبات على الساعات والأطباق.' },
              ]}
            />
          </Card>
        </Stagger>
      ),
    },
  ],

  // ── 3. الفصول ──────────────────────────────────────────────────────────
  chapters,

  // ── 2.5 الخاتمة: تلخّص فقط ─────────────────────────────────────────────
  final: {
    title: 'خلاصة الدراسة',
    summary: [
      'شخّصت الدراسة التمهيدية سير الخدمة في مطعم النخيل وحددت التسجيل الورقي وغياب القياس كجذرين للبطء وتذبذب الجودة.',
      'أظهرت الدراسة التحليلية بالأرقام أن الذروة بين 12:30 و13:30 تستوعب ثلث الطلبات اليومية، وأن عنق الزجاجة في نقل الطلب لا في الطهي.',
      'اقترحت خطة التنفيذ رقمنة الطلبات وربطها بالمخزون ولوحة متابعة يومية على أربع مراحل خلال ثمانية أسابيع.',
      'الأهداف الكمية (15 دقيقة، 85% رضا، هدر أقل من 8%) قابلة للقياس بنفس الأدوات التي استُعملت في التشخيص.',
    ],
    closing: 'التحسين الحقيقي يبدأ من قياس ما كنّا نظنّه بديهياً — فما لا يُقاس لا يُحسَّن.',
    thanks: 'شكراً لحسن إصغائكم — أسئلتكم ومناقشاتكم مرحّب بها',
  },
};
