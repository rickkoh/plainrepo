import { ReplaceItem } from '@/src/types/AppSettings';

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyReplacements(
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
