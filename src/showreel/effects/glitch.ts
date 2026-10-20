/**
 * تأثير Glitch — RGB split + scanlines + displacement
 * يُستعمل في مشهد Glitch (6.6s–8.8s) وفي العناوين
 */

export function applyGlitch(element: HTMLElement, intensity = 1) {
  const glitchClass = 'showreel-glitch-active';
  element.classList.add(glitchClass);
  element.style.setProperty('--glitch-intensity', String(intensity));

  // إنشاء طبقات RGB split
  if (!element.querySelector('.glitch-layer')) {
    const text = element.textContent ?? '';
    ['r', 'g', 'b'].forEach((ch) => {
      const layer = document.createElement('span');
      layer.className = `glitch-layer glitch-${ch}`;
      layer.setAttribute('aria-hidden', 'true');
      layer.textContent = text;
      element.appendChild(layer);
    });
  }
}

export function removeGlitch(element: HTMLElement) {
  element.classList.remove('showreel-glitch-active');
  element.querySelectorAll('.glitch-layer').forEach((el) => el.remove());
}

/**
 * glitch لحظي — يطبّق ثم يزيل بعد مدة
 */
export function triggerGlitch(element: HTMLElement, duration = 320, intensity = 1) {
  applyGlitch(element, intensity);
  setTimeout(() => removeGlitch(element), duration);
}

/**
 * CSS المطلوب — يُحقن تلقائياً عند أول استعمال
 */
let injected = false;
export function ensureGlitchStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.textContent = `
    .showreel-glitch-active { position: relative; }
    .showreel-glitch-active .glitch-layer {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none; mix-blend-mode: screen;
      opacity: 0.85;
    }
    .showreel-glitch-active .glitch-r { color: #ff3b30; transform: translate(calc(var(--glitch-intensity,1)*2px), 0); clip-path: inset(10% 0 60% 0); animation: glitch-r 0.18s infinite alternate; }
    .showreel-glitch-active .glitch-g { color: #34c759; transform: translate(calc(var(--glitch-intensity,1)*-1.5px), calc(var(--glitch-intensity,1)*1px)); clip-path: inset(40% 0 30% 0); animation: glitch-g 0.22s infinite alternate; }
    .showreel-glitch-active .glitch-b { color: #007aff; transform: translate(calc(var(--glitch-intensity,1)*1.2px), calc(var(--glitch-intensity,1)*-1px)); clip-path: inset(70% 0 10% 0); animation: glitch-b 0.15s infinite alternate; }
    @keyframes glitch-r { 0%{transform:translate(2px,0)} 50%{transform:translate(-1px,1px)} 100%{transform:translate(1.5px,-0.5px)} }
    @keyframes glitch-g { 0%{transform:translate(-1.5px,1px)} 100%{transform:translate(1px,-1px)} }
    @keyframes glitch-b { 0%{transform:translate(1px,-1px)} 100%{transform:translate(-2px,0.5px)} }
    .showreel-scanlines::after {
      content:""; position:absolute; inset:0; pointer-events:none;
      background: repeating-linear-gradient(transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px);
      animation: scan-move 0.08s linear infinite;
    }
    @keyframes scan-move { to { transform: translateY(3px); } }
  `;
  document.head.appendChild(style);
}
