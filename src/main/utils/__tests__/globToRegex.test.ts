import os from 'os';
import path from 'path';
import { globToRegex } from '../AppSettings';

jest.mock('electron', () => ({
  app: {
    getPath: () => os.tmpdir(),
  },
}));

describe('globToRegex', () => {
  const root = path.join(os.tmpdir(), 'repo');

  test('should ignore paths whose name matches exactly', () => {
    const isIgnored = globToRegex(['node_modules']);

    expect(isIgnored(path.join(root, 'node_modules'))).toBe(true);
    expect(isIgnored(path.join(root, 'src', 'index.ts'))).toBe(false);
  });

  test('should support wildcards', () => {
    const isIgnored = globToRegex(['*.log']);

    expect(isIgnored(path.join(root, 'logs', 'debug.log'))).toBe(true);
    expect(isIgnored(path.join(root, 'log.txt'))).toBe(false);
  });

  test('should ignore hidden files and directories', () => {
    const isIgnored = globToRegex(['.**']);

    expect(isIgnored(path.join(root, '.git'))).toBe(true);
    expect(isIgnored(path.join(root, 'src'))).toBe(false);
  });

  test('should treat regex characters in patterns literally', () => {
    const isIgnored = globToRegex(['file(1).txt']);

    expect(isIgnored(path.join(root, 'file(1).txt'))).toBe(true);
    expect(isIgnored(path.join(root, 'file1.txt'))).toBe(false);
  });

  test('should ignore nothing when there are no patterns', () => {
    const isIgnored = globToRegex([]);

    expect(isIgnored(path.join(root, 'anything'))).toBe(false);
  });
});
