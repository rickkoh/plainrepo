import { FileContent } from '@/src/types/FileContent';
import { chunk } from '@/lib/utils';

import { FileNode } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';

const fs = require('fs');

export function getContent(
  path: string,
  transform?: (output: string) => string,
): string {
  if (!fs.existsSync) {
    return '';
  }

  const stats = fs.statSync(path);

  if (stats.isDirectory()) {
    return '';
  }

  const rawContent = fs.readFileSync(path, 'utf-8');
  return transform ? transform(rawContent) : rawContent;
}

export function streamGetContent(
  fileNodeList: FileNode[],
  callback: (fileContent: FileContent[]) => void,
  chunkOption?: { size: number },
) {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  let index = -1;

  chunk(fileNodeList, chunkOption?.size ?? 20).forEach((fileNodes) => {
    const fileContents = fileNodes.map((fileNode) => {
      index += 1;
      return {
        index,
        name: fileNode.name,
        path: fileNode.path,
        content: getContent(
          fileNode.path,
          (output) => applyReplacements(output, replaceList), // TODO: Refactor transformer
        ),
      };
    });
    callback(fileContents);
  });
}
