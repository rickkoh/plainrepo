import fs from 'fs';
import path from 'path';
import os from 'os';
import { buildFileNode } from '../FileBuilder';

jest.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      if (name === 'userData') return os.tmpdir();
      return '/';
    },
  },
}));

describe('buildFileNode', () => {
  let tempDir: string;
  const dummySettingsPath = path.join(os.tmpdir(), 'AppSettings.json');

  beforeAll(() => {
    fs.writeFileSync(
      dummySettingsPath,
      JSON.stringify({ exclude: [] }),
      'utf8',
    );

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'testApp-'));
    fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'Hello world', 'utf8');

    const subdirPath = path.join(tempDir, 'subdir');
    fs.mkdirSync(subdirPath);
    fs.writeFileSync(
      path.join(subdirPath, 'file2.txt'),
      'Another file',
      'utf8',
    );
  });

  afterAll(() => {
    fs.rmSync(dummySettingsPath, { recursive: true, force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should correctly build the file node structure', () => {
    const fileNode = buildFileNode(tempDir);

    expect(fileNode.type).toBe('directory');
    expect(fileNode.selected).toBe(true);

    expect(fileNode.children).toBeDefined();
    expect(fileNode.children?.length).toBe(2);

    const file1 = fileNode.children?.find(
      (child) => child.name === 'file1.txt',
    );
    expect(file1).toBeDefined();
    expect(file1?.type).toBe('file');

    const subdir = fileNode.children?.find((child) => child.name === 'subdir');
    expect(subdir).toBeDefined();
    expect(subdir?.type).toBe('directory');

    if (!subdir || !subdir.children) {
      throw new Error('subdir has no children');
    }
    expect(subdir.children.length).toBe(1);
    expect(subdir.children[0].name).toBe('file2.txt');
    expect(subdir.children[0].type).toBe('file');
  });
});
