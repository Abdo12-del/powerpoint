import { DISTILBOOK_IDENTITY } from '../types';

/**
 * مشهد الأفكار — كتابة حركية
 * عنوان يتنفّس + شرائح الأفكار المفتاحية تنبثق واحدة كل نصف نبضة
 */
export function IdeasScene({ ideas }: { ideas: string[] }) {
  return (
    <div data-scene="ideas" className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.4em] text-amber-300">KEY IDEAS</p>

      <h2 className="text-4xl font-black leading-tight text-white sm:text-6xl">
        {['أفكار', 'تُقاد', 'إلى', 'السطح'].map((w, i) => (
          <span
            key={w}
            data-word
            className={i === 1 ? 'inline-block bg-gradient-to-l from-amber-200 to-amber-400 bg-clip-text text-transparent' : 'inline-block'}
            style={{ marginRight: '0.35em', transformOrigin: '50% 100%' }}
          >
            {w}
          </span>
        ))}
      </h2>

      {/* خط يُرسم تحت العنوان */}
      <div data-underline className="h-1 w-44 origin-center rounded-full bg-gradient-to-l from-amber-300 to-transparent" />

      {/* شرائح الأفكار — تنبثق مع النبضات */}
      <div className="flex max-w-lg flex-wrap justify-center gap-2.5">
        {ideas.map((idea, i) => (
          <span
            key={idea}
            data-idea
            data-beat
            className="rounded-full border px-4 py-1.5 text-sm font-black"
            style={{
              borderColor: `${DISTILBOOK_IDENTITY.amber}44`,
              backgroundColor: `${DISTILBOOK_IDENTITY.amber}14`,
              color: DISTILBOOK_IDENTITY.amber,
              // تدرّج خفيف في التشبّع بين الشرائح
              filter: `saturate(${1 - i * 0.06})`,
            }}
          >
            {idea}
          </span>
        ))}
      </div>

      <p className="text-[11px] font-bold text-slate-400">كل فكرة مربوطة بموضعها في المصدر</p>
    </div>
  );
}
