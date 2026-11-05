/**
 * حزمة المعدات العلمية — Science Equipment Gallery
 * معرض PNG شفافة تُدرج داخل الشريحة المفتوحة من العارض نفسه (زر «المعدات
 * العلمية» أو المفتاح G)، مع سحب/نقر، تحريك وتحجيم وحذف، حفظ محلي لكل
 * شريحة، وتراجع/إعادة — بلا صفحة مستقلة. ويضيف «وضع التجربة» (T)
 * إجراءات مخبرية مصغّرة تعمل فوق الشريحة نفسها بلا مسار جديد.
 */

export { useEquipment } from './useEquipment';
export type { EquipmentController } from './useEquipment';
export { EquipmentPanel } from './EquipmentPanel';
export { EquipmentLayer } from './EquipmentLayer';
export { EquipmentSimulator } from './EquipmentSimulator';
export {
  PROCEDURES,
  PROCEDURE_COUNT,
  procedureFor,
  titrationColor,
  titrationReadout,
  TITRATION_EQUIVALENCE_ML,
  TITRATION_MAX_ML,
  flameState,
  stirState,
  signalReadout,
  focusBlur,
  focusClarity,
  relativeCentrifugalForce,
  centrifugeState,
  strikeLabel,
  compassReadout,
  bloodPressureReadout,
  SYSTOLIC_MMHG,
  DIASTOLIC_MMHG,
  ROTOR_RADIUS_CM,
  clampNumber,
} from './simulation';
export type {
  ProcedureDef,
  ProcedureKind,
  TitrationReadout,
  FlameState,
  StirState,
  SignalInput,
  SignalReadout,
  CentrifugeState,
  CompassReadout,
  BloodPressureReadout,
  BloodPressurePhase,
} from './simulation';
export { EQUIPMENT, assetById, matchesQuery, normalizeQuery } from './catalog';
export { EquipmentStore, loadPersist, savePersist, clearPersisted, newEquipmentId, STORAGE_KEY } from './store';
export {
  assetAspect,
  clamp,
  clampPlacement,
  heightFraction,
  placeEquipment,
  relativePoint,
  widthFromPointer,
  NOMINAL_RECT,
} from './geometry';
export type { SlideRect } from './geometry';
export {
  DEFAULT_WIDTH,
  MIN_WIDTH,
  MAX_WIDTH,
  NUDGE,
  NUDGE_LARGE,
  HISTORY_LIMIT,
  EQUIPMENT_CATEGORIES,
  DND_MIME,
  DND_PREFIX,
} from './types';
export type { EquipmentAsset, EquipmentCategory, PlacedEquipment, EquipmentPersist } from './types';
