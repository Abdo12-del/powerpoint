import * as THREE from 'three';
import { GlitchQuadShader } from '../materials/shaders';

/**
 * رباعي الغليتش — لوحة عرض مصغّرة تُظهر تأثير Glitch على نسيج مولّد إجرائياً
 * (أشرطة سماوية/بنفسجية على داكن) — يُستعمل في كتالوج التأثيرات بالمختبر
 */
export function createGlitchQuad(width = 2, height = 1.2): THREE.Mesh {
  // نسيج إجرائي: أشرطة وخطوط سريعة
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, 0, 512, 320);
  bg.addColorStop(0, '#0b1220');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 320);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#a78bfa' : '#f472b6';
    ctx.globalAlpha = 0.35 + Math.random() * 0.5;
    const y = Math.random() * 320;
    ctx.fillRect(0, y, 512, 2 + Math.random() * 10);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 64px monospace';
  ctx.fillText('GLITCH', 96, 190);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      ...GlitchQuadShader.uniforms,
      tDiffuse: { value: texture },
    },
    vertexShader: GlitchQuadShader.vertexShader,
    fragmentShader: GlitchQuadShader.fragmentShader,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.userData['texture'] = texture;
  return mesh;
}

/** تحديث زمن رباعي الغليتش */
export function updateGlitchQuad(mesh: THREE.Mesh, time: number): void {
  const mat = mesh.material as THREE.ShaderMaterial;
  mat.uniforms['uTime'].value = time;
}
