import { FileNode } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';

const fs = require('fs');

const MAX_SIZE = 1_000_000;

export default function getContent(rootFileNode: FileNode) {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  function readContent(fileNode: FileNode): string {
    if (fileNode.type === 'file' && fileNode.selected) {
      if (!fs.existsSync(fileNode.path)) {
        return '';
      }
      const stats = fs.statSync(fileNode.path);

      if (stats.size > MAX_SIZE || stats.isDirectory()) {
        return '';
      }

      try {
        const rawContent = fs.readFileSync(fileNode.path, 'utf-8');
        return applyReplacements(
          `\`\`\`${fileNode.name}\n${rawContent}\n\`\`\`\n\n`,
          replaceList,
        );
      } catch (error) {
        return '';
      }
    }
    if (fileNode.type === 'directory') {
      let content = '';
      if (fileNode.children && fileNode.children.length > 0) {
        for (let i = 0; i < fileNode.children.length; i += 1) {
          content += readContent(fileNode.children[i]);
        }
      }
      return content;
    }

    return '';
  }

  return readContent(rootFileNode);
}
