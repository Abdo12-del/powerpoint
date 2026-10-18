# مصدر الشفرة المستعارة في طبقة الرسوم (Provenance)

| الملف | المصدر | الالتزام (commit) | الرخصة | التكييف |
|---|---|---|---|---|
| `recharts/chart.tsx` | shadcn/ui — https://github.com/shadcn-ui/ui — `apps/v4/registry/new-york-v4/ui/chart.tsx` | `daaf156` (2026-10-18) | MIT © shadcn (`LICENSES/shadcn-ui.LICENSE.md`) | ألوان القالب الداكن بدل رموز shadcn (`bg-background`…)، حذف سمة light، الحاوية `dir="ltr"` والتلميح/المفتاح `dir="rtl"`، الأرقام عبر `formatNumber` (محلية القالب)، `cn` من `@/lib/cn` |

كل ما عدا ذلك في هذا المجلد شفرة أصلية للقالب (الرسوم الحركية المخصّصة، السمات، المغلّفات الكسولة).

المكتبات المثبّتة من npm (لا تُنسخ): recharts (MIT)، @nivo/* (MIT)، chart.js + react-chartjs-2 + chartjs-plugin-datalabels (MIT)، echarts (Apache-2.0) + echarts-for-react (MIT)، d3-scale/d3-shape/d3-array/d3-interpolate (ISC).
