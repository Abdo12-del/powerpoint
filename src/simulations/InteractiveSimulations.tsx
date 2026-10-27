import { useEffect, useMemo, useState } from 'react';
import '@fontsource-variable/noto-sans-arabic/standard.css';
import '@fontsource-variable/inter/standard.css';
import { Activity, ArrowDownLeft, ChevronLeft, FlaskConical, Pause, Play, RotateCcw, Sparkles, Timer, TrendingUp } from 'lucide-react';
import { calculateResult, domains, initialValues, simulations } from './catalog';
import { SimulationScene } from './SimulationScene';
import type { SimulationDefinition, SimulationId, SimulationValues } from './types';
import './simulations.css';

function ValueSlider({ parameter, value, onChange }: { parameter: SimulationDefinition['parameters'][number]; value: number; onChange: (value: number) => void }) {
  const decimals = String(parameter.step).includes('.') ? String(parameter.step).split('.')[1].length : 0;
  return <label className="sim-control">
    <span className="sim-control-heading"><span>{parameter.label}</span><b>{value.toFixed(decimals)} <small>{parameter.unit}</small></b></span>
    <input aria-label={parameter.label} type="range" min={parameter.min} max={parameter.max} step={parameter.step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    <span className="sim-range-endpoints"><span>{parameter.min} {parameter.unit}</span><span>{parameter.max} {parameter.unit}</span></span>
  </label>;
}

function LiveChart({ points, accent, domain }: { points: { x: number; y: number }[]; accent: string; domain: SimulationId }) {
  const { path, area } = useMemo(() => {
    const ys = points.map((point) => point.y);
    let minY = Math.min(...ys); let maxY = Math.max(...ys);
    if (domain === 'projectile' || domain === 'wave') { minY = Math.min(minY, -0.35); maxY = Math.max(maxY, 0.35); }
    const range = maxY - minY || 1;
    const coords = points.map((point, index) => ({ x: 12 + index / (points.length - 1) * 376, y: 12 + (1 - (point.y - minY) / range) * 120 }));
    const line = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
    return { path: line, area: `${line} L388,132 L12,132 Z` };
  }, [points, domain]);
  return <svg className="sim-chart-svg" viewBox="0 0 400 150" preserveAspectRatio="none" role="img" aria-label="رسم بياني حي لنتائج المحاكاة">
    <defs><linearGradient id="sim-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity=".24" /><stop offset="100%" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
    {[0, 1, 2, 3].map((line) => <line key={line} x1="12" x2="388" y1={12 + line * 40} y2={12 + line * 40} stroke="rgba(255,255,255,.075)" strokeDasharray="3 5" />)}
    <path d={area} fill="url(#sim-chart-fill)" />
    <path d={path} fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function InteractiveSimulations({ initialSimulation = 'projectile', embedded = false }: { initialSimulation?: SimulationId; embedded?: boolean }) {
  const [selectedId, setSelectedId] = useState<SimulationId>(initialSimulation);
  const definition = simulations.find((simulation) => simulation.id === selectedId) ?? simulations[0]!;
  const [values, setValues] = useState<SimulationValues>(() => initialValues(definition));
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [runKey, setRunKey] = useState(1);
  const result = useMemo(() => calculateResult(definition.id, values, elapsed), [definition.id, elapsed, values]);
  const DomainIcon = definition.icon;
  const completion = Math.min((elapsed % 12) / 12 * 100, 100);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed((time) => time + 0.1), 100);
    return () => window.clearInterval(timer);
  }, [playing, runKey]);

  const switchSimulation = (id: SimulationId) => {
    const next = simulations.find((simulation) => simulation.id === id);
    if (!next) return;
    setSelectedId(id); setValues(initialValues(next)); setElapsed(0); setPlaying(true); setRunKey((key) => key + 1);
  };
  const updateValue = (id: string, value: number) => setValues((current) => ({ ...current, [id]: value }));
  const reset = () => { setElapsed(0); setValues(initialValues(definition)); setPlaying(false); setRunKey((key) => key + 1); };

  return <main className={`sim-app${embedded ? ' sim-embedded' : ''}`} dir="rtl" lang="ar">
    <div className="sim-glow sim-glow-one" /><div className="sim-glow sim-glow-two" />
    <header className="sim-topbar">
      <a className="sim-brand" href={window.location.pathname} aria-label="العودة إلى العرض"><span className="sim-brand-mark"><FlaskConical size={19} /></span><span>مختبر<span className="sim-brand-light">.تفاعلي</span><small>SIMULATION STUDIO</small></span></a>
      <div className="sim-top-status"><span className="sim-live-dot" /> بيئة تجريبية مباشرة <span className="sim-status-divider" /> <span>٤ تجارب علمية</span></div>
      {!embedded && <a href={window.location.pathname} className="sim-back-link">العودة إلى العرض <ChevronLeft size={16} /></a>}
    </header>

    <section className="sim-heading-wrap">
      <div className="sim-eyebrow"><Sparkles size={14} /> مساحة للتجربة والاكتشاف</div>
      <h1>العلم، <span>بين يديك.</span></h1>
      <p>غيّر المتغيرات، حرّك العناصر، واكتشف كيف تتحول الفكرة إلى نتيجة.</p>
    </section>

    <div className="sim-domain-tabs" role="tablist" aria-label="مجالات المحاكاة">
      {domains.map((domain) => {
        const simulation = simulations.find((item) => item.domain === domain.id)!;
        const Icon = simulation.icon;
        return <button key={domain.id} role="tab" aria-selected={selectedId === simulation.id} onClick={() => switchSimulation(simulation.id)} className={`sim-domain-tab${selectedId === simulation.id ? ' active' : ''}`} style={{ '--tab-accent': simulation.accent } as React.CSSProperties}><Icon size={16} /><span>{domain.label}</span></button>;
      })}
    </div>

    <section className="sim-workspace" aria-label="منطقة المحاكاة">
      <div className="sim-workspace-head">
        <div className="sim-experiment-title"><span className="sim-experiment-icon" style={{ color: definition.accent, background: `${definition.accent}16` }}><DomainIcon size={19} /></span><div><span className="sim-kicker">{definition.subtitle}</span><h2>{definition.title}</h2></div></div>
        <span className="sim-live-label"><span className="sim-live-dot" /> LIVE SIMULATION</span>
      </div>
      <p className="sim-description">{definition.description}</p>

      <div className="sim-main-grid">
        <div className="sim-visual-column">
          <div className="sim-canvas-wrap" style={{ '--scene-accent': definition.accent } as React.CSSProperties}>
            <div className="sim-canvas-label"><span><Activity size={14} /> العرض ثلاثي الأبعاد</span>{definition.id === 'projectile' && <span className="sim-drag-tip"><ArrowDownLeft size={13} /> اسحب الجسم لتغيير الزاوية</span>}</div>
            <SimulationScene key={selectedId} definition={definition} values={values} playing={playing} time={elapsed} onDrag={(angle) => updateValue('angle', Math.max(15, Math.min(75, angle)))} />
            <div className="sim-scene-caption"><span>المشهد {String(simulations.findIndex((simulation) => simulation.id === selectedId) + 1).padStart(2, '0')}</span><span>تفاعلي · ثلاثي الأبعاد</span></div>
          </div>
          <div className="sim-transport">
            <button className={`sim-play${playing ? ' is-playing' : ''}`} onClick={() => { setPlaying((isPlaying) => !isPlaying); setRunKey((key) => key + 1); }} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
            <div className="sim-timeline"><div className="sim-time-label"><span>{playing ? 'التجربة قيد التشغيل' : 'التجربة متوقفة مؤقتاً'}</span><b><Timer size={13} /> {elapsed.toFixed(1)} ث</b></div><div className="sim-progress-track"><span style={{ width: `${completion}%`, background: definition.accent }} /></div></div>
            <button className="sim-reset" onClick={reset} aria-label="إعادة التجربة"><RotateCcw size={16} /><span>إعادة</span></button>
          </div>
        </div>

        <aside className="sim-controls-card">
          <div className="sim-card-heading"><div><span className="sim-section-index">01 / VARIABLES</span><h3>متغيرات التجربة</h3></div><span className="sim-tune-icon"><Activity size={17} /></span></div>
          <div className="sim-controls-list">{definition.parameters.map((parameter) => <ValueSlider key={parameter.id} parameter={parameter} value={values[parameter.id] ?? parameter.initial} onChange={(value) => updateValue(parameter.id, value)} />)}</div>
          <div className="sim-result-box" style={{ '--result-accent': definition.accent } as React.CSSProperties}><div className="sim-result-top"><span><TrendingUp size={14} /> النتيجة الآن</span><span>LIVE</span></div><div className="sim-result-value">{result.value.toFixed(1)} <small>{result.unit}</small></div><div className="sim-result-name">{result.label}</div></div>
          <div className="sim-insight"><span className="sim-insight-spark"><Sparkles size={14} /></span><p>{result.insight}</p></div>
        </aside>
      </div>

      <section className="sim-chart-card">
        <div className="sim-chart-heading"><div><span className="sim-section-index">02 / REAL-TIME DATA</span><h3>استجابة المتغيرات</h3></div><div className="sim-chart-legend"><span style={{ background: definition.accent }} /> ناتج المحاكاة <span className="sim-chart-updated"><span className="sim-live-dot" /> يتحدّث لحظياً</span></div></div>
        <div className="sim-chart-area"><div className="sim-chart-y-labels"><span>مرتفع</span><span>متوسط</span><span>منخفض</span></div><LiveChart points={result.points} accent={definition.accent} domain={definition.id} /><div className="sim-chart-x-labels"><span>بداية التجربة</span><span>تغيّر الزمن / المتغير</span><span>النتيجة</span></div></div>
      </section>
    </section>

    <footer className="sim-footer"><div className="sim-footer-mark"><span className="sim-live-dot" /> تفاعلي بطبيعته</div><span>تعلّم بالتجربة، لا بالمشاهدة فقط.</span><span>مصمم للعروض التقديمية <b>✳</b></span></footer>
  </main>;
}
