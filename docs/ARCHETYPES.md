# مرجع الأنماط العشرة (Slide Archetypes API)

كل نمط من §5 في [المواصفة](./PRESENTATION_TEMPLATE_SPEC.md) له مكوّن عام في `src/components/archetypes/` يُستورد هكذا:

```tsx
import { ProfileCard, BulletCards, Timeline, OrgTree, Comparison, ProcessFlow,
         DataTable, RelationDiagram, CodeBlock, StatCounters,
         ChapterPreface, ChapterSummary } from '@/components/archetypes';
import { Num, Term, Badge } from '@/components/ui'; // لإبراز الأرقام والمصطلحات داخل الجمل
```

القاعدة العامة: **المكوّن يستقبل بيانات فقط** (نصوص، أرقام، أيقونات `lucide-react`) ويتكفّل بالشكل والحركة. أي حقل من نوع `ReactNode` يقبل JSX مع `<Num>` و`<Term>`.

---

## 1. `profile` — `ProfileCard`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `name` | `string` | اسم المؤسسة/المنتج/الشخص |
| `description` | `ReactNode` | 2–3 جمل |
| `tag?` | `string` | وسم فوق الاسم (القطاع…) |
| `icon?` | `LucideIcon` | الافتراضي `Building2` |
| `facts` | `{ label; value: ReactNode; icon? }[]` | **3–4** حقائق جانبية |

## 2. `bullets` — `BulletCards`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `items` | `{ title; description?; icon?; tag?; tagTone? }[]` | **4–6** عناصر (يُقتطع عند 6) |
| `columns?` | `2 \| 3` | الافتراضي 3 |
| `numbered?` | `boolean` | يُظهر رقم العنصر مع الأيقونة |

بدون `icon` يُعرض رقم العنصر تلقائياً. `tagTone`: `neutral | accent | success | warning | danger | info`.

## 3. `timeline` — `Timeline`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `items` | `{ label; title; description?; icon?; highlight? }[]` | `label` = السنة/التوقيت/اسم المرحلة |
| `orientation?` | `'horizontal' \| 'vertical'` | أفقي للمحطات القصيرة (≤ 6)، رأسي للمراحل المشروحة |

## 4. `tree` — `OrgTree`

| الخاصية | النوع |
|---|---|
| `root` | `TreeNode = { label; role?; icon?; children?: TreeNode[] }` |

يُفضَّل ألا يتجاوز العمق 3 مستويات والعرض 4 فروع في المستوى الثاني.

## 5. `comparison` — `Comparison`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `fromTitle` | `string` | عنوان الصف الأول (قبل / مشكلة) — يظهر على اليمين |
| `toTitle` | `string` | عنوان الصف الثاني (بعد / حل) — يظهر على اليسار |
| `pairs` | `{ from: ReactNode; to: ReactNode }[]` | **3–5** أزواج |

## 6. `process` — `ProcessFlow`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `steps` | `{ title; description?; icon?; meta?; highlight? }[]` | **3–7** خطوات؛ `meta` = مدة/قيمة مُبرزة («4 د»)؛ `highlight` لعنق الزجاجة |

## 7. `table` — `DataTable`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `columns` | `{ key; label; mono?; align?; width? }[]` | `mono` للمعرفات والرموز (LTR تلقائياً) |
| `rows` | `Record<string, ReactNode>[]` | المفاتيح = `columns[].key` |
| `caption?` | `string` | المصدر/الملاحظة |
| `dense?` | `boolean` | صفوف مضغوطة للجداول الطويلة (≤ 8 صفوف مستحسن) |

## 8. `relation` — `RelationDiagram`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `entities` | `{ id; name; attributes: string[]; x; y }[]` | `x`,`y` نسب مئوية (0–100) داخل اللوحة؛ أول خاصية تُسطَّر كمفتاح |
| `relations` | `{ from; to; label; fromCard; toCard }[]` | `fromCard`/`toCard` مثل `'1,n'` |
| `aspect?` | `string` | نسبة أبعاد اللوحة، الافتراضي `'16 / 8'` |

نصيحة توزيع: صفّان (y = 28 و 78) وثلاثة أعمدة (x = 14، 50، 86) يكفيان لـ 5–6 كيانات.

## 9. `code` — `CodeBlock`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `code` | `string` | يُعرض بأرقام أسطر و`dir="ltr"` |
| `title?` | `string` | اسم الملف/النموذج في شريط النافذة |
| `language?` | `string` | شارة اللغة |
| `highlightLines?` | `number[]` | أسطر مُبرزة (1-based) |
| `aside?` | `{ title; points: string[] }` | شرح جانبي (قواعد الترجمة مثلاً) |

## 10. `stats` — `StatCounters`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `stats` | `{ value: number; label; prefix?; suffix?; icon?; tag?; tagTone?; trend?; decimals? }[]` | **3–6** مؤشرات؛ العدّاد يصعد إلى `value` |
| `columns?` | `2 \| 3` | |

`trend = { direction: 'up' | 'down'; note: string; positive?: boolean }` — `positive` يحدد اللون (أخضر/أحمر) بغضّ النظر عن الاتجاه.

---

## شريحتا الحصر

### `chapter-preface` — `ChapterPreface`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `number` | `number` | رقم الفصل |
| `lead` | `string` | جملة الانتقال (تُكشف بالكلمات) |
| `question` | `string` | سؤال الفصل المشتق من الإشكالية |
| `outline` | `string[]` | عناوين شرائح الفصل بالترتيب (دون التمهيد والخلاصة) |
| `note?` | `ReactNode` | |

### `chapter-summary` — `ChapterSummary`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `points` | `string[]` | **3–5** نقاط |
| `answer?` | `string` | الإجابة المباشرة عن سؤال الفصل في جملة |
| `nextHint?` | `string` | جسر إلى الفصل التالي (يُحذف في الفصل الأخير) |

---

## عناصر الإبراز داخل الجمل (`@/components/ui`)

| المكوّن | الاستعمال |
|---|---|
| `<Num>23 دقيقة</Num>` | رقم مُبرز (قاعدة §9.4) |
| `<Term>MERISE</Term>` | مصطلح/معرّف تقني — LTR + خط أحادي |
| `<Badge tone="success">قائم</Badge>` | وسم حالة؛ `mono` للأكواد |
| `<WordReveal text="…" />` | كشف نص بالكلمات — **لا بالحروف** (قاعدة §9.5) |
| `<Card>` / `<Stagger>` | بطاقة زجاجية / حاوية إظهار متتابع، لبناء كتل مخصّصة عند الحاجة |

## إضافة نمط جديد (نادراً)

1. أضف الاسم إلى `SlideArchetype` في `src/types/presentation.ts`.
2. أنشئ المكوّن في `src/components/archetypes/` وصدّره من `index.ts`.
3. وثّقه هنا، وأضف شريحة تستعمله في المثال حتى يغطيه اختبار العرض (`render.test.tsx`).
