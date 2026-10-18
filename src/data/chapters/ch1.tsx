import {
  Bike,
  Building2,
  CalendarCheck,
  ChefHat,
  CircleCheck,
  ClipboardList,
  Coffee,
  GitCompareArrows,
  Info,
  Layers,
  Network,
  Package,
  PartyPopper,
  Receipt,
  ShoppingBag,
  UserCog,
  Users,
  Utensils,
  Workflow,
} from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import { Num, Term } from '@/components/ui';
import { BulletCards, ChapterPreface, ChapterSummary, Comparison, OrgTree, ProcessFlow, ProfileCard } from '@/components/archetypes';

const outline = ['التعريف بالمطعم', 'الهيكل التنظيمي', 'مسح الخدمات الحالية', 'سير الطلب الحالي', 'الإشكاليات الميدانية والحلول'];

/** الفصل 1 — الدراسة التمهيدية: من نحن؟ ما المشكلة؟ */
export const ch1: ChapterData = {
  id: 'ch1',
  title: 'الدراسة التمهيدية',
  subtitle: 'من نحن؟ وأين تكمن المشكلة بالضبط؟',
  icon: Layers,
  color: 'from-sky-600/20 to-sky-400/10',
  accent: 'text-sky-200 border-sky-400/40',
  slides: [
    {
      id: 'ch1-preface',
      chapterId: 'ch1',
      title: 'تمهيد الفصل الأول',
      icon: Info,
      archetype: 'chapter-preface',
      content: (
        <ChapterPreface
          number={1}
          lead="قبل اقتراح أي حل، لا بد من فهم المطعم كما هو اليوم: من يديره، وما الخدمات التي يقدّمها، وكيف ينتقل الطلب من الزبون إلى المطبخ."
          question="كيف يسير العمل في مطعم النخيل حالياً، وأين تتشكّل نقاط الضعف؟"
          outline={outline}
        />
      ),
    },
    {
      id: 'ch1-profile',
      chapterId: 'ch1',
      title: 'التعريف بالمطعم',
      subtitle: 'بطاقة تعريف مؤسسة الدراسة',
      icon: Building2,
      archetype: 'profile',
      content: (
        <ProfileCard
          tag="مؤسسة خاصة — قطاع الإطعام"
          name="مطعم النخيل"
          icon={Utensils}
          description="مطعم عائلي تأسس سنة 2012 بوسط مدينة الوادي، يقدّم أطباق المطبخ الجزائري التقليدي إلى جانب الوجبات السريعة، ويستقبل زبائن القاعة والطلبات الخارجية والمناسبات. يعمل بورديتين ويُدار بأساليب يدوية بالكامل."
          facts={[
            { label: 'سنة التأسيس', value: '2012', icon: CalendarCheck },
            { label: 'الطاقة الاستيعابية', value: '40 طاولة / 160 مقعداً', icon: Users },
            { label: 'عدد العاملين', value: '18 عاملاً', icon: UserCog },
            { label: 'متوسط الطلبات اليومية', value: '≈ 320 طلباً', icon: Receipt },
          ]}
        />
      ),
    },
    {
      id: 'ch1-org',
      chapterId: 'ch1',
      title: 'الهيكل التنظيمي',
      subtitle: 'التسلسل الإداري ومراكز المسؤولية',
      icon: Network,
      archetype: 'tree',
      content: (
        <OrgTree
          root={{
            label: 'المدير العام',
            role: 'المالك',
            icon: UserCog,
            children: [
              {
                label: 'مسؤول القاعة',
                role: 'الخدمة والاستقبال',
                icon: Users,
                children: [
                  { label: 'النُّدُل', role: '6 أعوان' },
                  { label: 'الصندوق', role: 'محاسب' },
                ],
              },
              {
                label: 'رئيس الطهاة',
                role: 'المطبخ',
                icon: ChefHat,
                children: [
                  { label: 'الطهاة', role: '4 طهاة' },
                  { label: 'مساعدو المطبخ', role: '3 أعوان' },
                ],
              },
              {
                label: 'مسؤول التموين',
                role: 'المخزن والمشتريات',
                icon: Package,
                children: [
                  { label: 'المخزن', role: 'عون واحد' },
                  { label: 'المشتريات', role: 'يومية' },
                ],
              },
            ],
          }}
        />
      ),
    },
    {
      id: 'ch1-services',
      chapterId: 'ch1',
      title: 'مسح الخدمات الحالية',
      subtitle: 'ما الذي يقدّمه المطعم اليوم وبأي حالة؟',
      icon: ClipboardList,
      archetype: 'bullets',
      content: (
        <BulletCards
          items={[
            { icon: Utensils, title: 'الخدمة في القاعة', description: 'النشاط الرئيسي: 70% من الطلبات، ذروة الغداء بين 12:00 و14:00.', tag: 'قائم', tagTone: 'success' },
            { icon: ShoppingBag, title: 'الطلبات الخارجية', description: 'تسجَّل في نفس دفتر القاعة دون تمييز — تُنسى أحياناً.', tag: 'قائم', tagTone: 'success' },
            { icon: Bike, title: 'التوصيل عبر الهاتف', description: 'بلا تتبع للزمن أو للسائق؛ شكاوى متكررة من التأخير.', tag: 'متعثّر', tagTone: 'warning' },
            { icon: CalendarCheck, title: 'حجز الطاولات', description: 'بالهاتف وعلى الورق فقط؛ تعارضات في عطلة نهاية الأسبوع.', tag: 'متعثّر', tagTone: 'warning' },
            { icon: PartyPopper, title: 'المناسبات والولائم', description: 'نشاط موسمي مربح لكنه بلا تخطيط للمخزون مسبقاً.', tag: 'موسمي', tagTone: 'info' },
            { icon: Coffee, title: 'الإفطار الجماعي', description: 'خدمة مقترحة للمؤسسات المجاورة — لم تُطلق بعد.', tag: 'غير مُفعَّل', tagTone: 'neutral' },
          ]}
        />
      ),
    },
    {
      id: 'ch1-order-flow',
      chapterId: 'ch1',
      title: 'سير الطلب الحالي',
      subtitle: 'من استقبال الزبون إلى الدفع — كما يحدث اليوم',
      icon: Workflow,
      archetype: 'process',
      content: (
        <ProcessFlow
          steps={[
            { title: 'استقبال الزبون وإجلاسه', meta: '2 د', description: 'يختار النادل الطاولة ذهنياً دون مخطط للقاعة.' },
            { title: 'تسجيل الطلب ورقياً', meta: '4 د', description: 'دفتر نسختين؛ خط اليد سبب رئيسي للأخطاء.' },
            { title: 'نقل الورقة إلى المطبخ', meta: '3 – 9 د', description: 'ينتظر النادل تجميع عدة طلبات قبل الذهاب.', highlight: true },
            { title: 'التحضير', meta: '8 د', description: 'يُقرأ الطلب ويُحضَّر دون ترتيب أولوية.' },
            { title: 'التسليم إلى الطاولة', meta: '2 د', description: 'البحث عن الطاولة الصحيحة يعتمد على الذاكرة.' },
            { title: 'الدفع بالصندوق', meta: '4 د', description: 'يُعاد حساب الفاتورة يدوياً من الورقة.' },
          ]}
        />
      ),
    },
    {
      id: 'ch1-issues',
      chapterId: 'ch1',
      title: 'الإشكاليات الميدانية والحلول',
      subtitle: 'ما رصدناه في الميدان مقابل ما نقترحه',
      icon: GitCompareArrows,
      archetype: 'comparison',
      content: (
        <Comparison
          fromTitle="الوضع الحالي"
          toTitle="الحل المقترح"
          pairs={[
            {
              from: <>تسجيل الطلبات ورقياً → أخطاء قراءة وتأخير بمعدل <Num>7%</Num> من الطلبات.</>,
              to: <>تسجيل رقمي على لوحي يرسل الطلب فوراً إلى شاشة المطبخ.</>,
            },
            {
              from: <>لا يوجد أي تتبع لزمن التحضير؛ الانطباع هو المقياس الوحيد.</>,
              to: <>مؤقّت لكل طلب في المطبخ مع تنبيه عند تجاوز <Num>10 دقائق</Num>.</>,
            },
            {
              from: <>جرد المخزون أسبوعياً يدوياً → نفاد مفاجئ أو هدر.</>,
              to: <>خصم آلي من المخزون عند كل طلب وتنبيه عند حدّ إعادة الطلب.</>,
            },
            {
              from: <>غياب مؤشرات؛ القرارات تُتّخذ بالحدس في نهاية الشهر.</>,
              to: <>لوحة متابعة يومية (<Term>KPI</Term>) للمدير على الهاتف.</>,
            },
          ]}
        />
      ),
    },
    {
      id: 'ch1-conclusion',
      chapterId: 'ch1',
      title: 'خلاصة الدراسة التمهيدية',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: (
        <ChapterSummary
          points={[
            'مطعم النخيل مؤسسة مستقرة (320 طلباً/يوم) لكن إدارتها يدوية بالكامل.',
            'الهيكل التنظيمي واضح، غير أن تدفق المعلومات بين القاعة والمطبخ والمخزن مقطوع.',
            'الخدمات المتعثّرة (التوصيل، الحجز) تشترك في سبب واحد: غياب التسجيل والتتبع.',
            'عنق الزجاجة في سير الطلب هو نقل الورقة إلى المطبخ (3 – 9 دقائق)، لا الطهي نفسه.',
          ]}
          answer="المشكلة ليست في الطاقم ولا في المطبخ، بل في الطريقة التي ينتقل بها الطلب والمعلومة."
          nextHint="الفصل الثاني يقيس هذه الملاحظات بالأرقام ويصمّم نموذج البيانات للحل."
        />
      ),
    },
  ],
};
