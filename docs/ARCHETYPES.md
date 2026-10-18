# مرجع الأنماط العشرة (Slide Archetypes API)

كل نمط من §5 في [المواصفة](./PRESENTATION_TEMPLATE_SPEC.md) له مكوّن عام في `src/components/archetypes/` يُستورد هكذا:

```tsx
import { ProfileCard, BulletCards, Timeline, OrgTree, Comparison, ProcessFlow,
         DataTable, RelationDiagram, CodeBlock, StatCounters,
         ChapterPreface, ChapterSummary } from '@/components/archetypes';
import { Num, Term, Badge, Placeholder } from '@/components/ui'; // لإبراز الأرقام والمصطلحات داخل الجمل
```

القاعدة العامة: **المكوّن يستقبل بيانات فقط** (نصوص، أرقام، أيقونات `lucide-react`) ويتكفّل بالشكل والحركة. أي حقل من نوع `ReactNode` يقبل JSX مع `<Num>` و`<Term>`.

> القالب يأتي فارغاً: كل شريحة محور تحمل `archetype: 'placeholder'` و`content: <Placeholder />`. لتعبئتها: غيّر `archetype` إلى مفتاح النمط، واستبدل `<Placeholder />` بالمقتطف المقابل أدناه.

---

## 1. `profile` — `ProfileCard`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `name` | `string` | اسم المؤسسة/المنتج/الشخص |
| `description` | `ReactNode` | 2–3 جمل |
| `tag?` | `string` | وسم فوق الاسم (القطاع…) |
| `icon?` | `LucideIcon` | الافتراضي `Building2` |
| `facts` | `{ label; value: ReactNode; icon? }[]` | **3–4** حقائق جانبية |

```tsx
<ProfileCard
  tag="مؤسسة عمومية — قطاع الصحة"
  name="المؤسسة"
  icon={Building2}
  description="تعريف من جملتين إلى ثلاث: النشاط، الموقع، الحجم."
  facts={[
    { label: 'سنة التأسيس', value: '2012', icon: CalendarCheck },
    { label: 'عدد العاملين', value: '18 عاملاً', icon: Users },
    { label: 'الطاقة', value: '40 وحدة', icon: Boxes },
  ]}
/>
```

## 2. `bullets` — `BulletCards`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `items` | `{ title; description?; icon?; tag?; tagTone? }[]` | **4–6** عناصر (يُقتطع عند 6) |
| `columns?` | `2 \| 3` | الافتراضي 3 |
| `numbered?` | `boolean` | يُظهر رقم العنصر مع الأيقونة |

بدون `icon` يُعرض رقم العنصر تلقائياً. `tagTone`: `neutral | accent | success | warning | danger | info`.

```tsx
<BulletCards
  items={[
    { icon: Timer, title: 'تقليص زمن الانتظار', description: <>إلى أقل من <Num>15 دقيقة</Num>.</> },
    { icon: ShieldCheck, title: 'صلاحيات حسب الدور', description: <>نموذج <Term>RBAC</Term>.</>, tag: 'مقترح', tagTone: 'info' },
    { title: 'عنصر بلا أيقونة', description: 'يُعرض برقمه تلقائياً.' },
    { title: 'عنصر رابع' },
  ]}
/>
```

## 3. `timeline` — `Timeline`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `items` | `{ label; title; description?; icon?; highlight? }[]` | `label` = السنة/التوقيت/اسم المرحلة |
| `orientation?` | `'horizontal' \| 'vertical'` | أفقي للمحطات القصيرة (≤ 6)، رأسي للمراحل المشروحة |

```tsx
<Timeline
  orientation="vertical"
  items={[
    { label: 'الأسبوعان 1 – 2', title: 'المرحلة الأولى', description: 'ما يُنجز فيها.', icon: Receipt },
    { label: 'الأسبوعان 3 – 4', title: 'المرحلة الثانية', description: '…', highlight: true },
    { label: 'بعد 8 أسابيع', title: 'التقييم', description: '…' },
  ]}
/>
```

## 4. `tree` — `OrgTree`

| الخاصية | النوع |
|---|---|
| `root` | `TreeNode = { label; role?; icon?; children?: TreeNode[] }` |

يُفضَّل ألا يتجاوز العمق 3 مستويات والعرض 4 فروع في المستوى الثاني.

```tsx
<OrgTree
  root={{
    label: 'المدير العام', role: 'المالك', icon: UserCog,
    children: [
      { label: 'مصلحة أ', role: 'الدور', children: [{ label: 'فرع 1', role: '6 أعوان' }, { label: 'فرع 2' }] },
      { label: 'مصلحة ب', role: 'الدور', children: [{ label: 'فرع 3' }] },
    ],
  }}
/>
```

## 5. `comparison` — `Comparison`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `fromTitle` | `string` | عنوان الصف الأول (قبل / مشكلة) — يظهر على اليمين |
| `toTitle` | `string` | عنوان الصف الثاني (بعد / حل) — يظهر على اليسار |
| `pairs` | `{ from: ReactNode; to: ReactNode }[]` | **3–5** أزواج |

```tsx
<Comparison
  fromTitle="الوضع الحالي"
  toTitle="الحل المقترح"
  pairs={[
    { from: <>تسجيل ورقي → أخطاء بنسبة <Num>7%</Num>.</>, to: 'تسجيل رقمي يُرسل فوراً.' },
    { from: 'لا تتبع للزمن.', to: <>مؤقّت لكل عملية مع تنبيه عند <Num>10 دقائق</Num>.</> },
    { from: 'غياب مؤشرات.', to: <>لوحة <Term>KPI</Term> يومية.</> },
  ]}
/>
```

## 6. `process` — `ProcessFlow`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `steps` | `{ title; description?; icon?; meta?; highlight? }[]` | **3–7** خطوات؛ `meta` = مدة/قيمة مُبرزة («4 د»)؛ `highlight` لعنق الزجاجة |

```tsx
<ProcessFlow
  steps={[
    { title: 'الاستقبال', meta: '2 د', description: 'وصف قصير.' },
    { title: 'التسجيل', meta: '4 د' },
    { title: 'النقل', meta: '3 – 9 د', description: 'عنق الزجاجة.', highlight: true },
    { title: 'التنفيذ', meta: '8 د' },
    { title: 'التسليم', meta: '2 د' },
  ]}
/>
```

## 7. `table` — `DataTable`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `columns` | `{ key; label; mono?; align?; width? }[]` | `mono` للمعرفات والرموز (LTR تلقائياً) |
| `rows` | `Record<string, ReactNode>[]` | المفاتيح = `columns[].key` |
| `caption?` | `string` | المصدر/الملاحظة |
| `dense?` | `boolean` | صفوف مضغوطة للجداول الطويلة (≤ 8 صفوف مستحسن) |

```tsx
<DataTable
  dense
  caption="المصدر: دراسة الوثائق"
  columns={[
    { key: 'code', label: 'الرمز', mono: true, width: '16%' },
    { key: 'label', label: 'التسمية', width: '24%' },
    { key: 'type', label: 'النوع', mono: true, width: '14%' },
    { key: 'rule', label: 'قاعدة التسيير' },
  ]}
  rows={[
    { code: 'NUM_CMD', label: 'رقم الطلب', type: 'N(8)', rule: <>معرّف آلي — <Badge tone="accent" className="text-xs">مفتاح</Badge></> },
    { code: 'DATE_CMD', label: 'تاريخ الطلب', type: 'DATETIME', rule: 'يُسجَّل لحظة الإدخال' },
  ]}
/>
```

## 8. `relation` — `RelationDiagram`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `entities` | `{ id; name; attributes: string[]; x; y }[]` | `x`,`y` نسب مئوية (0–100) داخل اللوحة؛ أول خاصية تُسطَّر كمفتاح |
| `relations` | `{ from; to; label; fromCard; toCard }[]` | `fromCard`/`toCard` مثل `'1,n'` |
| `aspect?` | `string` | نسبة أبعاد اللوحة، الافتراضي `'16 / 8'` |

نصيحة توزيع: صفّان (y = 28 و 78) وثلاثة أعمدة (x = 14، 50، 86) يكفيان لـ 5–6 كيانات.

```tsx
<RelationDiagram
  entities={[
    { id: 'client', name: 'زبون CLIENT', attributes: ['id_client', 'nom'], x: 14, y: 28 },
    { id: 'commande', name: 'طلب COMMANDE', attributes: ['num_cmd', 'date_cmd'], x: 50, y: 28 },
    { id: 'plat', name: 'طبق PLAT', attributes: ['code_plat', 'prix'], x: 50, y: 78 },
  ]}
  relations={[
    { from: 'client', to: 'commande', label: 'يقدّم', fromCard: '1,n', toCard: '1,1' },
    { from: 'commande', to: 'plat', label: 'يتضمن (qte)', fromCard: '1,n', toCard: '0,n' },
  ]}
/>
```

## 9. `code` — `CodeBlock`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `code` | `string` | يُعرض بأرقام أسطر و`dir="ltr"` |
| `title?` | `string` | اسم الملف/النموذج في شريط النافذة |
| `language?` | `string` | شارة اللغة |
| `highlightLines?` | `number[]` | أسطر مُبرزة (1-based) |
| `aside?` | `{ title; points: string[] }` | شرح جانبي (قواعد الترجمة مثلاً) |

```tsx
<CodeBlock
  title="schema.sql"
  language="PostgreSQL"
  highlightLines={[2]}
  code={`
CREATE TABLE commande (
  num_cmd   BIGSERIAL PRIMARY KEY,
  date_cmd  TIMESTAMP NOT NULL DEFAULT now()
);`}
  aside={{ title: 'قواعد الترجمة', points: ['كل كيان ← جدول.', 'المعرّف ← مفتاح رئيسي.'] }}
/>
```

## 10. `stats` — `StatCounters`

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `stats` | `{ value: number; label; prefix?; suffix?; icon?; tag?; tagTone?; trend?; decimals? }[]` | **3–6** مؤشرات؛ العدّاد يصعد إلى `value` |
| `columns?` | `2 \| 3` | |

`trend = { direction: 'up' | 'down'; note: string; positive?: boolean }` — `positive` يحدد اللون (أخضر/أحمر) بغضّ النظر عن الاتجاه.

```tsx
<StatCounters
  stats={[
    { icon: Clock, value: 23, suffix: 'دقيقة', label: 'متوسط زمن الخدمة', tag: 'مُقاس', tagTone: 'info',
      trend: { direction: 'up', note: 'يصل إلى 35 في الذروة', positive: false } },
    { icon: Smile, value: 68, suffix: '%', label: 'نسبة الرضا', tag: 'استبيان' },
    { icon: Repeat, value: 2.1, decimals: 1, label: 'معدل الدوران' },
  ]}
/>
```

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

### `placeholder` — `Placeholder` (مؤقت)

| الخاصية | النوع | ملاحظة |
|---|---|---|
| `hint?` | `ReactNode` | ما الذي يجب أن يوضع هنا |
| `suggested?` | `string` | مفتاح نمط مقترح يُبرز في القائمة |
| `compact?` | `boolean` | إخفاء قائمة الأنماط (يُستعمل في المقدمة) |

تحذير `slide.placeholder` في التحقق يبقى ما دامت شريحة واحدة بهذا النمط.

---

## عناصر الإبراز داخل الجمل (`@/components/ui`)

| المكوّن | الاستعمال |
|---|---|
| `<Num>23 دقيقة</Num>` | رقم مُبرز (قاعدة §9.4) |
| `<Term>MERISE</Term>` | مصطلح/معرّف تقني — LTR + خط أحادي |
| `<Badge tone="success">قائم</Badge>` | وسم حالة؛ `mono` للأكواد |
| `<WordReveal text="…" />` | كشف نص بالكلمات — **لا بالحروف** (قاعدة §9.5) |
| `<Card>` / `<Stagger>` | بطاقة زجاجية / حاوية إظهار متتابع، لبناء كتل مخصّصة عند الحاجة (المقدمة مثلاً) |

### مثال كتلة مخصّصة لخطوة «الإشكالية» في المقدمة

```tsx
<Stagger className="mx-auto flex max-w-5xl flex-col gap-6">
  <Card highlight className="p-8 text-center">
    <div className="text-sm font-bold text-amber-300">سؤال البحث المركزي</div>
    <p className="mt-3 text-3xl font-extrabold leading-snug">كيف يمكن … دون … ؟</p>
  </Card>
  <div className="grid gap-4 sm:grid-cols-3">
    <Card><Badge tone="danger">العَرَض 1</Badge><h4 className="mt-2 text-lg font-bold">…</h4><p className="mt-1 text-slate-300">… <Num>23 دقيقة</Num>.</p></Card>
    {/* عَرَضان آخران */}
  </div>
</Stagger>
```

## إضافة نمط جديد (نادراً)

1. أضف الاسم إلى `SlideArchetype` في `src/types/presentation.ts`.
2. أنشئ المكوّن في `src/components/archetypes/` وصدّره من `index.ts`.
3. وثّقه هنا، وأضف له اختبار عرض في `src/__tests__/archetypes.test.tsx`.
