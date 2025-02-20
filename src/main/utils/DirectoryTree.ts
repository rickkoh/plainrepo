import { Dirent } from 'node:fs';
import { FileNode, FileNodes } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

export function buildFileNode(rootDir: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = appSettings.exclude || [];

  console.log('Excluding patterns:', excludePatterns);

  const excludeRegexes = excludePatterns.map((pattern) => {
    const regexString = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');

    return new RegExp(`^${regexString}$`);
  });

  function shouldExclude(filename: string): boolean {
    return excludeRegexes.some((regex) => regex.test(filename));
  }

  function readDir(currentPath: string): FileNodes {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    return entries
      .filter((entry: Dirent) => {
        return !shouldExclude(entry.name);
      })
      .map((entry: Dirent) => {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          return {
            name: entry.name,
            path: fullPath,
            type: 'directory',
            children: readDir(fullPath),
            selected: true,
          };
        }

        return {
          name: entry.name,
          path: fullPath,
          type: 'file',
          selected: true,
        };
      });
  }

  return {
    name: rootDir,
    path: rootDir,
    type: 'directory',
    children: readDir(rootDir),
    selected: true,
  };
}

export function generateFileTree(node: FileNode, indent: string = ''): string {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  let result = indent === '' ? '.\n' : '';

  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      const isLastChild = i === node.children.length - 1;
      const prefix = isLastChild ? '└── ' : '├── ';
      if (child.selected) {
        result += `${indent}${prefix}${applyReplacements(child.name, replaceList)}\n`;
      }
      if (child.type === 'directory') {
        result += generateFileTree(
          child,
          indent + (isLastChild ? '    ' : '│   '),
        );
      }
    }
  }

  return result;
}
