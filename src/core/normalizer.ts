/**
 * Normalize code for comparison
 */
export function normalizeCode(code: string): string {
  if (!code) return '';

  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"[^"]*"/g, '"STR"')
    .replace(/'[^']*'/g, "'STR'")
    .replace(/`[^`]*`/g, '`STR`')
    .replace(/\b\d+\b/g, 'NUM')
    .replace(/\s+/g, ' ')
    .trim();
}

const stopwords = new Set([
  'return',
  'const',
  'let',
  'var',
  'function',
  'class',
  'new',
  'if',
  'else',
  'for',
  'while',
  'async',
  'await',
  'try',
  'catch',
  'switch',
  'case',
  'default',
  'import',
  'export',
  'from',
  'true',
  'false',
  'null',
  'undefined',
  'this',
]);

/**
 * Tokenize normalized code
 */
export function tokenize(norm: string): string[] {
  const punctuation = '(){}[];.,';
  const cleaned = norm
    .split('')
    .map((ch) => (punctuation.includes(ch) ? ' ' : ch))
    .join('');

  return cleaned
    .split(/\s+/)
    .filter((t) => t && t.length >= 3 && !stopwords.has(t.toLowerCase()));
}
