import fs from 'fs';
import os from 'os';
import path from 'path';
import { buildFileNodeSingleLevel, buildFileNodeToPath } from '../FileBuilder';

jest.mock('electron', () => ({
  app: {
    getPath: () => os.tmpdir(),
  },
}));

describe('buildFileNodeToPath', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildFileNodeToPath-'));
    fs.mkdirSync(path.join(tempDir, 'a', 'b'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'a', 'b', 'c.txt'), 'content', 'utf8');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should expand intermediate directories using platform paths', () => {
    const rootNode = buildFileNodeSingleLevel(tempDir);
    const targetPath = path.join(tempDir, 'a', 'b', 'c.txt');

    const { node, expandedPaths } = buildFileNodeToPath(rootNode, targetPath);

    expect(node?.path).toBe(targetPath);
    expect(node?.type).toBe('file');
    expect(expandedPaths.map((expanded) => expanded.path)).toEqual([
      path.join(tempDir, 'a'),
      path.join(tempDir, 'a', 'b'),
    ]);
  });

  test('should return null for a path outside the root', () => {
    const rootNode = buildFileNodeSingleLevel(tempDir);

    const { node } = buildFileNodeToPath(
      rootNode,
      path.join(os.tmpdir(), 'somewhere-else', 'file.txt'),
    );

    expect(node).toBeNull();
  });

  test('should not throw when a directory cannot be read', () => {
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw Object.assign(new Error('operation not permitted'), {
        code: 'EPERM',
      });
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const node = buildFileNodeSingleLevel(tempDir);

    expect(node.type).toBe('directory');
    expect(node.children).toEqual([]);
  });
});
