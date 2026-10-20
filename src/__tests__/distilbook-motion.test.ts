import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DISTILBOOK_CONFIG,
  DISTILBOOK_DURATION,
  DISTILBOOK_IDENTITY,
  DISTILBOOK_SCENES,
  REF_EDGES,
  REF_NODES,
  sceneAt,
} from '@/distilbook/types';
import { DistillStage } from '@/distilbook/effects3d/DistillStage';

describe('خط قصة Distilbook — المشاهد السبعة', () => {
  it('سبعة مشاهد بمعرفات فريدة وتوقيتات متصلة تصاعدية', () => {
    expect(DISTILBOOK_SCENES).toHaveLength(7);
    const ids = DISTILBOOK_SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(7);
    for (let i = 1; i < DISTILBOOK_SCENES.length; i++) {
      expect(DISTILBOOK_SCENES[i].start).toBeCloseTo(DISTILBOOK_SCENES[i - 1].end, 6);
    }
    expect(DISTILBOOK_SCENES[0].start).toBe(0);
    expect(DISTILBOOK_SCENES[6].end).toBe(DISTILBOOK_DURATION);
  });

  it('كل مشهد له انتقال سينمائي صحيح ولون هوية', () => {
    const transitions = new Set(['slide', 'zoom', 'glitch']);
    const hex = /^#[0-9a-f]{6}$/i;
    for (const s of DISTILBOOK_SCENES) {
      expect(transitions.has(s.transition), s.id).toBe(true);
      expect(hex.test(s.accent), s.id).toBe(true);
      expect(s.title.length, s.id).toBeGreaterThan(0);
      expect(s.subtitle.length, s.id).toBeGreaterThan(0);
    }
  });

  it('sceneAt يجد المشهد الصحيح ويقصّ الأطراف', () => {
    expect(sceneAt(0).id).toBe('opening');
    expect(sceneAt(3).id).toBe('problem');
    expect(sceneAt(7).id).toBe('distill');
    expect(sceneAt(10.5).id).toBe('ideas');
    expect(sceneAt(13).id).toBe('references');
    expect(sceneAt(16).id).toBe('summary');
    expect(sceneAt(19.5).id).toBe('finale');
    expect(sceneAt(99).id).toBe('finale');
    expect(sceneAt(-5).id).toBe('opening');
  });
});

describe('الإعداد الافتراضي والهوية', () => {
  it('محتوى قصصي كامل: علامة ووعد وأفكار وبطاقات وأرقام', () => {
    const c = DEFAULT_DISTILBOOK_CONFIG;
    expect(c.brand.length).toBeGreaterThan(0);
    expect(c.tagline.length).toBeGreaterThan(0);
    expect(c.cta.length).toBeGreaterThan(0);
    expect(c.bpm).toBeGreaterThanOrEqual(60);
    expect(c.bpm).toBeLessThanOrEqual(200);
    expect(c.ideas.length).toBeGreaterThanOrEqual(4);
    expect(c.stats.length).toBeGreaterThanOrEqual(3);
    expect(c.summaryCards.length).toBeGreaterThanOrEqual(3);
    for (const card of c.summaryCards) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.points.length).toBeGreaterThanOrEqual(2);
      expect(card.source.length).toBeGreaterThan(0);
    }
  });

  it('الهوية تحمل لوحة الأدوار الدرامية كاملة', () => {
    expect(Object.keys(DISTILBOOK_IDENTITY)).toEqual(
      expect.arrayContaining(['ink', 'teal', 'sky', 'amber', 'violet', 'rose', 'emerald']),
    );
  });
});

describe('شبكة المراجع', () => {
  it('عقد كافية بمواقع داخل نطاق العرض ومركز واحد لـ«بحثك»', () => {
    expect(REF_NODES.length).toBeGreaterThanOrEqual(6);
    const centers = REF_NODES.filter((n) => n.center);
    expect(centers).toHaveLength(1);
    expect(centers[0].label).toBe('بحثك');
    for (const n of REF_NODES) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(400);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(240);
    }
  });

  it('كل وصلة تشير لعقد موجودة وكل عقدة موصولة (شبكة مترابطة)', () => {
    for (const [a, b] of REF_EDGES) {
      expect(a).toBeLessThan(REF_NODES.length);
      expect(b).toBeLessThan(REF_NODES.length);
    }
    // اتحاد المجموعات — يجب أن تكون الشبكة كتلة واحدة
    const parent = REF_NODES.map((_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    for (const [a, b] of REF_EDGES) parent[find(a)] = find(b);
    const roots = new Set(REF_NODES.map((_, i) => find(i)));
    expect(roots.size).toBe(1);
  });
});

describe('مسرح التقطير ثلاثي الأبعاد — DistillStage', () => {
  it('يُبنى بمشهد كامل (كتلة + بلورات + قطرات + إضاءة) ويتقدم نقاؤه', () => {
    const stage = new DistillStage(124);
    let meshes = 0;
    stage.scene.traverse((o) => {
      if (o instanceof Object && 'isMesh' in o) meshes++;
    });
    expect(meshes).toBeGreaterThanOrEqual(9); // كتلة + أرضية + 8 بلورات
    const first = stage.update().purity;
    const second = stage.update().purity;
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(1);
    expect(second).toBeGreaterThan(first); // النقاء يتقدم داخل الدورة
    stage.dispose();
  });

  it('النبضات تُشعل القطرات وsetPointer/setBpm/setBpm تتقبل القيم', () => {
    const stage = new DistillStage(120);
    stage.play();
    stage.update();
    stage.update();
    const pos = stage.drops.points.geometry.attributes['position'].array as Float32Array;
    expect(Array.from(pos).some((v) => v !== 0)).toBe(true);
    expect(() => stage.setPointer(0.4, -0.4)).not.toThrow();
    stage.setBpm(150);
    expect(stage.beat.bpm).toBe(150);
    stage.pause();
    stage.dispose();
  });

  it('الكتلة تتقلص عبر دورة التقطير (من الكثافة إلى النقاء)', () => {
    const stage = new DistillStage(124);
    stage.step(0.2); // بداية الدورة — كثافة كاملة
    const early = stage.blob.mesh.scale.x;
    stage.step(2.8); // قرب نهاية الدورة — نقاء
    const late = stage.blob.mesh.scale.x;
    expect(late).toBeLessThan(early);
    stage.dispose();
  });
});
