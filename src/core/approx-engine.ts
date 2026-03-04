import type { CodeBlock } from './types';

/**
 * Fast candidate selection using inverted index
 */
export class ApproxEngine {
  private invertedIndex: Map<string, number[]> = new Map();
  private blockTokens: string[][];
  private allBlocks: CodeBlock[];

  constructor(allBlocks: CodeBlock[], blockTokens: string[][]) {
    this.allBlocks = allBlocks;
    this.blockTokens = blockTokens;
    this.buildIndex();
  }

  private buildIndex() {
    for (let i = 0; i < this.blockTokens.length; i++) {
      for (const tok of this.blockTokens[i]) {
        let arr = this.invertedIndex.get(tok);
        if (!arr) {
          arr = [];
          this.invertedIndex.set(tok, arr);
        }
        arr.push(i);
      }
    }
  }

  findCandidates(
    blockIdx: number,
    minSharedTokens: number,
    maxCandidates: number
  ): Array<{ j: number; shared: number }> {
    const block1 = this.allBlocks[blockIdx];
    const block1Tokens = this.blockTokens[blockIdx];
    const counts: Map<number, number> = new Map();

    const rareTokens = block1Tokens.filter((tok) => {
      const freq = this.invertedIndex.get(tok)?.length || 0;
      return freq < this.allBlocks.length * 0.1;
    });

    for (const tok of rareTokens) {
      const ids = this.invertedIndex.get(tok);
      if (!ids) continue;
      for (const j of ids) {
        if (j <= blockIdx) continue;
        if (this.allBlocks[j].file === block1.file) continue;
        counts.set(j, (counts.get(j) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .filter(([j, shared]) => {
        const block2Size = this.blockTokens[j].length;
        const minSize = Math.min(block1Tokens.length, block2Size);
        return shared >= minSharedTokens && shared / minSize >= 0.3;
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCandidates)
      .map(([j, shared]) => ({ j, shared }));
  }
}
