import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { BeatClock, SHOWREEL_SHOTS, SHOWREEL_LOOP_DURATION, shotAt, transitionIntensity, smoothstep } from '@/effects/beat';
import { ParticleField } from '@/effects/three/ParticleField';
import { MorphBlob } from '@/effects/three/MorphBlob';
import { ShowreelStage } from '@/effects/three/ShowreelStage';
import { CinemaShader, MorphMaterialShader, GlitchQuadShader } from '@/effects/materials/shaders';
import { CinemaPass } from '@/effects/materials/CinemaPass';

describe('ساعة الإيقاع — BeatClock', () => {
  it('مدة النبضة تُشتق من BPM', () => {
    expect(new BeatClock(128).beatDuration).toBeCloseTo(60 / 128, 10);
    expect(new BeatClock(120).beatDuration).toBeCloseTo(0.5, 10);
  });

  it('يقيّد BPM ضمن 20..300', () => {
    expect(new BeatClock(1).bpm).toBe(20);
    expect(new BeatClock(9999).bpm).toBe(300);
    const b = new BeatClock(128);
    b.bpm = 500;
    expect(b.bpm).toBe(300);
  });

  it('الفهرس والطور يتقدمان زمنياً', () => {
    const b = new BeatClock(120); // نبضة كل 0.5s
    expect(b.indexAt(0.4)).toBe(0);
    expect(b.indexAt(0.6)).toBe(1);
    expect(b.phaseAt(0.25)).toBeCloseTo(0.5, 5);
  });

  it('يطلق نبضات عند عبور الحدود — كل رابعة أقوى', () => {
    const b = new BeatClock(120);
    const fired: Array<{ index: number; intensity: number }> = [];
    b.start(0);
    for (let t = 0.01; t <= 2.2; t += 0.01) {
      b.update(t, (e) => fired.push({ index: e.index, intensity: e.intensity }));
    }
    expect(fired.map((f) => f.index)).toEqual([0, 1, 2, 3, 4]);
    expect(fired[0].intensity).toBe(1); // داون-بيت
    expect(fired[1].intensity).toBe(0.6);
    expect(fired[4].intensity).toBe(1); // رابعة جديدة
  });

  it('بيئة الاضمحلال تتناقص بعد النبضة', () => {
    const b = new BeatClock(120);
    b.start(0);
    b.update(0.01);
    const e1 = b.envAt(0.11, 0.14);
    const e2 = b.envAt(0.31, 0.14);
    expect(e1).toBeGreaterThan(0);
    expect(e1).toBeLessThan(1);
    expect(e2).toBeLessThan(e1);
  });
});

describe('خط زمني المقاطع — Shots', () => {
  it('يرجع المقطع الصحيح عند كل زمن', () => {
    expect(shotAt(0).id).toBe('shapes');
    expect(shotAt(4.5).id).toBe('morph');
    expect(shotAt(9).id).toBe('storm');
    expect(shotAt(13).id).toBe('finale');
  });

  it('يلف حلقيّاً بعد المدة الكاملة ومع الأزمنة السالبة', () => {
    expect(shotAt(SHOWREEL_LOOP_DURATION + 1).id).toBe('shapes');
    expect(shotAt(-1).id).toBe('finale');
  });

  it('شدة الانتقال تتصاعد عند حدود المقاطع فقط', () => {
    expect(transitionIntensity(2)).toBe(0);
    expect(transitionIntensity(0)).toBe(0); // بداية أول مقطع بلا قصّ
    const atCut = transitionIntensity(4.1);
    expect(atCut).toBeGreaterThan(0);
    expect(atCut).toBeLessThan(1);
    expect(transitionIntensity(5.5)).toBe(0);
  });

  it('smoothstep يحترم الحواف والمنتصف', () => {
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 10);
  });

  it('أربعة مقاطع لكل 16 ثانية', () => {
    expect(SHOWREEL_SHOTS).toHaveLength(4);
    expect(SHOWREEL_LOOP_DURATION).toBe(16);
  });
});

describe('حقل الجسيمات — ParticleField', () => {
  it('الانفجار يُشعل جسيمات بسرعات وألوان', () => {
    const field = new ParticleField(100);
    field.burst(new THREE.Vector3(0, 0, 0), 30, 4);
    field.update(0.016); // الألوان تُحسب في التكامل
    const pos = field.points.geometry.attributes['position'].array as Float32Array;
    const colored = field.points.geometry.attributes['color'].array as Float32Array;
    expect(Array.from(pos).some((v) => v !== 0)).toBe(true);
    expect(Array.from(colored).some((v) => v > 0)).toBe(true);
  });

  it('التكامل يحرك المواقع ويُخفت اللون مع العمر', () => {
    const field = new ParticleField(60);
    field.burst(new THREE.Vector3(0, 0, 0), 20, 5);
    const before = Float32Array.from(field.points.geometry.attributes['position'].array as Float32Array);
    field.update(0.05);
    const after = field.points.geometry.attributes['position'].array as Float32Array;
    let moved = 0;
    for (let i = 0; i < before.length; i++) if (Math.abs(after[i] - before[i]) > 1e-6) moved++;
    expect(moved).toBeGreaterThan(0);
    // إنتهاء الأعمار → ألوان سوداء (اختفاء مع AdditiveBlending)
    field.update(10);
    const colors = field.points.geometry.attributes['color'].array as Float32Array;
    expect(Array.from(colors).every((v) => v === 0)).toBe(true);
  });
});

describe('المجسّم المتحوّل — MorphBlob', () => {
  it('uMorph يتنفس ضمن 0..1 ويدور مع الزمن', () => {
    const blob = new MorphBlob(2);
    blob.update(0.8, 0.016);
    const morph = blob.uniforms['uMorph'].value as number;
    expect(morph).toBeGreaterThanOrEqual(0);
    expect(morph).toBeLessThanOrEqual(1);
    expect(blob.uniforms['uTime'].value).toBe(0.8);
    const ry = blob.mesh.rotation.y;
    blob.update(1.8, 0.016);
    expect(blob.mesh.rotation.y).toBeGreaterThan(ry);
  });

  it('النبضة تزيح uMorph دورياً', () => {
    const blob = new MorphBlob(2);
    blob.uniforms['uMorph'].value = 0.95;
    blob.beat();
    expect(blob.uniforms['uMorph'].value).toBeCloseTo(0.13, 5);
  });
});

describe('مسرح الشورييل — ShowreelStage', () => {
  it('يُبنى بمشهد كامل: أشكال + مورف + جسيمات + إضاءة', () => {
    const stage = new ShowreelStage(128);
    let meshes = 0;
    stage.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) meshes++;
    });
    expect(meshes).toBeGreaterThanOrEqual(8); // 6 أشكال + مورف + جسيمات + أرضية
    expect(stage.scene.children.some((c) => c instanceof THREE.DirectionalLight)).toBe(true);
    stage.dispose();
  });

  it('النبضة الأولى تُشعل الجسيمات وupdate يرجع زمن الحلقة', () => {
    const stage = new ShowreelStage(128);
    stage.beat.start(-0.1);
    const info = stage.update();
    expect(info.loopTime).toBeGreaterThanOrEqual(0);
    expect(info.loopTime).toBeLessThan(SHOWREEL_LOOP_DURATION);
    const pos = stage.particles.points.geometry.attributes['position'].array as Float32Array;
    expect(Array.from(pos).some((v) => v !== 0)).toBe(true);
    stage.dispose();
  });

  it('setPointer وsetBpm يتقبلان القيم', () => {
    const stage = new ShowreelStage(120);
    stage.setPointer(0.5, -0.5);
    stage.setBpm(150);
    expect(stage.beat.bpm).toBe(150);
    stage.dispose();
  });
});

describe('مظللات التشوهات البصرية', () => {
  it('مرور السينما يجمع الغليتش والانزياح والحبيبات والفينييت والنبضة', () => {
    const src = CinemaShader.fragmentShader;
    for (const token of ['tDiffuse', 'uGlitch', 'uRgbShift', 'uGrain', 'uVignette', 'uPulse']) {
      expect(src).toContain(token);
    }
    expect(Object.keys(CinemaShader.uniforms)).toContain('uTime');
  });

  it('مادة المورف تعتمد uMorph وتدرّج لوني', () => {
    expect(MorphMaterialShader.vertexShader).toContain('uMorph');
    expect(MorphMaterialShader.fragmentShader).toContain('uColorA');
    expect(MorphMaterialShader.fragmentShader).toContain('uColorB');
  });

  it('رباعي الغليتش يعتمد uIntensity', () => {
    expect(GlitchQuadShader.fragmentShader).toContain('uIntensity');
  });

  it('CinemaPass يكشف واجهة ضبط متعةً', () => {
    const pass = new CinemaPass();
    pass.glitch = 0.7;
    pass.rgbShift = 0.5;
    pass.grain = 0.2;
    pass.vignette = 0.9;
    expect(pass.glitch).toBe(0.7);
    expect(pass.rgbShift).toBe(0.5);
    expect(pass.grain).toBe(0.2);
    expect(pass.vignette).toBe(0.9);
    pass.pulse(0.6);
    expect(pass.uniforms['uPulse'].value).toBeCloseTo(0.6, 5);
    pass.pulse(0.9); // لا يتجاوز 1
    expect(pass.uniforms['uPulse'].value).toBe(1);
    pass.decayPulse(0.1, 3.0);
    expect(pass.uniforms['uPulse'].value).toBeCloseTo(0.7, 5);
    pass.setTime(2.5);
    expect(pass.uniforms['uTime'].value).toBe(2.5);
  });
});
