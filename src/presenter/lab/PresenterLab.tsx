import { useMemo, useState, type ReactNode } from 'react';
import { buildSequence } from '@/lib/navigation';
import type { Screen } from '@/lib/navigation';
import type { PresentationData } from '@/types/presentation';
import { Info, Layers, Lightbulb, Target } from 'lucide-react';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { PrefaceScreen } from '@/components/screens/PrefaceScreen';
import { MapScreen } from '@/components/screens/MapScreen';
import { SlideScreen } from '@/components/screens/SlideScreen';
import { FinalScreen } from '@/components/screens/FinalScreen';
import { PresenterWindow } from '../PresenterWindow';
import { notesFor, screenInfo, slidesOf } from '../notes';
import { EMPTY_NOTES_HINT } from '../types';

/**
 * مختبر ملاحظات المعلم ومؤقت العرض — ?lab=presenter
 * لوحة مدمجة بنفس واجهة نافذة المعلم مع بيانات نموذجية تحمل ملاحظات،
 * وشرائح حقيقية للمعاينة — والعرض المباشر يفتح نافذة منفصلة بـ N.
 */

const noop = () => undefined;

const SAMPLE: PresentationData = {
  meta: {
    organization: ['الجامعة', 'الكلية'],
    workType: 'مذكرة تخرج',
    title: 'نظام تقطير الأبحاث',
    subtitle: 'دراسة حالة',
    authors: [{ role: 'إعداد', names: ['اسم الطالب'] }],
    date: '2026',
    notes: 'رحّب بالحضور، واذكر أن العرض 10 دقائق + 5 للأسئلة. ابدأ بسؤال: كم ورقة بحثية تقرأ أسبوعياً؟',
  },
  preface: [
    {
      id: 'p1',
      kind: 'problem',
      title: 'الإشكالية',
      icon: Lightbulb,
      content: <p className="text-slate-200">إغراق المعلومات البحثية وضيق وقت المراجعة.</p>,
      notes: 'توقف هنا ثانيتين — دع الرقم 40 صفحة يعلق في الأذهان قبل الانتقال.',
    },
    {
      id: 'p2',
      kind: 'objectives',
      title: 'الأهداف',
      icon: Target,
      content: <p className="text-slate-200">تقطير البحث إلى أفكار وملخصات قابلة للعرض.</p>,
      notes: 'اربط كل هدف بمشهد في الشورييل لاحقاً.',
    },
  ],
  chapters: [
    {
      id: 'ch1',
      title: 'المنهجية',
      subtitle: 'كيف نقطّر البحث؟',
      icon: Layers,
      color: 'from-sky-600/20 to-sky-400/10',
      accent: 'text-sky-200 border-sky-400/40',
      slides: [
        {
          id: 'ch1-steps',
          chapterId: 'ch1',
          title: 'خطوات التقطير',
          icon: Info,
          archetype: 'process',
          content: <p className="text-slate-200">قراءة ← استخراج الأفكار ← توثيق المراجع ← توليد الملخص.</p>,
          notes: 'اشرح الخطوات الأربع بإيقاع ثابت، وأشر إلى أن كل خطوة تُقاس زمنياً في النتائج.',
        },
        {
          id: 'ch1-results',
          chapterId: 'ch1',
          title: 'النتائج الأولى',
          icon: Info,
          archetype: 'stats',
          content: <p className="text-slate-200">×٧ أسرع في المراجعة و٩٤٪ رضا القرّاء.</p>,
          notes: 'الأرقام هنا تقديرية للعرض — المصدر الكامل في الملحق. توقف عند ×٧ للتأكيد.',
        },
      ],
    },
  ],
  final: {
    title: 'خلاصة العرض',
    summary: ['التقطير يوفّر الوقت', 'الأفكار تصبح قابلة للعرض', 'المراجع تبقى موثقة'],
    closing: 'ماذا لو صار كل بحث ملخصاً في 3 دقائق؟',
    thanks: 'شكراً — أسئلتكم؟',
    celebrate: false,
    notes: 'أدر قصاصات الخاتمة ثم افتح باب الأسئلة. الوقت المستهدف: 10:00 دقيقة.',
  },
};

export function PresenterLab() {
  const slides = useMemo(() => slidesOf(SAMPLE), []);
  const sequence = useMemo(() => buildSequence(SAMPLE), []);
  const [idx, setIdx] = useState(0);

  const screen: Screen = sequence[idx];
  const next: Screen = sequence[Math.min(idx + 1, sequence.length - 1)];
  const notes = notesFor(screen, SAMPLE, slides);
  const currentInfo = screenInfo(screen, SAMPLE, slides);
  const nextInfo = screenInfo(next, SAMPLE, slides);
  const progress = (idx + 1) / sequence.length;

  const onNext = () => setIdx((i) => Math.min(i + 1, sequence.length - 1));
  const onPrev = () => setIdx((i) => Math.max(i - 1, 0));

  const renderScreen = (s: Screen): ReactNode => {
    switch (s.kind) {
      case 'title':
        return <TitleScreen meta={SAMPLE.meta} onStart={noop} />;
      case 'preface':
        return <PrefaceScreen steps={SAMPLE.preface} step={s.step} onGoto={noop} />;
      case 'map':
        return <MapScreen chapters={SAMPLE.chapters} slides={slides} visited={[]} onSelect={noop} currentChapterId="ch1" />;
      case 'slide':
        return slides[s.index] ? <SlideScreen item={slides[s.index]} /> : null;
      case 'final':
        return <FinalScreen data={SAMPLE.final} onMap={noop} onRestart={noop} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24" dir="rtl">
      <header className="border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.4em] text-emerald-300">PRESENTER NOTES & TIMER LAB</p>
        <h1 className="pt-2 text-3xl font-black text-white sm:text-4xl">ملاحظات المعلم ومؤقت العرض</h1>
        <p className="mx-auto max-w-2xl pt-3 text-sm leading-relaxed text-slate-400">
          نموذج إضافة <span className="font-mono text-[12px] text-emerald-300">Reveal Notes</span> المدمجة مع
          reveal.js (MIT): نافذة معلم منفصلة تعرض معاينة الشريحة الحالية والتالية، الملاحظات الخاصة،
          ومؤقتاً للوقت المنقضي — والملاحظات مخفية عن الطلاب والتنقّل متزامن بين النافذتين.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['N نافذة المعلم', 'معاينة حالي + تالٍ', 'مؤقت 00:00', 'تنقّل متزامن', 'ملاحظات مخفية'].map((b) => (
            <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
              {b}
            </span>
          ))}
        </div>
      </header>

      {/* لوحة المعلم المدمجة */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-slate-400">تنقّل نموذجي:</span>
          <button
            type="button"
            data-testid="lab-prev"
            onClick={onPrev}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
          >
            → السابق
          </button>
          <button
            type="button"
            data-testid="lab-next"
            onClick={onNext}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-300"
          >
            التالي ←
          </button>
          <span className="ms-auto text-[11px] text-slate-500">
            هذا نفس مكوّن النافذة المنبثقة — في العرض المباشر اضغط <span className="font-mono text-slate-300">N</span>
          </span>
        </div>

        <div className="h-[70vh] min-h-[520px] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl">
          <PresenterWindow
            data={SAMPLE}
            screen={screen}
            next={next}
            slides={slides}
            currentInfo={currentInfo}
            nextInfo={nextInfo}
            notes={notes}
            progress={progress}
            renderScreen={renderScreen}
            onNext={onNext}
            onPrev={onPrev}
            variant="embedded"
          />
        </div>
      </section>

      {/* الميزات */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="pb-2 text-xl font-black text-white">ما في الحزمة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['🖥 نافذة منفصلة', 'N يفتح نافذة معلم مستقلة على شاشة الحاسوب — شاشتك أنت لا البروجكتور'],
            ['👁 معاينة حالي + تالٍ', 'الشريحتان تُصيَّران حقيقياً (1280×720) وتُصغَّران بـ transform — كما تبدوان للجمهور'],
            ['📝 ملاحظات خاصة', 'notes على أي شريحة/خطوة/عنوان/خاتمة — تُقرأ بخط كبير ولا تظهر للطلاب إطلاقاً'],
            ['⏱ مؤقت منقضٍ', 'يبدأ تلقائياً مع فتح النافذة، مع إيقاف مؤقت وتصفير وساعة حائط'],
            ['🔁 تنقّل متزامن', 'أزرار/أسهم نافذة المعلم تقود العرض الرئيسي — وأي تقدّم في العرض يظهر فوراً هنا'],
            ['🛡 القالب الأبيض', 'بلا ملاحظات؟ تظهر تلميحة إضافة الحقل — لا نص للطلاب في أي حالة'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-black text-white">{title}</p>
              <p className="pt-1 text-[11px] leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pt-8 text-center text-[11px] text-slate-500">
        ملاحظة نموذجية: «{EMPTY_NOTES_HINT.split('—')[0].trim()}» — الدليل: <span className="font-mono">docs/PRESENTER.md</span> ·
        الاعتماد المرجعي: reveal.js Reveal Notes (MIT)
      </footer>
    </div>
  );
}

export default PresenterLab;
