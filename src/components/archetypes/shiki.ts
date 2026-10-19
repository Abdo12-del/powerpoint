import type { BundledLanguage, ThemedToken } from 'shiki/bundle/web';

export type CodeToken = Pick<ThemedToken, 'content' | 'color' | 'bgColor' | 'fontStyle'>;
export type CodeTokenLines = CodeToken[][];

export type DiffLineKind = 'added' | 'removed' | 'context' | 'meta' | 'plain';

export interface ParsedDiffLine {
  kind: DiffLineKind;
  marker: string;
  body: string;
}

const LANGUAGE_ALIASES: Record<string, BundledLanguage | 'text'> = {
  bash: 'bash',
  c: 'c',
  'c#': 'text',
  'c++': 'cpp',
  js: 'javascript',
  jsx: 'jsx',
  md: 'markdown',
  mermaid: 'text',
  plain: 'text',
  plaintext: 'text',
  postgresql: 'sql',
  postgres: 'sql',
  plpgsql: 'sql',
  sh: 'bash',
  shell: 'shellscript',
  sql: 'sql',
  ts: 'typescript',
  tsx: 'tsx',
  typescript: 'typescript',
  text: 'text',
  yml: 'yaml',
};

export function normalizeCodeLanguage(language: string): BundledLanguage | 'text' {
  const normalized = language.trim().toLowerCase().replace(/^language-/, '').replaceAll(' ', '-');
  return LANGUAGE_ALIASES[normalized] ?? (normalized as BundledLanguage);
}

export function parseDiffLine(line: string): ParsedDiffLine {
  if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('@@')) {
    return { kind: 'meta', marker: '', body: line };
  }
  if (line.startsWith('+')) return { kind: 'added', marker: '+', body: line.slice(1) };
  if (line.startsWith('-')) return { kind: 'removed', marker: '-', body: line.slice(1) };
  if (line.startsWith(' ')) return { kind: 'context', marker: ' ', body: line.slice(1) };
  return { kind: 'plain', marker: '', body: line };
}

/**
 * Tokenize with Shiki's browser bundle; its common-language registry and each
 * grammar/WASM are lazy, so normal slides do not pay the syntax-highlighter cost.
 */
export async function tokenizeCode(code: string, language: string, diff = false): Promise<CodeTokenLines> {
  const lines = code.split('\n');
  const parsed = diff ? lines.map(parseDiffLine) : undefined;
  const normalizedLanguage = normalizeCodeLanguage(language);
  const isDiffLanguage = language.trim().toLowerCase() === 'diff';
  if (diff && (!language.trim() || normalizedLanguage === 'text' || isDiffLanguage)) {
    return parsed!.map((line) => [
      {
        content: line.kind === 'meta' ? line.body : `${line.marker}${line.body}`,
        color: line.kind === 'meta' ? '#93c5fd' : '#e2e8f0',
      },
    ]);
  }

  const { codeToTokens } = await import('shiki/bundle/web');
  const supportsEmbeddedDiff = !!diff;
  const syntaxLanguage = normalizedLanguage;
  const source = supportsEmbeddedDiff ? parsed!.map((line) => (line.kind === 'meta' ? '' : line.body)).join('\n') : code;
  const result = await codeToTokens(source, {
    lang: syntaxLanguage,
    theme: 'github-dark',
    tokenizeMaxLineLength: 3000,
    tokenizeTimeLimit: 250,
  });

  if (!supportsEmbeddedDiff) return result.tokens;

  return lines.map((line, index) => {
    const row = parsed![index];
    if (row.kind === 'meta') return [{ content: line, color: '#93c5fd' }];
    return result.tokens[index] ?? [{ content: row.body, color: '#e2e8f0' }];
  });
}
