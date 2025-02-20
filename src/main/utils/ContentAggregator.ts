import { FileNode } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';

const fs = require('fs');

export default function getContent(rootFileNode: FileNode) {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  function readContent(fileNode: FileNode): string {
    if (fileNode.type === 'file' && fileNode.selected) {
      if (!fs.existsSync(fileNode.path)) {
        return '';
      }
      const rawContent = fs.readFileSync(fileNode.path, 'utf-8');
      return `\`\`\`${fileNode.name}\n${applyReplacements(rawContent, replaceList)}\n\`\`\`\n\n`;
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
