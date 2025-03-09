import { Dirent } from 'node:fs';
import {
  ExcludeListSchema,
  MaxFileSizeSchema,
  ReplaceListSchema,
  ShouldIncludeGitIgnoreSchema,
} from '@/src/types/AppSettings';
import { mbToBytes } from '@/lib/utils';

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
  const excludePatterns = ExcludeListSchema.parse(appSettings.exclude);
  const shouldIncludeGitIgnore = ShouldIncludeGitIgnoreSchema.parse(
    appSettings.shouldIncludeGitIgnore,
  );

  if (shouldIncludeGitIgnore) {
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
            selected: false,
          };
        }

        return {
          name: entry.name,
          path: fullPath,
          type: 'file',
          selected: false,
        };
      });
  }

  const baseName = path.basename(rootDir);

  return {
    name: baseName.toUpperCase(),
    path: rootDir,
    type: 'directory',
    children: build(rootDir),
    selected: false,
  };
}

/**
 * Generate the directory structure from the file node
 *
 * @param node The file node to generate the directory structure from
 * @returns The directory structure as a string
 */
export function generateDirectoryStructure(node: FileNode): string {
  // Read app settings once at the top level
  const appSettings = readAppSettings();
  const replaceList = appSettings.replace || [];

  /**
   * Recursively traverses the directory structure
   *
   * @param currentNode The current file node to process
   * @param indent The indentation to use
   * @returns The directory structure as a string
   */
  function traverse(currentNode: FileNode, indent: string = ''): string {
    let result = indent === '' ? '.\n' : '';
    if (currentNode.children && currentNode.children.length > 0) {
      for (let i = 0; i < currentNode.children.length; i += 1) {
        const child = currentNode.children[i];
        const isLastChild = i === currentNode.children.length - 1;
        const prefix = isLastChild ? '└── ' : '├── ';
        if (child.selected) {
          result += `${indent}${prefix}${applyReplacements(child.name, replaceList)}\n`;
        }
        if (child.type === 'directory') {
          result += traverse(child, indent + (isLastChild ? '    ' : '│   '));
        }
      }
    }
    return result;
  }

  // Start the traversal
  return traverse(node);
}

/**
 * Build the file node with content from the root directory
 *
 * @param rootDir The root directory to build the file node from
 * @returns The root file node with content
 */
export function buildFileNodeContent(rootDir: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = ExcludeListSchema.parse(appSettings.exclude);
  const replaceList = ReplaceListSchema.parse(appSettings.replace);
  const maxFileSize = mbToBytes(
    MaxFileSizeSchema.parse(appSettings.maxFileSize),
  );
  const shouldIncludeGitIgnore = ShouldIncludeGitIgnoreSchema.parse(
    appSettings.shouldIncludeGitIgnore,
  );

  if (shouldIncludeGitIgnore) {
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

        const stats = fs.statSync(fullPath);
        if (stats.size > maxFileSize) {
          return {
            name: entry.name,
            path: fullPath,
            type: 'file',
            selected: true,
            content: `File is too large to display (${stats.size} bytes)`,
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

  const baseName = path.basename(rootDir);

  return {
    name: baseName.toUpperCase(),
    path: rootDir,
    type: 'directory',
    children: readDir(rootDir),
    selected: true,
  };
}

/**
 * Flattens a FileNode tree into a flat array of nodes.
 * Only processes children if the node is a selected directory.
 *
 * @param fileNode The file node (root of the tree) to process.
 * @returns An array containing all nodes from the tree.
 * @complexity O(n)
 */
export function flattenFileNode(fileNode: FileNode): FileNode[] {
  const result: FileNode[] = [];
  function flatten(node: FileNode) {
    if (
      node.type === 'directory' &&
      node.children &&
      node.children.length > 0 &&
      node.selected
    ) {
      node.children.forEach((child) => {
        flatten(child);
      });
    } else if (node.type === 'file' && node.selected) {
      result.push(node);
    }
  }
  flatten(fileNode);
  return result;
}
