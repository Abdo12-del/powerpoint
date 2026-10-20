/**
 * فحص توفر WebGL — يمنع انهيار المختبرات في بيئات بلا GPU (jsdom/CI)
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}
