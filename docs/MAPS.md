# الخرائط الجغرافية

مكوّنا `MapChart` و`GlobeCanvas` يقدّمان خرائط SVG محلية ومجسّماً زخرفياً للكرة الأرضية في الشرائح: خريطة العالم، الدول العربية، وولايات الجزائر الـ69، أو مواقع ومسارات على كرة WebGL. يدعمان إبراز مكان التطبيق والمقارنة الجغرافية من دون إضافة نمط شريحة حادي عشر؛ اختر `MapChart` للقيم الجغرافية، و`GlobeCanvas` للانتشار البصري ومسارات الربط.

## ما أُضيف

| المسار | المحتوى |
|---|---|
| `src/components/maps/MapChart.tsx` | نقطة الدخول الخفيفة؛ تحميل `MapCanvas` والاعتمادات الجغرافية على حدة |
| `src/components/maps/GlobeCanvas.tsx` | مجسّم Cobe/WebGL محمّل ديناميكياً؛ نقاط ومسارات، ألوان من سمة العرض، وتقليل حركة/بديل CSS عند غياب WebGL |
| `src/components/maps/MapCanvas.tsx` | العرض بـ `react-simple-maps`، الإسقاطات، تلوين القيم، مفتاح الألوان، العلامات، والعناوين |
| `src/components/maps/map-data.ts` | جلب ملفات GeoJSON/TopoJSON من `public/`، تحويل TopoJSON، تصفية الدول العربية، وضبط اتجاه حلقات حدود الجزائر لـ `d3-geo` |
| `src/components/maps/types.ts` | عقود `MapChart`, `MapMarker`, `MapRegion` والمتغيرات |
| `src/components/maps/lab/MapLab.tsx` | المختبر `?lab=maps`: خرائط العالم والعالم العربي والجزائر |
| `public/maps/` | ملف الدول العالمي 50m وحدود ولايات الجزائر؛ لا اتصال بمزوّد خرائط خارجي |
| `public/maps/NOTICE.md` | المصادر والإسناد ورخص بيانات الخرائط وتسمياتها |
| `src/components/maps/maps.test.ts` | تحقق ملفات الجغرافيا، 22 دولة عربية، 69 ولاية، الأكواد، نطاق الألوان واتجاه المضلع |
| `src/components/maps/GlobeCanvas.test.tsx` | وصول بديل، تهيئة Cobe من ألوان السمة، الالتزام بتقليل الحركة، التنظيف وبديل WebGL |

## تثبيت الحزم والرخص

| الحزمة | الإصدار المثبّت | الرخصة | الدور |
|---|---:|---|---|
| `react-simple-maps` | 5.0.5 | MIT | مكوّنات SVG والإسقاطات والتعامل مع الجغرافيا؛ نطاق النظير يدعم React/React DOM 19 |
| `cobe` | 2.0.1 | MIT | كرة أرضية WebGL خفيفة؛ صفر تبعيات وقت تشغيل، بلا React peer (يُحمّل ديناميكياً من `GlobeCanvas`) |
| `d3-geo` | 3.1.1 | ISC | الإسقاط، مركز المعلم، والتحقق/تصحيح اتجاه الحلقات الجغرافية |
| `topojson-client` | 3.1.0 | ISC | تحويل TopoJSON إلى معالم GeoJSON |
| `@types/d3-geo`, `@types/topojson-client` | 3.1.1 / 3.1.5 | MIT | تعريفات TypeScript |

مصدر `cobe`: [المستودع الرسمي](https://github.com/shuding/cobe)، MIT، الإصدار 2.0.1. الحزمة بلا تبعيات وقت تشغيل ولا peer لـ React، لذلك لا تفرض نسخة React منفصلة عن React 19 في القالب. يذكر README upstream مصدر خريطة الكرة الأرضية المضمّنة (ملف Wikipedia «World map blank without borders»)، ونحملها من الحزمة نفسها دون ملف خارجي.

لا يُحمّل أي ملف خرائط أو بلاطات من شبكة خارجية عند التشغيل؛ بيانات `MapChart` محلية في `public/maps/`، وملمس الكرة الأرضية مضمن داخل حزمة Cobe. جميع المكونات تحترم `BASE_URL` عند النشر تحت مسار GitHub Pages.

## البداية السريعة

```tsx
import { ChartFrame } from '@/components/charts';
import { MapChart } from '@/components/maps';

<ChartFrame
  title="يركّز التطبيق على المدن الكبرى"
  note="الجزائر ووهران وقسنطينة هي نقاط الانطلاق."
  source="مصدر البيانات وتاريخها"
>
  <MapChart
    variant="algeria"
    mode="choropleth"
    values={{ '01': 42, '16': 86, '31': 68, '25': 59 }}
    selectedIds={['16']}
    markers={[
      { id: 'algiers', coordinates: [3.0588, 36.7538], label: 'الجزائر', detail: 'مقرّ التطبيق' },
      { id: 'oran', coordinates: [-0.6417, 35.6971], label: 'وهران' },
    ]}
    legendLabel="مؤشر الاستخدام"
    ariaLabel="مؤشر استخدام التطبيق حسب الولاية"
  />
</ChartFrame>
```

`MapChart` يدخل داخل `content` لنمط قائم مثل `profile` أو `comparison` أو `stats` أو `process`. أبقِ عنوان الشريحة خبرياً ورسالة الخريطة واحدة.

لانتشار بصري على كرة أرضية في شريحة العنوان أو الأثر، استخدم `GlobeCanvas`. هذا المكوّن للزخرفة ومسارات الربط، وليس بديلاً عن choropleth أو خريطة إحصائية:

```tsx
import { GlobeCanvas } from '@/components/maps';

<GlobeCanvas
  ariaLabel="مراكز الجزائر والقاهرة ومسارات الربط بينهما"
  markers={[
    { id: 'algiers', location: [36.7538, 3.0588], size: 0.06 }, // [latitude, longitude]
    { id: 'cairo', location: [30.0444, 31.2357], size: 0.05 },
  ]}
  arcs={[{ from: [36.7538, 3.0588], to: [30.0444, 31.2357] }]}
/>
```

على عكس `MapChart` (إحداثيات `[longitude, latitude]`)، تتبع `GlobeCanvas` ترتيب Cobe `[latitude, longitude]`. يستمد ألوانه افتراضياً من متغيرات سمة العرض، ويتوقف عند تقليل الحركة أو إخفاء الصفحة، ويعرض كرة CSS بديلة إن لم يتوفر WebGL.

## الأنواع ومعرّفات البيانات

| `variant` | المحتوى | مفتاح `values` / `selectedIds` |
|---|---|---|
| `world` | دول العالم من Natural Earth (50m) | رمز ISO-3166-1 الرقمي، 3 خانات: `'012'` للجزائر، `'840'` للولايات المتحدة |
| `arab-world` | الدول الـ22 الأعضاء في جامعة الدول العربية، ومنها البحرين وجزر القمر وفلسطين | الرمز الرقمي نفسه ذي 3 خانات |
| `algeria` | الولايات الـ69 وفق التقسيم الإداري المعتمد في 2026 | رقم الولاية، من `'01'` إلى `'69'`؛ يقبل lookup كذلك الرقم غير المصفّر مثل `'16'` |

العلامات الجغرافية تأخذ الإحداثيات بترتيب **`[longitude, latitude]`**. عناوين الدول العربية والولايات عربية افتراضياً، و`labelLocale="fr"` أو `"dual"` يبدّل عرض أسماء الخرائط الإقليمية. أسماء دول العالم غير المدرجة في سجل الدول العربية تبقى بالاسم المتاح في Natural Earth.

`onRegionClick(region)` يعطي `{ id, label, value, feature }`، وتصبح حدود المناطق قابلة للوصول بلوحة المفاتيح. `showRegionLabels` يحسب مراكز المعالم عبر `d3-geo`؛ استخدمه في خريطة إقليمية صغيرة فقط، لأن أسماء كل دول العالم أو الولايات قد تتزاحم.

| الخاصية | الافتراضي | الاستعمال |
|---|---|---|
| `mode` | `"location"` | `"choropleth"` لتلوين القيم الرقمية وعرض المفتاح |
| `values` | — | قاموس أرقام بالمفاتيح أعلاه؛ يقبل الصفر ويهمل القيم غير المحدودة |
| `markers` | `[]` | `{ id, coordinates: [lon, lat], label, detail?, color?, pulse? }`؛ النبض يعمل افتراضياً |
| `selectedIds` | `[]` | تمييز مناطق مختارة بأصفر السمة |
| `colorScale` | `CHART_SEQUENTIAL` | تجاوز اختياري لتدرج choropleth |
| `labelLocale` | `"ar"` | `"ar"`, `"fr"`, `"en"`, أو `"dual"` |
| `showLegend` / `legendLabel` | تلقائي / بلا عنوان | إظهار مفتاح التدرج وعنوانه |
| `showGrid` | نعم، ما عدا خريطة الجزائر | خطوط طول/عرض رقيقة |
| `showMarkerLabels` / `showRegionLabels` | نعم / لا | إظهار تسميات العلامات أو أسماء المناطق عند مراكزها |
| `onRegionClick` / `onMarkerClick` | — | callbacks تفاعلية؛ المناطق تدعم Enter/Space |

## Choropleth والألوان

- `mode="choropleth"` يوزّع القيم الرقمية تلقائياً على `CHART_SEQUENTIAL` من `src/components/charts/theme.ts`، ويعرض مفتاحاً متدرجاً من أصغر قيمة إلى أكبرها.
- المنطقة بلا قيمة تستخدم لون «لا توجد بيانات»؛ القيم غير المحدودة/غير الرقمية تُهمل.
- `colorScale` يتيح تدرجاً مخصصاً، مع إبقاء التدرج الافتراضي موحّداً مع الرسوم الأخرى.
- العلامات تختار ألوانها من `CHART_COLORS`؛ التحديد والإطار والشبكة يستخدمون `CHART_SEMANTIC`.
- `mode="location"` هو الوضع الافتراضي لإظهار أماكن التطبيق والفروع دون الحاجة إلى مجموعة قيم.

## الحركة وRTL وإمكانية الوصول

- كل علامة تنبض باستخدام `framer-motion`، وتظهر تسميات عربية على الخريطة؛ `pulse={false}` يوقف الحركة لعلامة بعينها، و`prefers-reduced-motion` يوقف النبض للجميع.
- SVG الإسقاطات يبقى في إحداثيات جغرافية صحيحة؛ ترتيب بيانات الدول أو الولايات لا يتأثر باتجاه RTL. عناوين المناطق العربية تُرسم باتجاه RTL، وواجهة المختبر عربية.
- عناصر المناطق التفاعلية تدعم Enter/Space و`aria-label`؛ العلامات التفاعلية اختيارية عبر `onMarkerClick`.
- خريطة SVG تبقى حادة عند التكبير، ويمكن إعادة استعمالها داخل شريحة أو بطاقة. لا تضف تأثير حركة ثانياً يزاحم العلامات.

## بيانات العرض والمصادر

| الملف | المصدر | القيود |
|---|---|---|
| `public/maps/world-countries-50m.json` (~756 KB) | `world-atlas@2.0.2`, طبقة Natural Earth 1:50m | Natural Earth في الملك العام؛ إشعار ISC لـ world-atlas محفوظ في `public/maps/NOTICE.md`. بيانات خرائط عرض، لا حدود مساحية قانونية. |
| `public/maps/algeria-wilayas-69.geojson` (~123 KB) | `geoalgeria@2.3.0`, `data/geojson/wilaya-boundaries.geojson` | حدود إدارية مستمدة من OpenStreetMap؛ © OpenStreetMap contributors، قاعدة البيانات ODbL 1.0. بيانات مبسطة للعرض لا للمسح المساحي. |
| `ALGERIA_WILAYA_NAMES` في `map-data.ts` | `geoalgeria@2.3.0`, `data/wilayas.json` | تجميعة الأسماء العربية/الفرنسية مرخصة MIT، مع إشعارها في `public/maps/NOTICE.md`. |

يعرض المختبر أرقاماً اصطناعية لتوضيح التدرج؛ لا تستخدمها كإحصاءات. عند وضع بيانات حقيقية، اكتب المصدر والتاريخ في `ChartFrame.source`، وتحقق من مطابقة الأكواد والوحدات والفترة الزمنية. تفاصيل الإسناد والاستعمال وإعادة التوزيع: [`public/maps/NOTICE.md`](../public/maps/NOTICE.md).

## الاختبار والتحقق

```bash
npx vitest run src/components/maps/maps.test.ts
npm run check
```

الاختبارات تتحقق من ملف 69 ولاية، وجود كل الدول العربية الـ22 (ومنها الجزر الصغيرة)، تصحيح حلقات الحدود لـ d3-geo، معرّفات البيانات، lookup القيم، ومجالات الألوان. لا تُطبّق `npm audit fix` كجزء من إضافة الخرائط.
