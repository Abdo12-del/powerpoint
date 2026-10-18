import type { PresentationData } from '@/types/presentation';

/**
 * قائمة تحقق الهيكل (§10 — Definition of Done) + قواعد الحماية (§9).
 * - error: يكسر التنقل/الخريطة (معرفات مكررة، chapterId خاطئ…)
 * - warn : يخالف قواعد الجودة (عدد الفصول، طول العنوان، …) دون كسر التنفيذ
 */
export interface ValidationIssue {
  level: 'error' | 'warn';
  rule: string;
  message: string;
  where?: string;
}

export interface ValidationReport {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  issues: ValidationIssue[];
}

const WORD_LIMIT_TITLE = 6;
const MIN_CHAPTERS = 3;
const MAX_CHAPTERS = 5;
const MIN_SLIDES = 4;
const MAX_SLIDES = 8;
const MIN_PREFACE = 3;
const MAX_PREFACE = 4;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validatePresentation(data: PresentationData): ValidationReport {
  const issues: ValidationIssue[] = [];
  const error = (rule: string, message: string, where?: string) =>
    issues.push({ level: 'error', rule, message, where });
  const warn = (rule: string, message: string, where?: string) =>
    issues.push({ level: 'warn', rule, message, where });

  // ── شاشة العنوان (§2.1) ────────────────────────────────────────────────
  const { meta } = data;
  if (!meta.title.trim()) error('title.required', 'العنوان الرئيسي مطلوب', 'meta.title');
  if (meta.organization.length === 0)
    warn('title.organization', 'الجهة الرسمية فارغة في شاشة العنوان', 'meta.organization');
  if (!meta.workType.trim()) warn('title.workType', 'نوع العمل فارغ في شاشة العنوان', 'meta.workType');
  if (meta.authors.length === 0) warn('title.authors', 'لا يوجد مُنجزون في شاشة العنوان', 'meta.authors');
  if (!meta.date.trim()) warn('title.date', 'التاريخ/الدفعة فارغ في شاشة العنوان', 'meta.date');

  // ── المقدمة (§2.2) ─────────────────────────────────────────────────────
  if (data.preface.length < MIN_PREFACE || data.preface.length > MAX_PREFACE) {
    warn(
      'preface.steps',
      `المقدمة يجب أن تكون ${MIN_PREFACE}–${MAX_PREFACE} خطوات (الحالي: ${data.preface.length})`,
      'preface',
    );
  }
  const kinds = data.preface.map((s) => s.kind);
  if (!kinds.includes('problem')) warn('preface.problem', 'المقدمة بلا خطوة «الإشكالية»', 'preface');
  if (!kinds.includes('objectives')) warn('preface.objectives', 'المقدمة بلا خطوة «الأهداف»', 'preface');
  const prefaceIds = new Set<string>();
  for (const step of data.preface) {
    if (prefaceIds.has(step.id)) error('preface.uniqueId', `معرف خطوة مكرر: ${step.id}`, `preface.${step.id}`);
    prefaceIds.add(step.id);
  }

  // ── الفصول (§3) ────────────────────────────────────────────────────────
  if (data.chapters.length < MIN_CHAPTERS || data.chapters.length > MAX_CHAPTERS) {
    warn(
      'chapters.count',
      `عدد الفصول يجب أن يكون ${MIN_CHAPTERS}–${MAX_CHAPTERS} (الحالي: ${data.chapters.length})`,
      'chapters',
    );
  }

  const chapterIds = new Set<string>();
  const slideIds = new Set<string>();

  for (const chapter of data.chapters) {
    const where = `chapters.${chapter.id}`;
    if (chapterIds.has(chapter.id)) error('chapter.uniqueId', `معرف فصل مكرر: ${chapter.id}`, where);
    chapterIds.add(chapter.id);

    const n = chapter.slides.length;
    if (n < MIN_SLIDES || n > MAX_SLIDES) {
      warn('chapter.slideCount', `الفصل «${chapter.title}» فيه ${n} شرائح؛ المطلوب ${MIN_SLIDES}–${MAX_SLIDES}`, where);
    }
    if (n > 0) {
      const first = chapter.slides[0];
      const last = chapter.slides[n - 1];
      if (first.archetype !== 'chapter-preface')
        warn('chapter.preface', `الفصل «${chapter.title}» لا يفتتح بـ«تمهيد الفصل»`, where);
      if (last.archetype !== 'chapter-summary')
        warn('chapter.summary', `الفصل «${chapter.title}» لا يُختتم بـ«خلاصة الفصل»`, where);
    } else {
      error('chapter.empty', `الفصل «${chapter.title}» بلا شرائح`, where);
    }

    // ── الشرائح (§4) ──────────────────────────────────────────────────
    for (const slide of chapter.slides) {
      const sw = `${where}.${slide.id}`;
      if (slideIds.has(slide.id)) error('slide.uniqueId', `معرف شريحة مكرر: ${slide.id}`, sw);
      slideIds.add(slide.id);

      if (slide.chapterId !== chapter.id)
        error('slide.chapterId', `الشريحة ${slide.id} تحمل chapterId=${slide.chapterId} بدل ${chapter.id}`, sw);

      if (!slide.id.startsWith(`${chapter.id}-`))
        error('slide.idPrefix', `معرف الشريحة ${slide.id} لا يبدأ ببادئة الفصل "${chapter.id}-"`, sw);

      if (!slide.title.trim()) error('slide.title', `الشريحة ${slide.id} بلا عنوان`, sw);
      else if (countWords(slide.title) > WORD_LIMIT_TITLE)
        warn('slide.titleLength', `عنوان «${slide.title}» يتجاوز ${WORD_LIMIT_TITLE} كلمات — ربما تجمع شريحتين`, sw);

      if (slide.content === null || slide.content === undefined)
        error('slide.content', `الشريحة ${slide.id} بلا محتوى`, sw);
    }
  }

  // ── الخاتمة (§2.5) ─────────────────────────────────────────────────────
  if (data.final.summary.length < 3 || data.final.summary.length > 4)
    warn('final.summary', `خلاصة الخاتمة يجب أن تكون 3–4 جمل (الحالي: ${data.final.summary.length})`, 'final');

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warn');
  return { ok: errors.length === 0, errors, warnings, issues };
}

/** يطبع التقرير في وحدة التحكم أثناء التطوير. */
export function reportToConsole(report: ValidationReport): void {
  if (report.issues.length === 0) {
    console.info('[presentation] ✅ الهيكل مطابق لقائمة التحقق');
    return;
  }
  for (const issue of report.issues) {
    const line = `[presentation] ${issue.rule} — ${issue.message}${issue.where ? ` (${issue.where})` : ''}`;
    if (issue.level === 'error') console.error(line);
    else console.warn(line);
  }
}
