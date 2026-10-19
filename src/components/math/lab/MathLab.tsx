import { Activity, ArrowRight, Atom, FlaskConical, Sigma } from 'lucide-react';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChemicalEquation, EquationReveal, FunctionPlot, MathInline, UnitValue } from '..';

/** ?lab=math — Arabic-first math/science typography, step reveals, mhchem, and Mafs plots. */
export default function MathLab() {
  return (
    <main dir="rtl" className="min-h-full overflow-y-auto bg-slate-950 px-5 py-8 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Atom size={17} /> القالب · مختبر الرياضيات والعلوم
            </div>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">معادلات واضحة داخل عرض عربي</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
              صيغ KaTeX باتجاه يسار–يمين معزول داخل الفقرات العربية، واشتقاقات تكشف خطواتها تباعاً، وكتابة كيميائية ووحدات بـ mhchem، ومنحنى رياضي يمكن سحب نقطته.
            </p>
          </div>
          <a
            href={window.location.pathname}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartFrame
            title="خطوة واحدة تقود إلى التالية"
            subtitle="كل سطر يظهر بفاصل زمني قصير، مع احترام إعداد تقليل الحركة."
            note="اجعل كل خطوة تحولاً مفهوماً، لا قفزة حسابية."
            source="EquationReveal · KaTeX 0.19 · تقليل الحركة مدعوم"
          >
            <EquationReveal
              initialDelay={0.18}
              stagger={0.58}
              steps={[
                { id: 'given', label: 'المعادلة الأصلية', tex: String.raw`2x + 3 = 11`, note: 'نبدأ من العلاقة المعطاة.' },
                { id: 'subtract', label: 'نطرح 3 من الطرفين', tex: String.raw`2x = 11 - 3` },
                { id: 'simplify', label: 'نبسّط الطرف الأيمن', tex: String.raw`2x = 8` },
                { id: 'divide', label: 'نقسم على 2', tex: String.raw`x = 4` },
              ]}
            />
          </ChartFrame>

          <ChartFrame
            title="صيغة يسار–يمين داخل جملة عربية"
            subtitle="المعادلة نفسها تُعزل عن اتجاه الفقرة وعن علامات الترقيم المحيطة."
            note="تبقى الفاصلة العربية بعد الصيغة، ولا تقفز إلى داخلها عند العرض."
            source="MathInline · dir=ltr + unicode-bidi:isolate"
          >
            <div className="space-y-5 rounded-xl border border-white/10 bg-slate-950/50 p-5 text-lg leading-9 text-slate-200">
              <p dir="rtl">
                عند سرعة ابتدائية مقدارها{' '}
                <MathInline tex={String.raw`v_0 = 12.5\,\mathrm{m\,s^{-1}}`} ariaLabel="السرعة الابتدائية تساوي 12.5 متراً في الثانية" />
                ، يتغيّر موضع الجسم مع الزمن وفق العلاقة التالية.
              </p>
              <p dir="rtl" className="text-base text-slate-400">
                وتُعرض الطاقة بالعلاقة <MathInline tex={String.raw`E = mc^2`} ariaLabel="الطاقة تساوي الكتلة مضروبة في مربع سرعة الضوء" />،
                من دون قلب ترتيب الحروف اللاتينية أو إزاحة الفاصلة.
              </p>
            </div>
          </ChartFrame>

          <ChartFrame
            title="الكيمياء والقياس في صيغة واحدة"
            subtitle="mhchem يوفّر \ce للمعادلات الكيميائية و\pu للكميات ذات الوحدات."
            note="اكتب المعادلة والوحدة دلالياً؛ KaTeX يحوّلها إلى HTML وMathML."
            source="KaTeX contrib/mhchem · الترخيص MIT ضمن KaTeX"
          >
            <div className="space-y-5 rounded-xl border border-white/10 bg-slate-950/50 p-4 md:p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <FlaskConical size={16} className="text-emerald-300" /> معادلة موزونة
              </div>
              <ChemicalEquation
                equation="2H2 + O2 -> 2H2O"
                ariaLabel="جزيئان من الهيدروجين مع جزيء أكسجين ينتجان جزيئين من الماء"
              />
              <p dir="rtl" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base leading-8 text-slate-300">
                تسارع الجاذبية قرب سطح الأرض يقارب <UnitValue value="9.81" unit="m.s^{-2}" ariaLabel="9.81 متر لكل ثانية مربعة" />.
              </p>
            </div>
          </ChartFrame>

          <ChartFrame
            title="تابع الدالة بتحريك النقطة"
            subtitle="اسحب النقطة على المسار أو استخدم منزلق x بلوحة المفاتيح."
            note="الرسم تفاعلي، قابل للتحجيم، ولوحته متناسقة مع ألوان القالب."
            source="Mafs 0.21 · MIT · الرسم وملفاته محمّلة عند الحاجة"
          >
            <div className="rounded-xl border border-white/10 bg-slate-950/45 p-3 md:p-4">
              <FunctionPlot
                fn={Math.sin}
                label="f(x) = sin(x)"
                xDomain={[-6, 6]}
                yDomain={[-1.6, 1.6]}
                height={310}
                ariaLabel="الرسم التفاعلي لمنحنى الجيب؛ يمكن تحريك النقطة بالماوس أو المنزلق"
              />
            </div>
          </ChartFrame>
        </div>

        <aside className="flex items-start gap-3 rounded-2xl border border-sky-300/15 bg-sky-300/[0.06] p-4 text-sm leading-7 text-slate-300">
          <Sigma size={18} className="mt-1 shrink-0 text-sky-300" />
          <p>
            للاستعمال داخل شريحة، استورد المكوّن المطلوب من <code dir="ltr">@/components/math</code> وضعه داخل أحد الأنماط العشرة القائمة؛ لا يضيف المختبر أي archetype جديداً. كل من KaTeX وMafs خارج الحزمة الأساسية حتى استدعائهما.
          </p>
          <Activity size={17} className="mt-1 hidden shrink-0 text-amber-300 sm:block" aria-hidden="true" />
        </aside>
      </div>
    </main>
  );
}
