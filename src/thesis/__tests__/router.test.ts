import { describe, expect, it } from 'vitest';
import { ALGERIAN_LMD_DOMAINS } from '../algerian-domains';
import { getInstitutionalGuidance } from '../institutional-guidance';
import { routeThesisMethodology } from '../router';

describe('official Algerian LMD-domain coverage', () => {
  it('maps all fifteen MESRS LMD domains to at least one methodology candidate', () => {
    expect(ALGERIAN_LMD_DOMAINS).toHaveLength(15);
    expect(new Set(ALGERIAN_LMD_DOMAINS.map((item) => item.code)).size).toBe(15);
    expect(ALGERIAN_LMD_DOMAINS.every((item) => item.methodologyCandidates.length > 0)).toBe(true);
  });

  it('routes a specific domain and requests a subfield when an official domain is internally broad', () => {
    const sports = routeThesisMethodology({ domain: 'Sciences et Techniques des Activités Physiques et Sportives' });
    expect(sports.methodology.id).toBe('sports-sciences');
    expect(sports.confidence).toBe('medium');

    const mathematicsAndComputing = routeThesisMethodology({ domain: 'Mathématiques et Informatique' });
    expect(mathematicsAndComputing.methodology.id).toBe('general-research');
    expect(mathematicsAndComputing.candidates.map((candidate) => candidate.id)).toEqual(['mathematics-statistics', 'digital-systems']);
    expect(mathematicsAndComputing.needsHumanConfirmation).toBe(true);
  });

  it('lets an explicit specialty refine a broader domain', () => {
    const result = routeThesisMethodology({ domain: 'Mathématiques et Informatique', specialty: 'Mathématiques appliquées' });
    expect(result.methodology.id).toBe('mathematics-statistics');
    expect(result.confidence).toBe('high');
  });

  it('uses a declared vocational provider type for applied training projects', () => {
    const result = routeThesisMethodology({
      institutionType: 'vocational-training-institute',
      specialty: 'Informatique',
      studyMode: 'internship-report',
    });
    expect(result.methodology.id).toBe('vocational-project');
    expect(result.confidence).toBe('high');
  });
});

describe('routeThesisMethodology', () => {
  it('routes an explicitly named Arabic specialty to the specific discipline blueprint', () => {
    const result = routeThesisMethodology({ specialty: 'هندسة البرمجيات', title: 'منصة ذكية لإدارة العيادات' });
    expect(result.methodology.id).toBe('digital-systems');
    expect(result.confidence).toBe('high');
    expect(result.needsHumanConfirmation).toBe(false);
  });

  it('routes French aliases and ignores the institution as a discipline signal', () => {
    const result = routeThesisMethodology({ institution: 'Université de Sétif 1', specialty: 'Biologie', studyMode: 'experiment' });
    expect(result.methodology.id).toBe('experimental-sciences');
    expect(result.confidence).toBe('high');
  });

  it('uses the general plan and requests clarification when discipline evidence is missing', () => {
    const result = routeThesisMethodology({ institution: 'Université Ferhat Abbas Sétif 1', title: 'Étude de cas' });
    expect(result.methodology.id).toBe('general-research');
    expect(result.confidence).toBe('low');
    expect(result.needsHumanConfirmation).toBe(true);
  });

  it('does not silently choose between conflicting discipline signals', () => {
    const result = routeThesisMethodology({ keywords: ['علوم الحاسوب', 'قانون'] });
    expect(result.methodology.id).toBe('general-research');
    expect(result.candidates.length).toBeGreaterThan(1);
    expect(result.needsHumanConfirmation).toBe(true);
  });
});

describe('getInstitutionalGuidance', () => {
  it('returns the national master regulation and Sétif-specific guidance only for an exact scope', () => {
    const result = getInstitutionalGuidance({ institution: 'Université de Sétif 1', degree: 'Master académique' });
    expect(result.applicable.map((item) => item.id)).toEqual([
      'dz-master-regulation-362-2014',
      'setif-master-defense-procedure',
    ]);
    expect(result.applicable[1].evidence.join(' ')).toContain('20 minutes');
    expect(result.applicable[1].autoApply).toBe(false);
  });

  it('does not apply the legacy Constantine SNV document without the faculty, and never marks it current', () => {
    const withoutFaculty = getInstitutionalGuidance({ institution: 'Université Constantine 1', degree: 'Master' });
    expect(withoutFaculty.needsFacultyConfirmation.map((item) => item.id)).toContain('constantine1-snv-master-guide-2010');
    expect(withoutFaculty.applicable.map((item) => item.id)).toEqual(['dz-master-regulation-362-2014']);

    const withFaculty = getInstitutionalGuidance({
      institution: 'Université Mentouri Constantine',
      faculty: 'Faculté des Sciences de la Nature et de la Vie',
      degree: 'Master',
    });
    const legacy = withFaculty.applicable.find((item) => item.id === 'constantine1-snv-master-guide-2010');
    expect(legacy?.autoApply).toBe(false);
    expect(legacy?.status).toBe('legacy-needs-confirmation');
  });

  it('does not transfer institution rules to a different university', () => {
    const result = getInstitutionalGuidance({ institution: 'Université de Béjaïa', degree: 'Master' });
    expect(result.applicable.map((item) => item.id)).toEqual(['dz-master-regulation-362-2014']);
  });
});
