import { ArrowRight, MapPin } from 'lucide-react';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { GlobeCanvas } from '../GlobeCanvas';
import type { GlobeCanvasArc, GlobeCanvasMarker } from '../GlobeCanvas';
import { MapChart } from '../MapChart';

const WORLD_MARKERS = [
  { id: 'algiers', coordinates: [3.0588, 36.7538] as [number, number], label: 'الجزائر', detail: 'مركز التطبيق' },
  { id: 'cairo', coordinates: [31.2357, 30.0444] as [number, number], label: 'القاهرة', detail: 'فرع إقليمي' },
  { id: 'riyadh', coordinates: [46.6753, 24.7136] as [number, number], label: 'الرياض', detail: 'مركز إقليمي' },
];

// Cobe expects [latitude, longitude], unlike MapChart which expects [longitude, latitude].
const GLOBE_MARKERS: GlobeCanvasMarker[] = [
  { id: 'algiers', location: [36.7538, 3.0588], size: 0.065 },
  { id: 'cairo', location: [30.0444, 31.2357], size: 0.05 },
  { id: 'riyadh', location: [24.7136, 46.6753], size: 0.05 },
  { id: 'paris', location: [48.8566, 2.3522], size: 0.04 },
];
const GLOBE_ARCS: GlobeCanvasArc[] = [
  { id: 'algiers-cairo', from: [36.7538, 3.0588], to: [30.0444, 31.2357] },
  { id: 'algiers-paris', from: [36.7538, 3.0588], to: [48.8566, 2.3522] },
  { id: 'algiers-riyadh', from: [36.7538, 3.0588], to: [24.7136, 46.6753] },
];

const ARAB_VALUES: Readonly<Record<string, number>> = {
  '012': 48,
  '048': 37,
  '174': 26,
  '262': 42,
  '818': 77,
  '368': 53,
  '400': 47,
  '414': 50,
  '422': 45,
  '434': 55,
  '478': 31,
  '504': 69,
  '512': 57,
  '275': 63,
  '634': 74,
  '682': 86,
  '706': 35,
  '729': 39,
  '760': 41,
  '788': 59,
  '784': 83,
  '887': 44,
};

// قيم اصطناعية لشرح التدرّج فقط؛ لا تمثّل إحصاءات حقيقية.
const ALGERIA_DEMO_VALUES = Object.fromEntries(
  Array.from({ length: 69 }, (_, index) => [String(index + 1).padStart(2, '0'), ((index * 37 + 21) % 89) + 11]),
);

const ALGERIA_MARKERS = [
  { id: 'algiers', coordinates: [3.0588, 36.7538] as [number, number], label: 'الجزائر' },
  { id: 'oran', coordinates: [-0.6417, 35.6971] as [number, number], label: 'وهران' },
  { id: 'constantine', coordinates: [6.6147, 36.365] as [number, number], label: 'قسنطينة' },
  { id: 'tamanrasset', coordinates: [5.5228, 22.785] as [number, number], label: 'تمنراست' },
];

/** ?lab=maps — world, Arab-world and the current 69-wilaya Algeria geography. */
export default function MapLab() {
  return (
    <main dir="rtl" className="min-h-full overflow-y-auto bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <MapPin size={16} /> القالب · مختبر الخرائط
            </div>
            <h1 className="mt-1 text-4xl font-black">المكان والانتشار على الخريطة</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              خرائط SVG تفاعلية للعالم والعالم العربي وولايات الجزائر الـ69، إضافةً إلى مجسّم كرة أرضية ثلاثي الأبعاد لتمييز المواقع ومسارات الربط؛ الخلفيات والألوان محلية، والحركة تحترم إعداد تقليل الحركة.
            </p>
          </div>
          <a
            href={window.location.pathname}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartFrame
            title="مراكز التطبيق على مستوى العالم"
            subtitle="خريطة مواقع بعلامات متحركة — اضغط أي منطقة لإضافة تفاعلها."
            note="ثبّت مواقع الفروع أو العملاء لإظهار نطاق التطبيق بسرعة."
            source="إحداثيات العرض توضيحية؛ خريطة الدول من Natural Earth."
          >
            <MapChart variant="world" markers={WORLD_MARKERS} ariaLabel="مواقع التطبيق حول العالم" />
          </ChartFrame>

          <ChartFrame
            title="مقارنة جغرافية للدول العربية"
            subtitle="تلوين القيم تدريجياً وفق اللوحة المتسلسلة المشتركة للمخططات."
            note="يُبرز التدرّج الفروق بين الدول، بينما يحافظ المفتاح على قراءة مباشرة."
            source="قيم اصطناعية للعرض فقط — ليست إحصاءات رسمية."
          >
            <MapChart
              variant="arab-world"
              mode="choropleth"
              values={ARAB_VALUES}
              markers={WORLD_MARKERS}
              legendLabel="مؤشر تجريبي"
              ariaLabel="مقارنة تجريبية بين الدول العربية"
            />
          </ChartFrame>

          <div className="xl:col-span-2">
            <ChartFrame
              title="ولايات الجزائر — 69 ولاية"
              subtitle="الحدود الإدارية الحالية مع تلوين القيم وإبراز المدن بعلامات متحركة."
              note="استخدم رمز الولاية ذي الرقمين لربط بياناتك: 01 أدرار، 16 الجزائر، 31 وهران، 69 الأبيض سيدي الشيخ."
              source="قيم اصطناعية للعرض فقط. حدود الولايات مستمدة من OpenStreetMap وموزعة وفق ODbL-1.0؛ راجع public/maps/NOTICE.md."
            >
              <MapChart
                variant="algeria"
                mode="choropleth"
                values={ALGERIA_DEMO_VALUES}
                markers={ALGERIA_MARKERS}
                legendLabel="مؤشر تجريبي لكل ولاية"
                ariaLabel="خريطة الولايات الجزائرية التسع والستين"
              />
            </ChartFrame>
          </div>

          <div className="xl:col-span-2">
            <ChartFrame
              title="مجسّم الكرة الأرضية ومسارات الربط"
              subtitle="بديل زخرفي عالي الأداء للخريطة المسطّحة في شريحة العنوان أو الانتشار الدولي."
              note="المواقع والمسارات توضيحية. يوقف المجسّم الدوران تلقائياً عند تفضيل تقليل الحركة أو إخفاء الصفحة."
              source="Cobe 2.0.1 · MIT · مجسّم WebGL محمّل عند الحاجة."
            >
              <GlobeCanvas
                markers={GLOBE_MARKERS}
                arcs={GLOBE_ARCS}
                ariaLabel="مجسّم يوضح مراكز الجزائر والقاهرة والرياض وباريس ومسارات الربط بينها"
                className="max-w-[26rem]"
              />
            </ChartFrame>
          </div>
        </div>
      </div>
    </main>
  );
}
