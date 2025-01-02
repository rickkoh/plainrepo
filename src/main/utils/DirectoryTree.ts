import { FileNode, FileNodes } from '../../types/FileNode';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

export default function getDirectoryTree(rootDir: string): FileNode {
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
    name: 'file',
    path: rootDir,
    type: 'directory',
    children: readDir(rootDir),
    selected: true,
  };
}
