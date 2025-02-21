import { Dirent } from 'node:fs';
import { FileNode, FileContentNode, FileNodes } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';
import shouldExclude, { buildRegexes, getGitIgnorePatterns } from './Excluder';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

export function buildFileNode(rootDir: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = appSettings.exclude || [];

  if (appSettings.shouldIncludeGitIgnore) {
    excludePatterns.push(...getGitIgnorePatterns(rootDir));
  }

  const excludeRegexes = buildRegexes(excludePatterns);

  console.log('Excluding patterns:', excludePatterns);

  function readDir(currentPath: string): FileNodes {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    return entries
      .filter((entry: Dirent) => {
        return !shouldExclude(entry.name, excludeRegexes);
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

export function generateDirectoryStructure(
  node: FileNode,
  indent: string = '',
): string {
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
        result += generateDirectoryStructure(
          child,
          indent + (isLastChild ? '    ' : '│   '),
        );
      }
    }
  }

  return result;
}

export function buildFileNodeContent(rootDir: string): FileContentNode {
  const appSettings = readAppSettings();
  const excludePatterns = appSettings.exclude || [];
  const replaceList = appSettings.replace || [];

  if (appSettings.shouldIncludeGitIgnore) {
    excludePatterns.push(...getGitIgnorePatterns(rootDir));
  }

  const excludeRegexes = buildRegexes(excludePatterns);

  console.log('Excluding patterns:', excludePatterns);

  function readDir(currentPath: string): FileNodes {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    return entries
      .filter((entry: Dirent) => {
        return !shouldExclude(entry.name, excludeRegexes);
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

        const rawContent = applyReplacements(
          fs.readFileSync(fullPath, 'utf-8'),
          replaceList,
        );

        return {
          name: entry.name,
          path: fullPath,
          type: 'file',
          selected: true,
          content: rawContent,
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

export function toFileNodeContent(node: FileNode): FileContentNode {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  function convert(fileNode: FileNode): FileContentNode {
    if (fileNode.type === 'file' && fileNode.selected) {
      const rawContent = fs.readFileSync(fileNode.path, 'utf-8');
      return {
        ...fileNode,
        content: applyReplacements(rawContent, replaceList),
      };
    }

    return {
      ...fileNode,
      children: fileNode.children?.map((child) => convert(child)),
    };
  }

  return convert(node);
}
