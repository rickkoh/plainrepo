import { ReplaceItem } from '@/src/types/AppSettings';
import { FileNode } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';

const fs = require('fs');

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyReplacements(
  content: string,
  replaceList: ReplaceItem[],
): string {
  let replaced = content;
  for (let i = 0; i < replaceList.length; i += 1) {
    // If you want to replace all occurrences, use a global regex:
    const regex = new RegExp(escapeRegex(replaceList[i].from), 'g');
    replaced = replaced.replace(regex, replaceList[i].to);
  }
  return replaced;
}

export default function getContent(rootFileNode: FileNode) {
  const appSettings = readAppSettings();

  const replaceList = appSettings.replace || [];

  function readContent(fileNode: FileNode): string {
    if (fileNode.type === 'file' && fileNode.selected) {
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
