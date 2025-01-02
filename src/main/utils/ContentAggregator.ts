import { FileNode } from '../../types/FileNode';

const fs = require('fs');

/**
 * TODO:
 * - Count the number of files selected
 * - Count number of tokens
 * - Add to read certain file extensions
 */
export default function GetContent(rootFileNode: FileNode) {
  function readContent(fileNode: FileNode): string {
    if (fileNode.type === 'file' && fileNode.selected) {
      return `${fileNode.name}\n====\n${fs.readFileSync(fileNode.path, 'utf-8')}\n====\n`;
    }
    if (fileNode.type === 'directory') {
      let content = '';
      fileNode.children?.forEach((child) => {
        content += readContent(child);
      });
      return content;
    }

    return '';
  }

  return readContent(rootFileNode);
}
