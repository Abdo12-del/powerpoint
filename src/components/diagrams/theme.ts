import type { MermaidConfig } from 'mermaid';

/** Palette shared with the presentation shell (slate + amber + sky). */
export const PRESENTATION_MERMAID_THEME_VARIABLES = {
  darkMode: true,
  background: '#020617',
  mainBkg: '#0f172a',
  primaryColor: '#0f172a',
  primaryTextColor: '#f8fafc',
  primaryBorderColor: '#38bdf8',
  secondaryColor: '#172554',
  secondaryTextColor: '#e2e8f0',
  secondaryBorderColor: '#818cf8',
  tertiaryColor: '#111827',
  tertiaryTextColor: '#e2e8f0',
  tertiaryBorderColor: '#64748b',
  textColor: '#e2e8f0',
  lineColor: '#fbbf24',
  nodeBorder: '#38bdf8',
  edgeLabelBackground: '#020617',
  clusterBkg: '#0f172a',
  clusterBorder: '#334155',
  actorBkg: '#0f172a',
  actorBorder: '#38bdf8',
  actorTextColor: '#f8fafc',
  actorLineColor: '#64748b',
  signalColor: '#fbbf24',
  signalTextColor: '#e2e8f0',
  labelBoxBkgColor: '#0f172a',
  labelBoxBorderColor: '#38bdf8',
  labelTextColor: '#f8fafc',
  loopTextColor: '#fef3c7',
  noteBkgColor: '#172554',
  noteTextColor: '#e0f2fe',
  noteBorderColor: '#38bdf8',
  sequenceNumberColor: '#020617',
  sectionBkgColor: '#1e293b',
  altSectionBkgColor: '#0f172a',
  gridColor: '#334155',
  cScale0: '#38bdf8',
  cScale1: '#fbbf24',
  cScale2: '#34d399',
  cScale3: '#f472b6',
} satisfies NonNullable<MermaidConfig['themeVariables']>;

/** Mermaid SVG labels use plaintext bidi so Arabic and inline Latin/SQL stay readable. */
export const PRESENTATION_MERMAID_RTL_CSS = `
  .nodeLabel, .edgeLabel, .messageText, .noteText, .loopText, .labelText,
  .actor text, .entityLabel, .er.entityLabel, .classTitle {
    direction: rtl;
    unicode-bidi: plaintext;
    font-family: 'Cairo Variable', Cairo, Inter, sans-serif;
  }
  .nodeLabel p, .edgeLabel p, .label p { margin: 0; }
  .edgeLabel, .labelBkg { background-color: #020617; }
`;

/** Use a single secure, template-matched config for every lazy Mermaid renderer. */
export function makePresentationMermaidConfig(): MermaidConfig {
  return {
    startOnLoad: false,
    securityLevel: 'strict',
    secure: ['securityLevel', 'startOnLoad', 'theme', 'themeVariables', 'themeCSS', 'layout', 'flowchart', 'sequence', 'fontFamily', 'maxTextSize', 'maxEdges'],
    deterministicIds: true,
    theme: 'base',
    themeVariables: PRESENTATION_MERMAID_THEME_VARIABLES,
    themeCSS: PRESENTATION_MERMAID_RTL_CSS,
    layout: 'dagre',
    fontFamily: "'Cairo Variable', Cairo, Inter, sans-serif",
    fontSize: 16,
    htmlLabels: true,
    maxTextSize: 12000,
    maxEdges: 120,
    flowchart: {
      curve: 'basis',
      nodeSpacing: 44,
      rankSpacing: 64,
      inheritDir: true,
    },
    sequence: {
      actorMargin: 56,
      messageAlign: 'center',
      actorFontFamily: "'Cairo Variable', Cairo, Inter, sans-serif",
      messageFontFamily: "'Cairo Variable', Cairo, Inter, sans-serif",
      noteFontFamily: "'Cairo Variable', Cairo, Inter, sans-serif",
    },
  };
}
