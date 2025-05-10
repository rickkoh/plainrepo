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
  const baseName = path.basename(dirPath);

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
          loaded: false, // New flag to indicate if directory contents have been loaded
        };
      }

      return {
        name: entry.name,
        path: fullPath,
        type: 'file' as const,
        selected: false,
      };
    });

  return {
    name: baseName,
    path: dirPath,
    type: 'directory',
    children,
    selected: false,
    loaded: true, // Root directory is considered loaded
  };
}

/**
 * Expand a directory node by loading its contents
 *
 * @deprecated Use searchFileNode + buildFileNodeSingleLevel directly instead
 * This function mutates the original fileNode tree, which can lead to issues.
 * Instead, find the node with searchFileNode and expand it with buildFileNodeSingleLevel.
 *
 * @param dirPath - The directory path to expand
 * @param fileNode - The root file node to update
 * @returns The updated root node with the expanded directory
 */
export function expandDirectoryNode(
  dirPath: string,
  fileNode: FileNode,
): FileNode {
  // Function to find and expand the target directory
  const findAndExpand = (node: FileNode): boolean => {
    if (node.path === dirPath) {
      // This is the directory to expand
      const expandedNode = buildFileNodeSingleLevel(dirPath);

      // Preserve selected state from the original node
      expandedNode.selected = node.selected;

      // Only update the children and loaded status
      node.children = expandedNode.children;
      node.loaded = true;
      node.error = expandedNode.error;

      return true;
    }

    // Recursively search for the directory in children
    if (node.children && node.children.length > 0) {
      return node.children.some(
        (child) => child.type === 'directory' && findAndExpand(child),
      );
    }

    return false;
  };

  findAndExpand(fileNode);
  return fileNode;
}

export function searchFileNode(
  fileNode: FileNode,
  searchPath: string,
): FileNode | null {
  if (fileNode.path === searchPath) {
    return fileNode;
  }

  if (fileNode.children) {
    for (let i = 0; i < fileNode.children.length; i += 1) {
      const child = fileNode.children[i];
      const result = searchFileNode(child, searchPath);
      if (result) return result;
    }
  }

  return null;
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

      const entries = await fs.promises.readdir(dirPath, {
        withFileTypes: true,
      });

      entries.forEach(async (entry: Dirent) => {
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
              loaded: false,
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
            loaded: false,
          });
        }
      });
    };

    // Start the search
    searchDir(rootDir);
    resolve(results);
  });
}
