import { Dirent } from 'node:fs';
import {
  ExcludeListSchema,
  ShouldIncludeGitIgnoreSchema,
} from '@/src/types/AppSettings';

import { FileNode, FileNodes } from '../../types/FileNode';
import { readAppSettings } from './AppSettings';
import { applyReplacements } from './Replacer';
import shouldExclude, { buildRegexes, getGitIgnorePatterns } from './Excluder';

const fs = require('fs');
const path = require('path');

/**
 * Build the file node from the root directory
 *
 * @param dirPath - The root directory to build the file node from
 * @returns The root file node
 */
export function buildFileNode(dirPath: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = ExcludeListSchema.parse(appSettings.exclude);
  const shouldIncludeGitIgnore = ShouldIncludeGitIgnoreSchema.parse(
    appSettings.shouldIncludeGitIgnore,
  );

  if (shouldIncludeGitIgnore) {
    excludePatterns.push(...getGitIgnorePatterns(dirPath));
  }

  const excludeRegexes = buildRegexes(excludePatterns);

  const stats = fs.statSync(dirPath);
  const baseName = path.basename(dirPath);

  if (stats.isFile()) {
    return {
      name: baseName,
      path: dirPath,
      type: 'file',
      selected: false,
      expanded: true,
    };
  }

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
            expanded: true,
          };
        }

        return {
          name: entry.name,
          path: fullPath,
          type: 'file',
          selected: false,
          expanded: true,
        };
      });
  }

  return {
    name: baseName,
    path: dirPath,
    type: 'directory',
    children: build(dirPath),
    selected: false,
    expanded: true,
  };
}

/**
 * Build a file node for a single directory level (non-recursive)
 *
 * @param dirPath - The directory path to build the file node for
 * @returns The file node for the directory
 */
export function buildFileNodeSingleLevel(dirPath: string): FileNode {
  const appSettings = readAppSettings();
  const excludePatterns = ExcludeListSchema.parse(appSettings.exclude);
  const shouldIncludeGitIgnore = ShouldIncludeGitIgnoreSchema.parse(
    appSettings.shouldIncludeGitIgnore,
  );

  if (shouldIncludeGitIgnore) {
    excludePatterns.push(...getGitIgnorePatterns(dirPath));
  }

  const excludeRegexes = buildRegexes(excludePatterns);

  const stats = fs.statSync(dirPath);
  const baseName = path.basename(dirPath);

  if (stats.isFile()) {
    return {
      name: baseName,
      path: dirPath,
      type: 'file',
      selected: false,
    };
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const children = entries
    .filter((entry: Dirent) => !shouldExclude(entry.name, excludeRegexes))
    .map((entry: Dirent) => {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          path: fullPath,
          type: 'directory' as const,
          children: [], // Empty array indicates unexpanded directory
          selected: false,
          expanded: false,
        };
      }

      return {
        name: entry.name,
        path: fullPath,
        type: 'file' as const,
        selected: false,
        expanded: false,
      };
    });

  return {
    name: baseName,
    path: dirPath,
    type: 'directory',
    children,
    selected: false,
    expanded: true,
  };
}

/**
 * Build the `fileNode` to the `targetPath` and returns the `targetFileNode`
 *
 * @param fileNode - The file node to build the file node to
 * @param targetPath - The target path to build the file node to
 * @returns The file node to the target path
 */
export function buildFileNodeToPath(
  fileNode: FileNode,
  targetPath: string,
): FileNode | null {
  if (fileNode.path === targetPath) {
    return fileNode;
  }

  // Ensure targetPath starts with fileNode.path
  if (!targetPath.startsWith(fileNode.path)) {
    return null;
  }

  const relativePath = path.relative(fileNode.path, targetPath);
  if (relativePath === '') {
    return fileNode;
  }

  const pathComponents = relativePath
    .split(path.sep)
    .filter((p: string) => p !== '');

  let currentNode: FileNode | null = fileNode;

  for (let i = 0; i < pathComponents.length; i += 1) {
    const component = pathComponents[i];
    if (!currentNode || currentNode.type !== 'directory') {
      return null;
    }

    if (
      !currentNode.children ||
      currentNode.children.length === 0 ||
      !currentNode.expanded
    ) {
      const expandedNode = buildFileNodeSingleLevel(currentNode.path);
      if (expandedNode && expandedNode.children) {
        currentNode.children = expandedNode.children;
        currentNode.expanded = true; // Mark as expanded
      } else {
        return null;
      }
    }

    const nextNode: FileNode | undefined = currentNode.children?.find(
      (child) => child.name === component,
    );

    if (!nextNode) {
      return null;
    }
    currentNode = nextNode;
  }

  if (currentNode && currentNode.path === targetPath) {
    return currentNode;
  }

  return null;
}

/**
 * Generate the directory structure from the file node
 *
 * @param fileNode The file node to generate the directory structure from
 * @param options - The options for the directory structure
 * @param options.selectedOnly - Whether to only include selected nodes (default: false)
 * @returns The directory structure as a string
 */
export function generateDirectoryStructure(
  fileNode: FileNode,
  options: { selectedOnly?: boolean } = {
    selectedOnly: false,
  },
): string {
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
        if (child.selected || !options.selectedOnly) {
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
  return traverse(fileNode);
}

/**
 * Search for files and directories matching a pattern
 *
 * @param rootDir - The root directory to search in
 * @param searchTerm - The search term to match
 * @param options - Search options
 * @returns Array of matching file nodes
 */
export function searchFileSystem(
  rootDir: string,
  searchTerm: string,
  options: {
    includeFiles?: boolean;
    includeDirs?: boolean;
    maxResults?: number;
    caseSensitive?: boolean;
  } = {},
): Promise<FileNode[]> {
  const {
    includeFiles = true,
    includeDirs = true,
    maxResults = 1000,
    caseSensitive = false,
  } = options;

  const appSettings = readAppSettings();
  const excludePatterns = ExcludeListSchema.parse(appSettings.exclude);
  const excludeRegexes = buildRegexes(excludePatterns);

  const results: FileNode[] = [];
  const regex = new RegExp(
    searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
    caseSensitive ? '' : 'i',
  );

  return new Promise((resolve) => {
    const searchDir = async (dirPath: string) => {
      if (results.length >= maxResults) return;

      try {
        const entries = await fs.promises.readdir(dirPath, {
          withFileTypes: true,
        });

        await Promise.all(
          entries.map(async (entry: Dirent) => {
            if (results.length >= maxResults) return;

            if (shouldExclude(entry.name, excludeRegexes)) return;

            const fullPath = path.join(dirPath, entry.name);

            // Check if this entry matches the search term
            const matches = regex.test(entry.name);

            if (entry.isDirectory()) {
              if (matches && includeDirs) {
                results.push({
                  name: entry.name,
                  path: fullPath,
                  type: 'directory',
                  children: [],
                  selected: false,
                });
              }

              // Continue searching in this directory
              await searchDir(fullPath);
            } else if (entry.isFile() && matches && includeFiles) {
              results.push({
                name: entry.name,
                path: fullPath,
                type: 'file',
                selected: false,
              });
            }
          }),
        );
      } catch (err) {
        console.error(`Error searching in directory ${dirPath}:`, err);
      }
    };

    // Start the search
    searchDir(rootDir)
      .then(() => resolve(results))
      .catch((err) => {
        console.error('Search error:', err);
        resolve(results);
      });
  });
}
