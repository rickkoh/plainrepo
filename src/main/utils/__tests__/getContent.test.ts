import fs from 'fs';
import os from 'os';
import path from 'path';
import { getContent } from '../ContentAggregator';

jest.mock('electron', () => ({
  app: {
    getPath: () => os.tmpdir(),
  },
}));

describe('getContent', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'getContent-'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should return the file content', () => {
    const filePath = path.join(tempDir, 'hello.txt');
    fs.writeFileSync(filePath, 'Hello world', 'utf8');

    expect(getContent(filePath)).toBe('Hello world');
  });

  test('should return an empty string for a file that no longer exists', () => {
    expect(getContent(path.join(tempDir, 'deleted.txt'))).toBe('');
  });

  test('should not throw when a file is locked by another process', () => {
    const filePath = path.join(tempDir, 'locked.txt');
    fs.writeFileSync(filePath, 'locked', 'utf8');

    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw Object.assign(new Error('resource busy or locked'), {
        code: 'EBUSY',
      });
    });

    expect(getContent(filePath)).toBe('Unable to read file (EBUSY)');
  });
});
