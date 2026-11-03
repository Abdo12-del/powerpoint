import { useEffect, useRef, useState } from 'react';
import { mount } from 'bn-lab-simulations';
import type { Experiment, Mounted } from 'bn-lab-simulations';
import type { SimulationDefinition, SimulationValues } from './types';

const experimentLoaders = {
  lorenz: () => import('bn-lab-simulations/experiments/lorenz'),
  pendulum: () => import('bn-lab-simulations/experiments/pendulum'),
  doubleslit: () => import('bn-lab-simulations/experiments/doubleslit'),
  grayscott: () => import('bn-lab-simulations/experiments/grayscott'),
  chladni: () => import('bn-lab-simulations/experiments/chladni'),
  kepler: () => import('bn-lab-simulations/experiments/kepler'),
} satisfies Record<string, () => Promise<{ default: Experiment }>>;

type BnLabId = keyof typeof experimentLoaders;
type EngineSceneProps = {
  definition: SimulationDefinition;
  values: SimulationValues;
  playing: boolean;
  time: number;
  resetKey: number;
};

function BnLabCanvas({ definition, values, playing, resetKey }: EngineSceneProps & { experimentId: BnLabId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef<Mounted | null>(null);
  const latestRef = useRef({ values, playing });
  const [error, setError] = useState('');
  latestRef.current = { values, playing };
  const experimentId = definition.id as BnLabId;

  useEffect(() => {
    let active = true;
    let instance: Mounted | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setError('');
    void experimentLoaders[experimentId]().then(({ default: experiment }) => {
      if (!active) return;
      instance = mount(canvas, experiment, {
        theme: 'dark', accent: definition.accent, locale: 'en',
        params: latestRef.current.values, motion: 'auto',
        onError: (reason) => setError(reason.message),
      });
      mountedRef.current = instance;
      if (!latestRef.current.playing) instance.pause();
      if (!instance.supported) setError('هذا المشهد غير مدعوم في المتصفح الحالي.');
    }).catch(() => setError('تعذّر تحميل نموذج التجربة.'));
    return () => {
      active = false;
      instance?.destroy();
      if (mountedRef.current === instance) mountedRef.current = null;
    };
  }, [definition.accent, experimentId]);

  useEffect(() => {
    const instance = mountedRef.current;
    if (!instance) return;
    for (const [key, value] of Object.entries(values)) instance.set(key, value);
  }, [values]);

  useEffect(() => {
    const instance = mountedRef.current;
    if (!instance) return;
    if (playing) instance.play(); else instance.pause();
  }, [playing]);

  useEffect(() => { mountedRef.current?.reset(); }, [resetKey]);

  return <div className="sim-scene sim-engine-scene" role="img" aria-label={`محاكاة ثنائية الأبعاد: ${definition.title}`}>
    <canvas ref={canvasRef} aria-hidden="true" />
    {error && <span className="sim-engine-error" role="status">{error}</span>}
  </div>;
}

function MatterCanvas({ definition, values, playing, resetKey }: EngineSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ values, playing });
  const engineRef = useRef<import('matter-js').Engine | null>(null);
  const bodiesRef = useRef<import('matter-js').Body[]>([]);
  stateRef.current = { values, playing };

  useEffect(() => {
    let active = true;
    let raf = 0;
    let engine: import('matter-js').Engine | null = null;
    let disposeEngine: (() => void) | null = null;
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const width = 960;
    const height = 420;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    let context = canvas.getContext('2d');
    if (!context) return () => canvas.remove();

    void import('matter-js').then((Matter) => {
      if (!active) return;
      engine = Matter.Engine.create({ enableSleeping: false });
      const activeEngine = engine;
      disposeEngine = () => Matter.Engine.clear(activeEngine);
      engine.gravity.y = stateRef.current.values.gravity ?? 0.8;
      const walls = [
        Matter.Bodies.rectangle(width / 2, height + 20, width + 100, 50, { isStatic: true }),
        Matter.Bodies.rectangle(-20, height / 2, 50, height + 100, { isStatic: true }),
        Matter.Bodies.rectangle(width + 20, height / 2, 50, height + 100, { isStatic: true }),
      ];
      const colors = ['#ffb36b', '#7bc8ff', '#bba1ff', '#78d8b4', '#f27d82', '#f3d174'];
      const balls = colors.map((color, index) => {
        const body = index % 2 === 0
          ? Matter.Bodies.circle(190 + index * 92, 80 + (index % 3) * 18, 24 + (index % 3) * 4, { restitution: 0.82, friction: 0.015, density: 0.001 + index * 0.00012 })
          : Matter.Bodies.rectangle(190 + index * 92, 80 + (index % 3) * 18, 48, 48, { restitution: 0.82, friction: 0.015, density: 0.001 + index * 0.00012, chamfer: { radius: 7 } });
        body.render.fillStyle = color;
        Matter.Body.setVelocity(body, { x: (index - 2.5) * 1.1, y: 0 });
        return body;
      });
      Matter.Composite.add(engine.world, [...walls, ...balls]);
      engineRef.current = engine;
      bodiesRef.current = balls;
      let previous = performance.now();
      const draw = () => {
        if (!active || !context) return;
        raf = requestAnimationFrame(draw);
        const state = stateRef.current;
        if (state.playing && engine) {
          const now = performance.now();
          const elapsed = Math.min(40, now - previous);
          previous = now;
          engine.gravity.y = state.values.gravity ?? 0.8;
          for (const body of balls) body.restitution = state.values.restitution ?? 0.82;
          Matter.Engine.update(engine, elapsed * (state.values.speed ?? 1));
        } else previous = performance.now();
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        context.strokeStyle = 'rgba(219,233,239,.15)';
        context.lineWidth = 2;
        context.beginPath(); context.moveTo(28, height - 28); context.lineTo(width - 28, height - 28); context.stroke();
        for (const body of balls) {
          const vertices = body.vertices;
          if (!vertices.length) continue;
          context.fillStyle = String(body.render.fillStyle ?? '#ffb36b');
          context.shadowColor = context.fillStyle;
          context.shadowBlur = 18;
          context.beginPath(); context.moveTo(vertices[0]!.x, vertices[0]!.y);
          for (let index = 1; index < vertices.length; index++) context.lineTo(vertices[index]!.x, vertices[index]!.y);
          context.closePath(); context.fill();
        }
        context.shadowBlur = 0;
      };
      draw();
    }).catch(() => { if (active) host.dataset.error = 'engine'; });

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      disposeEngine?.();
      engineRef.current = null;
      bodiesRef.current = [];
      canvas.remove();
    };
  }, [resetKey]);

  return <div ref={hostRef} className="sim-scene sim-engine-scene" role="img" aria-label={`تصادمات أجسام صلبة ثنائية الأبعاد: ${definition.title}`} />;
}

type P5Control = { remove: () => void; loop: () => void; noLoop: () => void };

function P5Canvas({ definition, values, playing, resetKey }: EngineSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<P5Control | null>(null);
  const stateRef = useRef({ values, playing });
  stateRef.current = { values, playing };

  useEffect(() => {
    let active = true;
    let sketch: P5Control | null = null;
    const host = hostRef.current;
    if (!host) return;
    host.replaceChildren();
    void import('p5').then(({ default: P5 }) => {
      if (!active) return;
      sketch = new P5((p) => {
        p.setup = () => {
          const width = host.clientWidth || 720;
          const height = host.clientHeight || 355;
          p.createCanvas(width, height);
          p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
          p.noStroke();
        };
        p.draw = () => {
          if (!stateRef.current.playing) return;
          const { lambda = 34, sources = 2, speed = 2.2 } = stateRef.current.values;
          const width = p.width; const height = p.height;
          const phase = p.frameCount * 0.035 * speed;
          p.background(16, 22, 27);
          const sourceCount = Math.round(sources);
          const sourceY = height * 0.5;
          const spread = Math.min(height * 0.5, 116);
          const sourcePoints = Array.from({ length: sourceCount }, (_, index) => ({
            x: width * 0.5,
            y: sourceY + (index - (sourceCount - 1) / 2) * (spread / Math.max(1, sourceCount - 1)),
          }));
          for (let y = 14; y < height - 14; y += 8) {
            for (let x = 14; x < width - 14; x += 8) {
              let wave = 0;
              for (const source of sourcePoints) {
                const distance = Math.hypot(x - source.x, y - source.y);
                wave += Math.cos((distance / lambda) * Math.PI * 2 - phase) / sourceCount;
              }
              const intensity = wave * wave;
              const tint = p.constrain(intensity * 1.45, 0, 1);
              p.fill(20 + tint * 110, 42 + tint * 138, 64 + tint * 175, 65 + tint * 190);
              p.circle(x, y, 1.8 + intensity * 4.5);
            }
          }
          for (const source of sourcePoints) {
            p.fill(255, 226, 176, 210); p.circle(source.x, source.y, 8);
            p.noFill(); p.stroke(255, 219, 170, 55); p.strokeWeight(1);
            const ring = ((phase * lambda * 0.75) % Math.max(width, height)) + 10;
            p.circle(source.x, source.y, ring * 2);
            p.noStroke();
          }
          p.fill(214, 226, 232, 180); p.textSize(11);
          p.textAlign(p.LEFT, p.BOTTOM); p.text(`λ = ${lambda} px   ·   ${sourceCount} مصادر`, 16, height - 14);
        };
        p.windowResized = () => {
          if (!host.isConnected) return;
          p.resizeCanvas(host.clientWidth || 720, host.clientHeight || 355);
        };
      }, host);
      sketchRef.current = sketch;
      if (!stateRef.current.playing) sketch.noLoop();
    }).catch(() => { if (active) host.dataset.error = 'engine'; });
    return () => {
      active = false;
      sketch?.remove();
      if (sketchRef.current === sketch) sketchRef.current = null;
    };
  }, [resetKey]);

  useEffect(() => {
    if (playing) sketchRef.current?.loop(); else sketchRef.current?.noLoop();
  }, [playing]);

  return <div ref={hostRef} className="sim-scene sim-engine-scene" role="img" aria-label={`تداخل موجات ثنائية الأبعاد: ${definition.title}`} />;
}

export function EngineScene(props: EngineSceneProps) {
  if (props.definition.engine === 'bn-lab') return <BnLabCanvas {...props} experimentId={props.definition.id as BnLabId} />;
  if (props.definition.engine === 'matter-js') return <MatterCanvas {...props} />;
  if (props.definition.engine === 'p5') return <P5Canvas {...props} />;
  return null;
}
