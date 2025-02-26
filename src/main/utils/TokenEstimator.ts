import { chunk } from '@/lib/utils';
import { FileNode } from '@/src/types/FileNode';

export default class TokenEstimator {
  static estimateTokens(
    text: string,
    method: 'average' | 'words' | 'chars' | 'max' | 'min' = 'max',
  ): number {
    // Calculate word and character counts
    const wordCount = text.split(' ').length;
    const charCount = text.length;

    // Estimate token counts based on words and characters
    const tokensCountWordEst = wordCount / 0.75;
    const tokensCountCharEst = charCount / 4.0;

    let output = 0;

    // Determine output based on the method
    switch (method) {
      case 'average':
        output = (tokensCountWordEst + tokensCountCharEst) / 2;
        break;
      case 'words':
        output = tokensCountWordEst;
        break;
      case 'chars':
        output = tokensCountCharEst;
        break;
      case 'max':
        output = Math.max(tokensCountWordEst, tokensCountCharEst);
        break;
      case 'min':
        output = Math.min(tokensCountWordEst, tokensCountCharEst);
        break;
      default:
        output = 0;
        break;
    }

    return Math.floor(output);
  }

  static streamEstimateTokens(
    fileNodeQueue: FileNode[],
    callback: (tokens: number) => void,
    chunkOption?: {
      size: number;
    },
  ): void {
    chunk(fileNodeQueue, chunkOption?.size ?? 20).forEach((c) => {
      c.forEach((fileNode) => {
        if (fileNode.type === 'file' && fileNode.content) {
          const tokens = TokenEstimator.estimateTokens(fileNode.content);
          callback(tokens);
        }
      });
    });
  }
}

export interface TokenAggregator {
  process: (tokens: number) => void;
  getTotal: () => number;
}

export const createTokenAggregator = (): TokenAggregator => {
  let count = 0;
  return {
    process: (tokens: number) => {
      count += tokens;
    },
    getTotal: () => count,
  };
};
