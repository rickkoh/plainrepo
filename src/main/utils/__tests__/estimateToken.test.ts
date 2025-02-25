import { FileNode } from '@/src/types/FileNode';
import TokenEstimator, { createTokenAggregator } from '../TokenEstimator';

describe('estimateToken', () => {
  const fileNodeQueue: FileNode[] = [];

  beforeAll(() => {
    fileNodeQueue.push(
      {
        name: 'file1.txt',
        path: 'file1.txt',
        type: 'file',
        content: 'Hello world 1',
      },
      {
        name: 'file2.txt',
        path: 'file1.txt',
        type: 'file',
        content: 'Hello world 2',
      },
    );
  });

  test('should return the correct token', () => {
    const token = TokenEstimator.estimateTokens('Hello world 1234');
    expect(token).toBe(4);
  });

  test('stream token should return back tokens in chunks', () => {
    const callback = jest.fn();
    TokenEstimator.streamEstimateTokens(fileNodeQueue, callback, { size: 1 });
    expect(callback).toHaveBeenCalledTimes(2);

    const aggregator = createTokenAggregator();

    TokenEstimator.streamEstimateTokens(fileNodeQueue, aggregator.process, {
      size: 1,
    });

    expect(aggregator.getTotal()).toBe(8);
  });
});
