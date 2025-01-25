import { Dirent } from 'fs';
import { FileNode, FileNodes } from '../../types/FileNode';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

export function buildFileNode1(rootDir: string): FileNode {
  function readDir(currentPath: string): FileNodes {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    return entries.map((entry: any) => {
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
    name: String(rootDir),
    path: rootDir,
    type: 'directory',
    children: readDir(rootDir),
    selected: true,
  };
}

export async function buildFileNode(rootDir: string): Promise<FileNode> {
  async function readDir(currentPath: string): Promise<FileNodes> {
    const entries = await new Promise<Dirent[]>((resolve) => {
      fs.readdir(
        currentPath,
        { withFileTypes: true },
        (err: Error, files: Dirent[]) => {
          resolve(files);
        },
      );
    });

    return Promise.all(
      entries.map(async (entry: Dirent) => {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          return {
            name: entry.name,
            path: fullPath,
            type: 'directory',
            children: await readDir(fullPath),
            selected: true,
          };
        }

        return {
          name: entry.name,
          path: fullPath,
          type: 'file',
          selected: true,
        };
      }),
    );
  }

  return {
    name: String(rootDir),
    path: rootDir,
    type: 'directory',
    children: await readDir(rootDir),
    selected: true,
  };
}

export function generateFileTree(node: FileNode, indent: string = ''): string {
  let result = indent === '' ? '.\n' : '';

  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      const isLastChild = i === node.children.length - 1;
      const prefix = isLastChild ? '└── ' : '├── ';
      if (child.selected) {
        result += `${indent}${prefix}${child.name}\n`;
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
