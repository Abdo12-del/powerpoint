import { ALGERIAN_LMD_DOMAINS } from './algerian-domains';
import { THESIS_METHODOLOGIES, type ThesisMethodology, type ThesisMethodologyId } from './methodologies';

export interface ThesisRoutingInput {
  /** Preserve the exact name extracted from the title page; it does not itself choose a discipline. */
  institution?: string;
  /** Explicitly classify provider type when given in the cover/profile; this allows a CFPA project to use the vocational route. */
  institutionType?: 'university' | 'higher-school' | 'vocational-training-institute' | 'teacher-training-school' | 'health-training-institute';
  faculty?: string;
  /** Official LMD domain when it appears on the cover/curriculum; broad domains can route to multiple candidates. */
  domain?: string;
  specialty?: string;
  degree?: string;
  title?: string;
  abstract?: string;
  keywords?: string[];
  /** Examples: experiment, survey, software, design-project, case-study, literature-review. */
  studyMode?: string;
}

export type RoutingConfidence = 'high' | 'medium' | 'low';

export interface ThesisRoutingResult {
  methodology: ThesisMethodology;
  confidence: RoutingConfidence;
  needsHumanConfirmation: boolean;
  candidates: Array<{ id: ThesisMethodologyId; score: number }>;
  rationaleAr: string;
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('ar')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ـ\u064b-\u065f\u0670]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function containsPhrase(text: string, phrase: string): boolean {
  const normalizedPhrase = normalize(phrase);
  return normalizedPhrase.length > 0 && ` ${text} `.includes(` ${normalizedPhrase} `);
}

/**
 * Suggests a disciplinary blueprint from explicit specialty evidence.
 * The institution is never scored: local rules are an independent override, and a university name
 * alone must never make the router guess a discipline. An exact declared LMD domain is weaker than
 * a declared specialty; broad domains can intentionally return multiple candidate families.
 */
export function routeThesisMethodology(input: ThesisRoutingInput): ThesisRoutingResult {
  const specialty = normalize(input.specialty ?? '');
  const faculty = normalize(input.faculty ?? '');
  const domain = normalize(input.domain ?? '');
  const keywords = normalize((input.keywords ?? []).join(' '));
  const title = normalize(input.title ?? '');
  const abstract = normalize(input.abstract ?? '');

  const declaredDomain = ALGERIAN_LMD_DOMAINS.find((item) => item.aliases.some((alias) => normalize(alias) === domain));
  const domainOrder = new Map((declaredDomain?.methodologyCandidates ?? []).map((id, index) => [id, index]));
  const domainCandidates = new Set(domainOrder.keys());
  const scored = THESIS_METHODOLOGIES.filter((item) => item.id !== 'general-research')
    .map((methodology) => {
      let score = domainCandidates.has(methodology.id) ? 5 : 0;
      if (input.institutionType === 'vocational-training-institute' && methodology.id === 'vocational-project') score = 10;
      if (input.institutionType === 'teacher-training-school' && methodology.id === 'education') score = 8;
      if (input.institutionType === 'health-training-institute' && methodology.id === 'health-clinical') score = 8;
      for (const alias of methodology.specialtyAliases) {
        if (containsPhrase(specialty, alias)) score = Math.max(score, 8);
        else if (containsPhrase(faculty, alias)) score = Math.max(score, 6);
        else if (containsPhrase(keywords, alias)) score = Math.max(score, 3);
        else if (containsPhrase(title, alias)) score = Math.max(score, 2);
        else if (containsPhrase(abstract, alias)) score = Math.max(score, 1);
      }
      return { id: methodology.id, score, methodology };
    })
    .sort((a, b) => b.score - a.score || (domainOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (domainOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER));

  const best = scored[0];
  const runnerUp = scored[1];
  const hasMatch = Boolean(best && best.score > 0);
  const margin = hasMatch ? best.score - (runnerUp?.score ?? 0) : 0;
  const ambiguous = hasMatch && margin < 2;
  const confidence: RoutingConfidence = !hasMatch || ambiguous || best.score < 3
    ? 'low'
    : best.score >= 7 && margin >= 2
      ? 'high'
      : 'medium';
  const fallback = THESIS_METHODOLOGIES.find((item) => item.id === 'general-research')!;
  const methodology = hasMatch && !ambiguous ? best.methodology : fallback;
  const candidates = scored.filter((item) => item.score > 0).slice(0, 3).map(({ id, score }) => ({ id, score }));

  let rationaleAr: string;
  if (!hasMatch) {
    rationaleAr = 'لم يظهر تخصص أو دليل لغوي كافٍ؛ استُخدمت الخطة العامة مؤقتاً، ولا ينبغي بناء مخطط نهائي قبل معرفة التخصص ونوع الدراسة.';
  } else if (ambiguous) {
    rationaleAr = 'توجد إشارات متقاربة لأكثر من عائلة تخصصية؛ الخطة العامة مؤقتة، ويلزم تأكيد التخصص أو طبيعة العمل قبل الاختيار.';
  } else {
    rationaleAr = confidence === 'high'
      ? input.institutionType === 'vocational-training-institute'
        ? 'نوع المؤسسة المصرّح به يشير إلى مسار مشروع/تربص مهني؛ افحص مع ذلك دليل المعهد ونوع المهمة قبل اعتماد الشرائح.'
        : 'التخصص المصرّح به يطابق عائلة منهجية بوضوح؛ افحص مع ذلك طريقة الدراسة ودليل المؤسسة قبل اعتماد الشرائح.'
      : declaredDomain
        ? 'الترشيح يستند إلى المجال الوطني المصرّح به، لا إلى تخصص دقيق؛ راجع الفرع ونوع الدراسة قبل ضبط الشرائح والمدة.'
        : 'الترشيح مبني على إشارات محدودة من بيانات المذكرة؛ أكّد العائلة المنهجية ونوع الدراسة مع المستخدم.';
  }

  return {
    methodology,
    confidence,
    needsHumanConfirmation: confidence === 'low',
    candidates,
    rationaleAr,
  };
}
