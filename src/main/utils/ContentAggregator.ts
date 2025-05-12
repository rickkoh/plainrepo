import { FileContent } from '@/src/types/FileContent';
import { chunk, mbToBytes } from '@/lib/utils';
import {
  ChunkSizeSchema,
  MaxFileSizeSchema,
  ReplaceListSchema,
} from '@/src/types/AppSettings';

import { FileNode } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';

const fs = require('fs');

/**
 * Gets the content of a file
 *
 * @param path - The path of the file to get the content of
 * @param transform - The transform to apply to the content
 * @param maxSize - The maximum size of the content to return
 * @returns The content of the file
 */
export function getContent(
  path: string,
  transform?: (output: string) => string,
  maxSize?: number,
): string {
  if (!fs.existsSync) {
    return '';
  }

  const stats = fs.statSync(path);

  if (stats.isDirectory()) {
    return '';
  }

  if (maxSize && stats.size > maxSize) {
    return `File is too large to display (${stats.size} bytes)`;
  }

  const rawContent = fs.readFileSync(path, 'utf-8');
  return transform ? transform(rawContent) : rawContent;
}

/**
 * Streams the content of a list of file nodes
 *
 * @param fileNodeList - The list of file nodes to stream the content of
 * @param callback - The callback to call with the file content
 */
export function streamGetContent(
  fileNodeList: FileNode[],
  callback: (fileContent: FileContent[]) => void,
) {
  const appSettings = readAppSettings();
  const replaceList = ReplaceListSchema.parse(appSettings.replace);
  const maxFileSize = mbToBytes(
    MaxFileSizeSchema.parse(appSettings.maxFileSize),
  );
  const chunkSize = ChunkSizeSchema.parse(appSettings.chunkSize);

  let index = -1;

  chunk(fileNodeList, chunkSize).forEach((fileNodes) => {
    const fileContents = fileNodes.map((fileNode) => {
      index += 1;
      return {
        index,
        name: fileNode.name,
        path: fileNode.path,
        content: getContent(
          fileNode.path,
          (output) => applyReplacements(output, replaceList), // TODO: Refactor transformer
          maxFileSize,
        ),
      };
    });
    callback(fileContents);
  });
}
