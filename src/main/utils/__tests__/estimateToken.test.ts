import { FileNode } from '@/src/types/FileNode';
import TokenEstimator from '../TokenEstimator';

describe('estimateToken', () => {
  const fileNodeQueue: FileNode[] = [];

  beforeAll(() => {
    fileNodeQueue.push(
      {
        name: 'file1.txt',
        path: 'file1.txt',
        type: 'file',
      },
      {
        name: 'file2.txt',
        path: 'file1.txt',
        type: 'file',
      },
    );
  });

  test('should return the correct token', () => {
    const token = TokenEstimator.estimateTokens('Hello world 1234');
    expect(token).toBe(4);
  });
});
