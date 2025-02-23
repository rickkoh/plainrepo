import { Dirent } from 'node:fs';
import { FileNode, FileNodes } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';
import shouldExclude, { buildRegexes, getGitIgnorePatterns } from './Excluder';

const fs = require('fs');
const path = require('path');

/**
 * Build the file node from the root directory
 *
 * @param rootDir - The root directory to build the file node from
 * @returns The root file node
 */
export function buildFileNode(rootDir: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = appSettings.exclude || [];

  if (appSettings.shouldIncludeGitIgnore) {
    excludePatterns.push(...getGitIgnorePatterns(rootDir));
  }

  const excludeRegexes = buildRegexes(excludePatterns);

  function build(currentPath: string): FileNodes {
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
            children: build(fullPath),
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
    children: build(rootDir),
    selected: true,
  };
}

/**
 * Generate the directory structure from the file node
 *
 * @param node The file node to generate the directory structure from
 * @param indent The indentation to use
 * @returns The directory structure as a string
 */
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

/**
 * Build the file node with content from the root directory
 *
 * @param rootDir The root directory to build the file node from
 * @returns The root file node with content
 */
export function buildFileNodeContent(rootDir: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = appSettings.exclude || [];
  const replaceList = appSettings.replace || [];

  if (appSettings.shouldIncludeGitIgnore) {
    excludePatterns.push(...getGitIgnorePatterns(rootDir));
  }

  const excludeRegexes = buildRegexes(excludePatterns);

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

/**
 * Discover the content from the file node
 *
 * @param node The file node to discover the content from
 * @returns The file node with content
 */
export function discoverFileNodeContent(node: FileNode): FileNode {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  const syncDate = new Date();

  function discover(fileNode: FileNode): FileNode {
    if (fileNode.type === 'file' && fileNode.selected) {
      const rawContent = fs.readFileSync(fileNode.path, 'utf-8');
      return {
        ...fileNode,
        content: applyReplacements(rawContent, replaceList),
        lastSynced: syncDate,
      };
    }

    return {
      ...fileNode,
      children: fileNode.children?.map((child) => discover(child)),
    };
  }

  return discover(node);
}

/**
 * Sync the file node with content
 *
 * @param node The file node to sync
 * @returns The synced file node
 */
export function syncFileNode(node: FileNode): FileNode {
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  const syncDate = new Date();

  function discover(fileNode: FileNode): FileNode {
    if (fileNode.type === 'file' && fileNode.selected) {
      const rawContent = fs.readFileSync(fileNode.path, 'utf-8');
      return {
        ...fileNode,
        content: applyReplacements(rawContent, replaceList),
        lastSynced: syncDate,
      };
    }

    return {
      ...fileNode,
      children: fileNode.children?.map((child) => discover(child)),
    };
  }

  return discover(node);
}
