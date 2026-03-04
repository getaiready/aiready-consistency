/**
 * Fast Jaccard similarity on token sets
 */
export function jaccardSimilarity(
  tokens1: string[],
  tokens2: string[]
): number {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  if (set1.size === 0 && set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
