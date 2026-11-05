/**
 * كتالوج المعدات العلمية — أصول PNG أصلية شفافة (رسمت لهذا المستودع).
 * المصادر SVG في assets/svg/ والنواتج PNG في assets/png/،
 * وتولَّد عبر scripts/generate-equipment-assets.mjs. لا روابط خارجية.
 *
 * التوسعة (65 أصلاً) تغطي التخصصات العلمية في الجامعات الجزائرية:
 * الكيمياء (D02)، الفيزياء (D02)، الأحياء (D04)، الجيولوجيا (D05)،
 * والصحة (D15)، مع الإبقاء على الأصول العشرة القديمة وفئاتها كما هي
 * حتى لا تنكسر العناصر المحفوظة في localStorage.
 *
 * الكلمات المفتاحية عربية وفرنسية لأن التدريس العلمي في الجزائر غالباً
 * بالفرنسية. التصنيف دلالي تعليمي، وليس قائمة معدات إلزامية أو رسمية.
 */
import type { EquipmentAsset } from './types';
import erlenmeyerFlask from './assets/png/erlenmeyer-flask.png';
import graduatedCylinder from './assets/png/graduated-cylinder.png';
import beaker from './assets/png/beaker.png';
import testTube from './assets/png/test-tube.png';
import testTubeRack from './assets/png/test-tube-rack.png';
import dropperPipette from './assets/png/dropper-pipette.png';
import petriDish from './assets/png/petri-dish.png';
import microscope from './assets/png/microscope.png';
import safetyGoggles from './assets/png/safety-goggles.png';
import spiritLamp from './assets/png/spirit-lamp.png';
import burette from './assets/png/burette.png';
import volumetricFlask from './assets/png/volumetric-flask.png';
import roundBottomFlask from './assets/png/round-bottom-flask.png';
import separatoryFunnel from './assets/png/separatory-funnel.png';
import liebigCondenser from './assets/png/liebig-condenser.png';
import filterFunnel from './assets/png/filter-funnel.png';
import watchGlass from './assets/png/watch-glass.png';
import crucible from './assets/png/crucible.png';
import mortarPestle from './assets/png/mortar-pestle.png';
import bunsenBurner from './assets/png/bunsen-burner.png';
import tripodGauze from './assets/png/tripod-gauze.png';
import analyticalBalance from './assets/png/analytical-balance.png';
import phMeter from './assets/png/ph-meter.png';
import magneticStirrer from './assets/png/magnetic-stirrer.png';
import stirringRod from './assets/png/stirring-rod.png';
import convexLens from './assets/png/convex-lens.png';
import concaveLens from './assets/png/concave-lens.png';
import glassPrism from './assets/png/glass-prism.png';
import spring from './assets/png/spring.png';
import pendulum from './assets/png/pendulum.png';
import slottedWeights from './assets/png/slotted-weights.png';
import vernierCaliper from './assets/png/vernier-caliper.png';
import multimeter from './assets/png/multimeter.png';
import oscilloscope from './assets/png/oscilloscope.png';
import magnet from './assets/png/magnet.png';
import tuningFork from './assets/png/tuning-fork.png';
import thermometer from './assets/png/thermometer.png';
import stopwatch from './assets/png/stopwatch.png';
import powerSupply from './assets/png/power-supply.png';
import microscopeSlide from './assets/png/microscope-slide.png';
import micropipette from './assets/png/micropipette.png';
import inoculationLoop from './assets/png/inoculation-loop.png';
import dissectingKit from './assets/png/dissecting-kit.png';
import centrifuge from './assets/png/centrifuge.png';
import autoclave from './assets/png/autoclave.png';
import incubator from './assets/png/incubator.png';
import dnaHelix from './assets/png/dna-helix.png';
import cellModel from './assets/png/cell-model.png';
import microtube from './assets/png/microtube.png';
import geologicalHammer from './assets/png/geological-hammer.png';
import handLens from './assets/png/hand-lens.png';
import geologicalCompass from './assets/png/geological-compass.png';
import rockSample from './assets/png/rock-sample.png';
import mineralCrystal from './assets/png/mineral-crystal.png';
import fossil from './assets/png/fossil.png';
import sieve from './assets/png/sieve.png';
import stethoscope from './assets/png/stethoscope.png';
import syringe from './assets/png/syringe.png';
import bloodPressureMonitor from './assets/png/blood-pressure-monitor.png';
import bloodTube from './assets/png/blood-tube.png';
import tablets from './assets/png/tablets.png';
import capsule from './assets/png/capsule.png';
import medicalGloves from './assets/png/medical-gloves.png';
import faceMask from './assets/png/face-mask.png';
import heartModel from './assets/png/heart-model.png';

/** كل الأصول مربعة 512×512 بخلفية شفافة */
export const EQUIPMENT: EquipmentAsset[] = [
  {
    id: 'erlenmeyer-flask',
    name: 'دورق مخروطي',
    category: 'glassware',
    keywords: ['قارورة', 'قنينة', 'دورق', 'مخروطي', 'flask', 'erlenmeyer', 'fiole erlenmeyer'],
    src: erlenmeyerFlask,
    width: 512,
    height: 512,
  },
  {
    id: 'graduated-cylinder',
    name: 'مخبار مدرّج',
    category: 'glassware',
    keywords: ['مخبار', 'أسطوانة', 'قياس', 'حجم', 'cylinder', 'graduated', 'éprouvette graduée', 'eprouvette'],
    src: graduatedCylinder,
    width: 512,
    height: 512,
  },
  {
    id: 'beaker',
    name: 'كأس زجاجي',
    category: 'glassware',
    keywords: ['كأس', 'كوب', 'بيكر', 'زجاج', 'beaker', 'bécher', 'becher'],
    src: beaker,
    width: 512,
    height: 512,
  },
  {
    id: 'test-tube',
    name: 'أنبوب اختبار',
    category: 'glassware',
    keywords: ['أنبوب', 'انبوب', 'اختبار', 'tube', 'test', 'tube à essai', 'tube a essai'],
    src: testTube,
    width: 512,
    height: 512,
  },
  {
    id: 'test-tube-rack',
    name: 'حامل أنابيب الاختبار',
    category: 'glassware',
    keywords: ['حامل', 'رف', 'أنابيب', 'انابيب', 'rack', 'test', 'tube', 'porte-tubes'],
    src: testTubeRack,
    width: 512,
    height: 512,
  },
  {
    id: 'dropper-pipette',
    name: 'ماصة قطارة',
    category: 'tools',
    keywords: ['ماصة', 'قطارة', 'قطّارة', 'تقطير', 'pipette', 'dropper', 'compte-gouttes', 'pipette pasteur'],
    src: dropperPipette,
    width: 512,
    height: 512,
  },
  {
    id: 'petri-dish',
    name: 'طبق بتري',
    category: 'tools',
    keywords: ['طبق', 'بتري', 'زراعة', 'أحياء', 'petri', 'dish', 'boîte de pétri', 'boite de petri'],
    src: petriDish,
    width: 512,
    height: 512,
  },
  {
    id: 'microscope',
    name: 'مجهر',
    category: 'devices',
    keywords: ['ميكروسكوب', 'مجهر', 'فحص', 'microscope', 'microscope optique'],
    src: microscope,
    width: 512,
    height: 512,
  },
  {
    id: 'safety-goggles',
    name: 'نظارات واقية',
    category: 'safety',
    keywords: ['نظارات', 'وقاية', 'سلامة', 'حماية', 'goggles', 'safety', 'lunettes de protection'],
    src: safetyGoggles,
    width: 512,
    height: 512,
  },
  {
    id: 'spirit-lamp',
    name: 'مصباح كحولي',
    category: 'heating',
    keywords: ['مصباح', 'موقد', 'لهب', 'تسخين', 'كحول', 'lamp', 'burner', 'spirit', 'lampe à alcool', 'lampe a alcool'],
    src: spiritLamp,
    width: 512,
    height: 512,
  },
  {
    id: 'burette',
    name: 'سحاحة',
    category: 'chemistry',
    keywords: ['سحاحة', 'معايرة', 'تقطير حجمي', 'burette', 'titrage', 'dosage'],
    src: burette,
    width: 512,
    height: 512,
  },
  {
    id: 'volumetric-flask',
    name: 'دورق حجمي',
    category: 'chemistry',
    keywords: ['دورق', 'حجمي', 'معايرة', 'fiole jaugée', 'fiole', 'volumetric flask'],
    src: volumetricFlask,
    width: 512,
    height: 512,
  },
  {
    id: 'round-bottom-flask',
    name: 'دورق كروي',
    category: 'chemistry',
    keywords: ['دورق', 'كروي', 'تسخين', 'ballon', 'ballon fond rond', 'fiole ronde'],
    src: roundBottomFlask,
    width: 512,
    height: 512,
  },
  {
    id: 'separatory-funnel',
    name: 'قمع فصل',
    category: 'chemistry',
    keywords: ['قمع', 'فصل', 'استخلاص', 'ampoule à décanter', 'ampoule a decanter', 'décantation', 'separatory funnel'],
    src: separatoryFunnel,
    width: 512,
    height: 512,
  },
  {
    id: 'liebig-condenser',
    name: 'مكثف ليبيغ',
    category: 'chemistry',
    keywords: ['مكثف', 'تكثيف', 'تقطير', 'réfrigérant', 'refrigerant', 'condenseur', 'liebig'],
    src: liebigCondenser,
    width: 512,
    height: 512,
  },
  {
    id: 'filter-funnel',
    name: 'قمع ترشيح',
    category: 'chemistry',
    keywords: ['قمع', 'ترشيح', 'ورق ترشيح', 'entonnoir', 'filtration', 'filtre'],
    src: filterFunnel,
    width: 512,
    height: 512,
  },
  {
    id: 'watch-glass',
    name: 'زجاجة ساعة',
    category: 'chemistry',
    keywords: ['زجاج', 'ساعة', 'تبخير', 'verre de montre', 'watch glass'],
    src: watchGlass,
    width: 512,
    height: 512,
  },
  {
    id: 'crucible',
    name: 'بوتقة',
    category: 'chemistry',
    keywords: ['بوتقة', 'تحميص', 'حرق', 'creuset', 'crucible'],
    src: crucible,
    width: 512,
    height: 512,
  },
  {
    id: 'mortar-pestle',
    name: 'هاون ومدقة',
    category: 'chemistry',
    keywords: ['هاون', 'مدقة', 'سحق', 'طحن', 'mortier', 'pilon', 'mortar'],
    src: mortarPestle,
    width: 512,
    height: 512,
  },
  {
    id: 'bunsen-burner',
    name: 'موقد بنسن',
    category: 'chemistry',
    keywords: ['موقد', 'بنسن', 'لهب', 'غاز', 'bec bunsen', 'brûleur', 'bruleur', 'burner'],
    src: bunsenBurner,
    width: 512,
    height: 512,
  },
  {
    id: 'tripod-gauze',
    name: 'حامل ثلاثي وشبكة',
    category: 'chemistry',
    keywords: ['حامل', 'ثلاثي', 'شبكة', 'تسخين', 'trépied', 'trepied', 'toile métallique', 'chauffe-ballon'],
    src: tripodGauze,
    width: 512,
    height: 512,
  },
  {
    id: 'analytical-balance',
    name: 'ميزان تحليلي',
    category: 'chemistry',
    keywords: ['ميزان', 'تحليلي', 'دقة', 'وزن', 'balance analytique', 'balance de précision', 'balance'],
    src: analyticalBalance,
    width: 512,
    height: 512,
  },
  {
    id: 'ph-meter',
    name: 'مقياس pH',
    category: 'chemistry',
    keywords: ['pH', 'حموضة', 'قياس', 'ph-mètre', 'ph metre', 'phmètre', 'phmeter'],
    src: phMeter,
    width: 512,
    height: 512,
  },
  {
    id: 'magnetic-stirrer',
    name: 'مقلب مغناطيسي',
    category: 'chemistry',
    keywords: ['مقلب', 'مغناطيسي', 'تحريك', 'خلط', 'agitateur magnétique', 'agitateur magnetique', 'barreau aimanté', 'stirrer'],
    src: magneticStirrer,
    width: 512,
    height: 512,
  },
  {
    id: 'stirring-rod',
    name: 'قضيب تحريك',
    category: 'chemistry',
    keywords: ['قضيب', 'تحريك', 'زجاج', 'baguette de verre', 'tige de verre', 'stirring rod'],
    src: stirringRod,
    width: 512,
    height: 512,
  },
  {
    id: 'convex-lens',
    name: 'عدسة محدبة',
    category: 'physics',
    keywords: ['عدسة', 'محدبة', 'تجميع', 'lentille convergente', 'lentille', 'convex lens'],
    src: convexLens,
    width: 512,
    height: 512,
  },
  {
    id: 'concave-lens',
    name: 'عدسة مقعرة',
    category: 'physics',
    keywords: ['عدسة', 'مقعرة', 'تفريق', 'lentille divergente', 'concave lens'],
    src: concaveLens,
    width: 512,
    height: 512,
  },
  {
    id: 'glass-prism',
    name: 'منشور زجاجي',
    category: 'physics',
    keywords: ['منشور', 'زجاج', 'ضوء', 'تحلل', 'prisme', 'prism', 'dispersion'],
    src: glassPrism,
    width: 512,
    height: 512,
  },
  {
    id: 'spring',
    name: 'نابض',
    category: 'physics',
    keywords: ['نابض', 'زنبرك', 'مرونة', 'هوك', 'ressort', 'spring', 'hooke'],
    src: spring,
    width: 512,
    height: 512,
  },
  {
    id: 'pendulum',
    name: 'بندول',
    category: 'physics',
    keywords: ['بندول', 'رقاص', 'تذبذب', 'دور', 'pendule', 'oscillation'],
    src: pendulum,
    width: 512,
    height: 512,
  },
  {
    id: 'slotted-weights',
    name: 'أثقال مدرّجة',
    category: 'physics',
    keywords: ['أثقال', 'اثقال', 'كتل', 'وزن', 'masselottes', 'poids', 'masse', 'weights'],
    src: slottedWeights,
    width: 512,
    height: 512,
  },
  {
    id: 'vernier-caliper',
    name: 'قدمة ذات الورنية',
    category: 'physics',
    keywords: ['قدمة', 'ورنية', 'قياس', 'أبعاد', 'pied à coulisse', 'pied a coulisse', 'vernier', 'caliper'],
    src: vernierCaliper,
    width: 512,
    height: 512,
  },
  {
    id: 'multimeter',
    name: 'ملتيمتر',
    category: 'physics',
    keywords: ['ملتيمتر', 'فولطمتر', 'أمبيرمتر', 'قياس', 'multimètre', 'multimetre', 'voltmètre', 'ampèremètre'],
    src: multimeter,
    width: 512,
    height: 512,
  },
  {
    id: 'oscilloscope',
    name: 'راسم اهتزاز',
    category: 'physics',
    keywords: ['راسم', 'اهتزاز', 'إشارة', 'موجة', 'oscilloscope', 'oscillo', 'signal'],
    src: oscilloscope,
    width: 512,
    height: 512,
  },
  {
    id: 'magnet',
    name: 'مغناطيس',
    category: 'physics',
    keywords: ['مغناطيس', 'مغنيطيس', 'حقل', 'aimant', 'magnétique', 'magnet'],
    src: magnet,
    width: 512,
    height: 512,
  },
  {
    id: 'tuning-fork',
    name: 'شوكة رنانة',
    category: 'physics',
    keywords: ['شوكة', 'رنانة', 'تردد', 'صوت', 'diapason', 'tuning fork', 'fréquence'],
    src: tuningFork,
    width: 512,
    height: 512,
  },
  {
    id: 'thermometer',
    name: 'مقياس حرارة',
    category: 'physics',
    keywords: ['حرارة', 'ميزان حرارة', 'قياس', 'thermomètre', 'thermometre', 'temperature'],
    src: thermometer,
    width: 512,
    height: 512,
  },
  {
    id: 'stopwatch',
    name: 'ساعة إيقاف',
    category: 'physics',
    keywords: ['ساعة', 'إيقاف', 'توقيت', 'زمن', 'chronomètre', 'chronometre', 'stopwatch', 'minuteur'],
    src: stopwatch,
    width: 512,
    height: 512,
  },
  {
    id: 'power-supply',
    name: 'منبع جهد',
    category: 'physics',
    keywords: ['منبع', 'جهد', 'تغذية', 'مولد', 'alimentation', 'générateur', 'generateur', 'tension', 'power supply'],
    src: powerSupply,
    width: 512,
    height: 512,
  },
  {
    id: 'microscope-slide',
    name: 'شريحة مجهرية',
    category: 'biology',
    keywords: ['شريحة', 'مجهرية', 'زجاج', 'عينة', 'lame', 'lamelle', 'lame porte-objet', 'slide'],
    src: microscopeSlide,
    width: 512,
    height: 512,
  },
  {
    id: 'micropipette',
    name: 'ماصة دقيقة',
    category: 'biology',
    keywords: ['ماصة', 'دقيقة', 'ميكرولتر', 'micropipette', 'pipette automatique'],
    src: micropipette,
    width: 512,
    height: 512,
  },
  {
    id: 'inoculation-loop',
    name: 'حلقة زرع',
    category: 'biology',
    keywords: ['حلقة', 'زرع', 'تلقيح', 'ميكروب', 'anse de platine', 'anse', 'ensemencement', 'loop'],
    src: inoculationLoop,
    width: 512,
    height: 512,
  },
  {
    id: 'dissecting-kit',
    name: 'أدوات تشريح',
    category: 'biology',
    keywords: ['تشريح', 'مشرط', 'مقص', 'ملقط', 'kit de dissection', 'dissection', 'scalpel', 'ciseaux'],
    src: dissectingKit,
    width: 512,
    height: 512,
  },
  {
    id: 'centrifuge',
    name: 'جهاز طرد مركزي',
    category: 'biology',
    keywords: ['طرد مركزي', 'فصل', 'أنابيب', 'centrifugeuse', 'centrifuge', 'centrifugation'],
    src: centrifuge,
    width: 512,
    height: 512,
  },
  {
    id: 'autoclave',
    name: 'جهاز تعقيم (أوتوكلاف)',
    category: 'biology',
    keywords: ['تعقيم', 'أوتوكلاف', 'ضغط', 'بخار', 'autoclave', 'stérilisation', 'sterilisation'],
    src: autoclave,
    width: 512,
    height: 512,
  },
  {
    id: 'incubator',
    name: 'حاضنة',
    category: 'biology',
    keywords: ['حاضنة', 'حضن', 'مزارع', 'بكتيريا', 'incubateur', 'étuve', 'etuve', 'incubator'],
    src: incubator,
    width: 512,
    height: 512,
  },
  {
    id: 'dna-helix',
    name: 'لولب DNA',
    category: 'biology',
    keywords: ['DNA', 'ADN', 'لولب', 'جيني', 'وراثة', 'double hélice', 'génétique', 'genetique'],
    src: dnaHelix,
    width: 512,
    height: 512,
  },
  {
    id: 'cell-model',
    name: 'نموذج خلية',
    category: 'biology',
    keywords: ['خلية', 'نموذج', 'سيتولوجيا', 'عضيات', 'cellule', 'modèle', 'modele', 'cell'],
    src: cellModel,
    width: 512,
    height: 512,
  },
  {
    id: 'microtube',
    name: 'أنبوب دقيق',
    category: 'biology',
    keywords: ['أنبوب', 'دقيق', 'إيبندورف', 'عينة', 'microtube', 'tube eppendorf', 'eppendorf'],
    src: microtube,
    width: 512,
    height: 512,
  },
  {
    id: 'geological-hammer',
    name: 'مطرقة جيولوجية',
    category: 'geology',
    keywords: ['مطرقة', 'جيولوجية', 'صخور', 'ميدان', 'marteau de géologue', 'marteau de geologue', 'marteau', 'geological hammer'],
    src: geologicalHammer,
    width: 512,
    height: 512,
  },
  {
    id: 'hand-lens',
    name: 'عدسة يدوية',
    category: 'geology',
    keywords: ['عدسة', 'يدوية', 'مكبر', 'معادن', 'loupe', 'loupe de terrain', 'hand lens'],
    src: handLens,
    width: 512,
    height: 512,
  },
  {
    id: 'geological-compass',
    name: 'بوصلة جيولوجية',
    category: 'geology',
    keywords: ['بوصلة', 'جيولوجية', 'اتجاه', 'ميل', 'boussole', 'clinomètre', 'compass'],
    src: geologicalCompass,
    width: 512,
    height: 512,
  },
  {
    id: 'rock-sample',
    name: 'عينة صخرية',
    category: 'geology',
    keywords: ['صخر', 'عينة', 'رسوبي', 'ناري', 'roche', 'échantillon', 'echantillon', 'rock sample'],
    src: rockSample,
    width: 512,
    height: 512,
  },
  {
    id: 'mineral-crystal',
    name: 'بلورة معدنية',
    category: 'geology',
    keywords: ['بلورة', 'معدن', 'كوارتز', 'كريستال', 'cristal', 'minéral', 'mineral', 'quartz'],
    src: mineralCrystal,
    width: 512,
    height: 512,
  },
  {
    id: 'fossil',
    name: 'أحفورة',
    category: 'geology',
    keywords: ['أحفورة', 'احفورة', 'مستحاثة', 'أمونيت', 'fossile', 'ammonite', 'fossil'],
    src: fossil,
    width: 512,
    height: 512,
  },
  {
    id: 'sieve',
    name: 'منخل',
    category: 'geology',
    keywords: ['منخل', 'غربلة', 'حبيبات', 'تربة', 'tamis', 'tamisage', 'granulométrie', 'sieve'],
    src: sieve,
    width: 512,
    height: 512,
  },
  {
    id: 'stethoscope',
    name: 'سماعة طبية',
    category: 'health',
    keywords: ['سماعة', 'طبية', 'فحص', 'قلب', 'stéthoscope', 'stethoscope', 'auscultation'],
    src: stethoscope,
    width: 512,
    height: 512,
  },
  {
    id: 'syringe',
    name: 'حقنة',
    category: 'health',
    keywords: ['حقنة', 'إبرة', 'ابر', 'حقن', 'seringue', 'injection', 'aiguille', 'syringe'],
    src: syringe,
    width: 512,
    height: 512,
  },
  {
    id: 'blood-pressure-monitor',
    name: 'جهاز ضغط الدم',
    category: 'health',
    keywords: ['ضغط', 'دم', 'توتومتر', 'tensiomètre', 'tensiometre', 'brassard', 'sphygmomanomètre', 'blood pressure'],
    src: bloodPressureMonitor,
    width: 512,
    height: 512,
  },
  {
    id: 'blood-tube',
    name: 'أنبوب دم',
    category: 'health',
    keywords: ['دم', 'أنبوب', 'سحب', 'تحليل', 'tube de sang', 'prélèvement', 'prelevement', 'vacutainer'],
    src: bloodTube,
    width: 512,
    height: 512,
  },
  {
    id: 'tablets',
    name: 'أقراص دوائية',
    category: 'health',
    keywords: ['أقراص', 'اقراص', 'دواء', 'حب', 'comprimés', 'comprimes', 'cachet', 'tablet'],
    src: tablets,
    width: 512,
    height: 512,
  },
  {
    id: 'capsule',
    name: 'كبسولة',
    category: 'health',
    keywords: ['كبسولة', 'دواء', 'جيلاتين', 'gélule', 'gelule', 'capsule'],
    src: capsule,
    width: 512,
    height: 512,
  },
  {
    id: 'medical-gloves',
    name: 'قفازات طبية',
    category: 'health',
    keywords: ['قفازات', 'طبية', 'حماية', 'gants', 'gants d\'examen', 'gloves'],
    src: medicalGloves,
    width: 512,
    height: 512,
  },
  {
    id: 'face-mask',
    name: 'كمامة طبية',
    category: 'health',
    keywords: ['كمامة', 'قناع', 'وجه', 'حماية', 'masque', 'masque chirurgical', 'mask'],
    src: faceMask,
    width: 512,
    height: 512,
  },
  {
    id: 'heart-model',
    name: 'نموذج قلب',
    category: 'health',
    keywords: ['قلب', 'نموذج', 'تشريح', 'دورة دموية', 'cœur', 'coeur', 'modèle anatomique', 'heart model'],
    src: heartModel,
    width: 512,
    height: 512,
  },
];

/** بحث سريع بالمعرف */
export function assetById(id: string): EquipmentAsset | undefined {
  return EQUIPMENT.find((asset) => asset.id === id);
}

/** توحيد بسيط للاستعلام العربي/اللاتيني: همزات الألف، التاء المربوطة، التشكيل، حالة الأحرف */
export function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '') // تشكيل + تطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[éèêë]/g, 'e') // لهجات لاتينية شائعة في المصطلح الفرنسي
    .replace(/[àâä]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûü]/g, 'u')
    .replace(/ç/g, 'c')
    .trim();
}

/** هل يطابق الأصلُ استعلامَ البحث؟ (الاسم أو الكلمات المفتاحية أو المعرف) */
export function matchesQuery(asset: EquipmentAsset, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  const haystack = [asset.name, ...asset.keywords, asset.id].map(normalizeQuery);
  return haystack.some((text) => text.includes(q));
}
