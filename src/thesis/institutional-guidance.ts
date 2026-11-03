import type { ThesisRoutingInput } from './router';

export type GuidanceStatus = 'national-regulation' | 'official-institution-undated' | 'legacy-needs-confirmation';

export interface InstitutionalGuidance {
  id: string;
  scope: {
    country: 'Algeria';
    institutionAliases?: string[];
    facultyAliases?: string[];
    degreeAliases: string[];
  };
  title: string;
  status: GuidanceStatus;
  /** Older/undated guidance is surfaced to the AI, never silently treated as the current local rule. */
  autoApply: boolean;
  source: { url: string; publisher: string; published: string; checked: string };
  evidence: string[];
  limits: string[];
}

/** Officially published requirements or recommendations located so far; not a complete national catalog. */
export const INSTITUTIONAL_GUIDANCE: readonly InstitutionalGuidance[] = [
  {
    id: 'dz-master-regulation-362-2014',
    scope: { country: 'Algeria', degreeAliases: ['master', 'master 2', 'ماستر', 'ماستر 2'] },
    title: 'Arrêté n°362 — modalités d’élaboration et de soutenance du mémoire de master',
    status: 'national-regulation',
    autoApply: true,
    source: {
      url: 'https://univ-biskra.dz/formation/textes/memoire_du_master_362.pdf',
      publisher: 'Ministère de l’Enseignement supérieur et de la Recherche scientifique (copie du texte officiel hébergée par une université)',
      published: '2014-06-09',
      checked: '2026-10-25',
    },
    evidence: [
      'Article 7: le mémoire de master fait l’objet d’une soutenance publique.',
      'Article 6: la forme, la consistance et les délais du mémoire sont fixés par l’équipe de formation.',
      'Article 10: la grille d’évaluation couvre le manuscrit, l’exposé oral et les réponses aux questions.',
    ],
    limits: [
      'Ce texte ne prescrit pas un nombre universel de diapositives, une durée d’exposé ou un plan PowerPoint par discipline.',
      'Il concerne le mémoire de master; ne pas l’étendre automatiquement aux licences, doctorats ou diplômes de formation professionnelle.',
      'Chercher la directive actuelle de la faculté ou du département avant de fixer le temps ou le format.',
    ],
  },
  {
    id: 'setif-master-defense-procedure',
    scope: {
      country: 'Algeria',
      institutionAliases: ['Université Ferhat Abbas Sétif 1', 'Université de Sétif 1', 'جامعة فرحات عباس سطيف 1', 'جامعة سطيف 1'],
      degreeAliases: ['master', 'master 2', 'ماستر', 'ماستر 2'],
    },
    title: 'Procédure de soutenance de mémoire de master — Université de Sétif',
    status: 'official-institution-undated',
    autoApply: false,
    source: {
      url: 'https://www.univ-setif.dz/externe/Soutenance-Master.pdf',
      publisher: 'Université de Sétif (document institutionnel hébergé sur le domaine universitaire)',
      published: 'date non visible dans le PDF consulté',
      checked: '2026-10-25',
    },
    evidence: [
      'Le document indique un exposé de l’étudiant de 20 minutes.',
      'Il évalue la capacité à rendre compte de la démarche, la qualité du support (diaporamas, illustrations, graphiques), le respect du temps, la clarté et la synthèse.',
      'Le guide liste introduction, contenu de l’étude, conclusion, références et annexes comme éléments du mémoire.',
    ],
    limits: [
      'Aucun nombre de diapositives n’est indiqué dans le document consulté.',
      'La date n’étant pas visible, faire confirmer que cette durée est toujours applicable par le département.',
      'Le document porte sur le master; ne pas l’étendre aux autres diplômes ou à un autre établissement.',
    ],
  },
  {
    id: 'constantine1-snv-master-guide-2010',
    scope: {
      country: 'Algeria',
      institutionAliases: ['Université Constantine 1', 'Université Mentouri Constantine', 'جامعة قسنطينة 1', 'جامعة منتوري قسنطينة'],
      facultyAliases: ['Faculté des Sciences de la Nature et de la Vie', 'علوم الطبيعة والحياة', 'كلية علوم الطبيعة والحياة'],
      degreeAliases: ['master', 'master 2', 'mastère', 'ماستر', 'ماستر 2'],
    },
    title: 'Guide de rédaction, de présentation et de soutenance — Faculté SNV',
    status: 'legacy-needs-confirmation',
    autoApply: false,
    source: {
      url: 'https://fac.umc.edu.dz/snv/faculte/formation/domaine/7.pdf',
      publisher: 'Université Mentouri Constantine — Faculté des Sciences de la Nature et de la Vie',
      published: '2010-01 (indiqué dans le document)',
      checked: '2026-10-25',
    },
    evidence: [
      'Le guide recommande environ 20 diapositives et indique une durée orale d’environ 10 minutes.',
      'Le document prévoit un fil scientifique: problématique/objectifs, méthode, résultats, discussion, conclusion.',
    ],
    limits: [
      'Le guide date de janvier 2010: c’est une source historique, pas une règle actuelle présumée.',
      'Le temps et le nombre de diapositives doivent être confirmés auprès du département avant de les appliquer.',
      'Portée limitée à la Faculté SNV de l’établissement nommé dans le guide; ne pas généraliser à toutes les facultés ni aux autres universités.',
    ],
  },
] as const;

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

function exactAliasMatch(value: string | undefined, aliases: readonly string[] | undefined): boolean {
  if (!value || !aliases?.length) return false;
  const normalized = normalize(value);
  return aliases.some((alias) => normalize(alias) === normalized);
}

export interface GuidanceLookup {
  applicable: InstitutionalGuidance[];
  needsFacultyConfirmation: InstitutionalGuidance[];
}

/** Return only the national rule and genuinely scoped institution rules; never fuzzy-match a campus. */
export function getInstitutionalGuidance(input: Pick<ThesisRoutingInput, 'institution' | 'faculty' | 'degree'>): GuidanceLookup {
  const degree = normalize(input.degree ?? '');
  const degreeMatches = (aliases: readonly string[]) => aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return degree === normalizedAlias || ` ${degree} `.includes(` ${normalizedAlias} `);
  });
  const applicable: InstitutionalGuidance[] = [];
  const needsFacultyConfirmation: InstitutionalGuidance[] = [];

  for (const rule of INSTITUTIONAL_GUIDANCE) {
    if (!degreeMatches(rule.scope.degreeAliases)) continue;
    const aliases = rule.scope.institutionAliases;
    if (!aliases) {
      applicable.push(rule);
      continue;
    }
    if (!exactAliasMatch(input.institution, aliases)) continue;
    const facultyAliases = rule.scope.facultyAliases;
    if (!facultyAliases) {
      applicable.push(rule);
      continue;
    }
    if (exactAliasMatch(input.faculty, facultyAliases)) applicable.push(rule);
    else if (!input.faculty) needsFacultyConfirmation.push(rule);
  }

  return { applicable, needsFacultyConfirmation };
}
