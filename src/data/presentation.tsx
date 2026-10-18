import { Compass, Goal, Lightbulb, MessageCircleQuestion } from 'lucide-react';
import type { PresentationData } from '@/types/presentation';
import { Placeholder } from '@/components/ui';
import { chapters } from './chapters';

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  هذا الملف هو «استمارة» العرض — القالب يأتي فارغاً عمداً.             ║
 * ║  استبدل كل نص نائب بمحتوى مشروعك. العقود في types/presentation.ts،   ║
 * ║  والوصفة الكاملة في docs/PRESENTATION_TEMPLATE_SPEC.md (§7).         ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * الترتيب الإلزامي للشاشات: العنوان ← المقدمة (3–4 خطوات) ← الخريطة ← الفصول ← الخاتمة
 */
export const presentation: PresentationData = {
  // ── 2.1 شاشة العنوان: بطاقة تعريف العرض (هوية فقط، لا محتوى) ───────────
  meta: {
    organization: [
      'الجهة الرسمية — السطر الأول (الدولة / الوزارة)',
      'السطر الثاني (الجامعة / المؤسسة)',
      'السطر الثالث (الكلية / القسم) — احذف ما لا يلزم',
    ],
    workType: 'نوع العمل (مذكرة تخرج / تقرير / دورة / عرض منتج)',
    title: 'العنوان الرئيسي للعرض في جملة واحدة',
    subtitle: 'العنوان الفرعي: توضيح أو مكان التطبيق (اختياري — احذف الحقل إن لم تحتجه)',
    authors: [
      { role: 'إعداد', names: ['الاسم الأول', 'الاسم الثاني'] },
      { role: 'إشراف', names: ['اسم المشرف'] },
    ],
    date: 'التاريخ / الدفعة / السنة الجامعية',
    startLabel: 'اضغط للبدء',
    // خلفية جسيمات لشاشة العنوان: 'stars' | 'network' | 'snow' | 'bubbles' | 'fireflies' | 'none'
    background: 'stars',
  },

  // ── 2.2 المقدمة: 3–4 خطوات، كل خطوة شريحة كاملة ─────────────────────────
  // استبدل <Placeholder /> بالمحتوى؛ المكونات المقترحة في التعليقات.
  preface: [
    {
      id: 'preface-context',
      kind: 'context',
      title: 'تمهيد عام: لماذا هذا الموضوع مهم؟',
      icon: Lightbulb,
      // مقترح: <Stagger> + <Card> بفقرتين (2–3 جمل) و2–3 أرقام مُبرزة بـ <Num>
      content: <Placeholder compact hint="سياق الموضوع في 2–3 جمل + أرقام مُبرزة إن وُجدت" />,
    },
    {
      id: 'preface-problem',
      kind: 'problem',
      title: 'الإشكالية',
      icon: MessageCircleQuestion,
      // مقترح: <Card highlight> يحمل سؤالاً واحداً واضحاً «كيف يمكن…؟» + 2–3 أعراض في بطاقات
      content: <Placeholder compact hint="سؤال واحد واضح: «كيف يمكن … ؟» — كل الفصول إجابات جزئية عنه" />,
    },
    {
      id: 'preface-objectives',
      kind: 'objectives',
      title: 'الأهداف',
      icon: Goal,
      // مقترح: <BulletCards items={[…4–6 أهداف بصيغة مفعول به: «أتمتة…»، «تقليل…»]} />
      content: <Placeholder compact hint="4–6 أهداف بصيغة مفعول به («أتمتة…»، «تقليل…»، «تسهيل…») — BulletCards" />,
    },
    {
      id: 'preface-scope',
      kind: 'scope',
      title: 'النطاق والمنهجية',
      icon: Compass,
      // اختياري — احذف الخطوة كلها إن لم تلزم (الحد الأدنى 3 خطوات).
      // مقترح: 3 بطاقات (المكان، المدة، المنهج) + <ProcessFlow> لأدوات العمل
      content: <Placeholder compact hint="أين طُبّق؟ متى؟ بأي منهجية (MERISE، Agile…)؟ — اختياري" />,
    },
  ],

  // ── 3. الفصول: 3–5 فصول في chapters/ (كل فصل ملف) ───────────────────────
  chapters,

  // ── 2.5 الخاتمة النهائية: تلخّص فقط — لا معلومات جديدة ─────────────────
  final: {
    title: 'خلاصة العرض',
    summary: [
      'الجملة الأولى: ما الذي شخّصه / قدّمه الفصل الأول؟',
      'الجملة الثانية: ما الذي أظهره / صمّمه الفصل الثاني؟',
      'الجملة الثالثة: ما الذي اقترحه / أنجزه الفصل الثالث؟',
    ],
    closing: 'نتيجة أو دعوة تأمل في جملة واحدة تُغلق بها العرض.',
    thanks: 'شكراً لحسن إصغائكم — أسئلتكم مرحّب بها',
    // قصاصات احتفالية عند الوصول للخاتمة: true (= 'cannons') | 'burst' | 'stars' | 'fireworks' | 'rain' | false للعروض الرسمية
    celebrate: true,
  },
};
