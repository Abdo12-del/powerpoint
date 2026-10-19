---
name: technical-diagrams-code
description: Build technical memo slides with Mermaid 12 diagrams, Shiki-highlighted code and diffs, interactive React Flow/Dagre graphs, and Excalidraw hand-drawn diagrams. Covers template theme, Arabic RTL, progressive edges, lazy loading, and licensing. استخدمها عند إضافة مخطط تقني أو شفرة لمذكرة.
metadata:
  short-description: مخططات تقنية وشفرة للمذكرات
---

# مخططات تقنية وشفرة للمذكرات

اقرأ [`docs/DIAGRAMS_CODE.md`](../../../docs/DIAGRAMS_CODE.md) لمرجع API كامل. المختبر الحي `/?lab=diagrams`.

## اختر طبقة واحدة تناسب الرسالة

| ما يحتاجه القارئ | المكوّن |
|---|---|
| مخطط ثابت ومصدري (flow / sequence / MCD / MLD / UML) | `MermaidDiagram` من `@/components/diagrams` |
| شفرة أو SQL أو diff | `CodeBlock` من `@/components/archetypes` — Shiki 4 |
| شبكة عقد قابلة للسحب/التكبير (tree / relation / process) | `NodeDiagram` (React Flow + Dagre) |
| رسم مفاهيمي عفوي «بخط اليد» | `ExcalidrawBoard` |

لا تضف نمط شريحة جديداً لمجرد اختلاف وسيلة الرسم؛ ضع المكوّن داخل `content` لنمط `relation`, `process`, `tree` أو `code` المناسب.

## RTL والسمة والحركة

- Mermaid يرث سمة القالب (`base` الداكنة، amber/sky) و`securityLevel: 'strict'` تلقائياً. لا تضع init directive لتغيير السمة في مصدر المخطط.
- للـ flowchart العربي اكتب `flowchart RL`; للشجرة `TB`. في sequence diagram صرّح بالمشارك الموجود يميناً أخيراً، فترتيب Mermaid المرئي من اليسار إلى اليمين.
- التسميات تستخدم `dir=auto` و`unicode-bidi: plaintext` كي تبقى الأرقام والمعرّفات LTR داخل العربية. اكتب أسماء كيانات قصيرة وأظهر الحقول التقنية داخل `code`/`Term` حيث أمكن.
- الوصلات تُرسم تدريجياً تلقائياً في Mermaid. يوقف `prefers-reduced-motion` الرسم وطبقة `animatedBeams`.
- React Flow يستعمل `direction="RL"` افتراضياً لعلاقة/إجراء و`TB` للشجرة. إذا أردت وضعاً يدوياً مرّر مواضع العقد مع `layout="manual"`.
- حد الشريحة: نحو 8 عقد و10 روابط، أو قسّم المخطط. لا تُظهر شبكة كاملة لا يمكن قراءتها من آخر القاعة.
- الشفرة والعناوين/المعرفات داخلها `dir="ltr"`; استخدم `highlightLines` لتوجيه النظر إلى بضعة أسطر، لا لتلوين كل كتلة.

## وصفات قصيرة

```tsx
<MermaidDiagram source={`flowchart RL\n  A[استقبال] --> B{مكتمل؟}\n  B -- نعم --> C[اعتماد]`} label="مسار الطلب" />

<CodeBlock language="TypeScript" diff highlightLines={[4]} code={patch} />

<NodeDiagram pattern="relation" direction="RL" nodes={nodes} edges={edges} animatedBeams />

<ExcalidrawBoard elements={sceneElements} editable={false} />
```

`CodeBlock` يلوّن عند الطلب، ويُبقي النص الخام إذا لم تُحمّل اللغة. `ExcalidrawBoard` للقراءة فقط افتراضياً؛ التحرير المؤقت لا يُحفظ ما لم تُخزّن `onChange` خارجياً.

## الحزم والرخصة والأداء

- الحزم المباشرة Mermaid 12، Shiki 4، `@xyflow/react`، `@dagrejs/dagre`، و`@excalidraw/excalidraw` تعلن MIT. Dagre MIT هو محرك التخطيط المختار.
- تنبيه: Mermaid تجلب `elkjs@0.9.3` انتقالياً (EPL-2.0 OR GPL-3.0-or-later)، ويظهر chunk اختياري في البناء؛ لا تضف ELK مباشرة ولا تغيّر layout من Dagre دون مراجعة الرخص. التفاصيل في `docs/DIAGRAMS_CODE.md`.
- لا تضف `tldraw` إلى القالب: رخصته الخاصة لا تطابق شرط التوزيع المفتوح هنا.
- Mermaid وShiki وReact Flow وExcalidraw تُحمّل من قطع منفصلة/عند الحاجة؛ لا تستورد runtime ثقيل في `App.tsx` أو شاشات البداية.
- عند تعديل القواعد أو المكوّنات، شغّل `npm run check` واختبر `/?lab=diagrams`، مع RTL وتقليل الحركة.
