import fs from 'fs';
import path from 'path';

export function buildRegexes(excludePatterns: string[]): RegExp[] {
  return excludePatterns.map((pattern) => {
    const regexString = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');

    return new RegExp(`^${regexString}$`);
  });
}

export function getGitIgnorePatterns(rootPath: string): string[] {
  const gitignorePath = path.join(rootPath, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    return [];
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const patterns: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const trimmedLine = lines[i].trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      // eslint-disable-next-line no-continue
      continue;
    }
    patterns.push(trimmedLine);
  }

  return patterns;
}

export default function shouldExclude(
  filename: string,
  excludeRegexes: RegExp[],
): boolean {
  return excludeRegexes.some((regex) => regex.test(filename));
}
