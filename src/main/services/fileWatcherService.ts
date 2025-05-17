import { BrowserWindow } from 'electron';
import * as chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { FileNode } from '../../types/FileNode';
import { ipcChannels } from '../../shared/ipcChannels';
import { readAppSettings, globToRegex } from '../utils/AppSettings';
import {
  searchFileNode,
  toggleFileNodeSelection,
  updateSelectedPaths,
} from '../../shared/utils/FileNodeUtils';
import { FileContentService } from './fileContentService';

export class FileWatcherService {
  private mainWindow: BrowserWindow;

  private fileContentService: FileContentService;

  private activeWatcher: chokidar.FSWatcher | null = null;

  private rootFileNode: FileNode | null = null;

  private expandedDirectories = new Set<string>();

  private selectedPaths = new Set<string>();

  private pathWatchers = new Map<string, chokidar.FSWatcher>();

  constructor(
    mainWindow: BrowserWindow,
    fileContentService: FileContentService,
  ) {
    this.mainWindow = mainWindow;
    this.fileContentService = fileContentService;
  }

  /**
   * Initialize the watcher for a root directory
   */
  public initializeWatcher(rootDir: string, rootNode: FileNode): void {
    this.rootFileNode = rootNode;

    // Close any existing watcher
    if (this.activeWatcher) {
      this.activeWatcher.close();
      this.activeWatcher = null;
    }

    // Clear watchers and paths
    this.pathWatchers.forEach((watcher) => watcher.close());
    this.pathWatchers.clear();
    this.expandedDirectories.clear();

    const appSettings = readAppSettings();
    const excludeList = appSettings.exclude || [];

    // Initialize the main watcher
    this.activeWatcher = chokidar.watch([], {
      ignored: globToRegex(excludeList),
      persistent: true,
      ignoreInitial: true,
      // awaitWriteFinish: true,
      depth: 0,
    });

    // Set up all the event handlers
    this.setupEventHandlers();

    // Start watching the root directory
    this.watchDirectory(rootDir);
  }

  /**
   * Set up all the file system event handlers
   */
  private setupEventHandlers(): void {
    if (!this.activeWatcher) return;

    // @ts-ignore
    this.activeWatcher.on('add', (filePath: string) => {
      console.log('File added:', filePath);
      this.handleFileAdded(filePath);
    });
    // @ts-ignore
    this.activeWatcher.on('unlink', (filePath: string) =>
      this.handleFileRemoved(filePath),
    );
    // @ts-ignore
    this.activeWatcher.on('change', (filePath: string) =>
      this.handleFileChanged(filePath),
    );
    // @ts-ignore
    this.activeWatcher.on('addDir', (dirPath: string) =>
      this.handleDirectoryAdded(dirPath),
    );
    // @ts-ignore
    this.activeWatcher.on('unlinkDir', (dirPath: string) =>
      this.handleDirectoryRemoved(dirPath),
    );
  }

  /**
   * Add a directory to be watched
   */
  public watchDirectory(dirPath: string, depth?: number): void {
    if (!this.activeWatcher) return;

    console.log(
      'Adding directory to watch:',
      dirPath,
      depth !== undefined ? `at depth ${depth}` : '',
    );
    this.expandedDirectories.add(dirPath);

    // Add this directory to the watcher with specific options when depth is provided
    if (depth !== undefined) {
      // For specific depth watching, we need a new watcher instance for this path
      const appSettings = readAppSettings();
      const excludeList = appSettings.exclude || [];

      const pathWatcher = chokidar.watch(dirPath, {
        ignored: globToRegex(excludeList),
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true,
        depth,
      });

      // Copy all event handlers from the main watcher to this path-specific watcher
      ['add', 'change', 'unlink', 'addDir', 'unlinkDir'].forEach(
        (eventName) => {
          const listeners = (this.activeWatcher as any).listeners(eventName);
          listeners.forEach((listener: (path: string) => void) => {
            // @ts-ignore
            pathWatcher.on(eventName, listener);
          });
        },
      );

      // Store this watcher to prevent garbage collection
      this.pathWatchers.set(dirPath, pathWatcher);
    } else {
      // Default behavior - just add to the main watcher (depth: 0)
      this.activeWatcher.add(dirPath);
    }
  }

  /**
   * Remove a directory from being watched
   */
  public unwatchDirectory(dirPath: string): void {
    if (!this.activeWatcher) return;

    console.log('Removing directory from watch:', dirPath);
    this.expandedDirectories.delete(dirPath);

    // Check if we have a specific watcher for this path
    if (this.pathWatchers.has(dirPath)) {
      const pathWatcher = this.pathWatchers.get(dirPath);
      if (pathWatcher) {
        pathWatcher.close();
      }
      this.pathWatchers.delete(dirPath);
    } else {
      // Default behavior - unwatch from the main watcher
      this.activeWatcher.unwatch(dirPath);
    }
  }

  /**
   * Handle a file being added
   */
  private handleFileAdded(filePath: string): void {
    if (!this.rootFileNode || !this.mainWindow) return;

    const dirPath = path.dirname(filePath);
    const parentNode = searchFileNode(this.rootFileNode, dirPath);

    if (parentNode && parentNode.expanded && parentNode.children) {
      const fileName = path.basename(filePath);

      // Check if file already exists in the children array to avoid duplicates
      const existingFileIndex = parentNode.children.findIndex(
        (child) => child.path === filePath || child.name === fileName,
      );

      // If file exists, remove it first to avoid duplicates
      if (existingFileIndex !== -1) {
        parentNode.children.splice(existingFileIndex, 1);
      }

      // Add the new file to the parent node
      const stats = fs.statSync(filePath);
      const isDirectory = stats.isDirectory();

      const newNode: FileNode = {
        name: fileName,
        path: filePath,
        type: isDirectory ? 'directory' : 'file',
        selected: false,
        expanded: false,
        ...(isDirectory ? { children: [] } : {}),
      };

      parentNode.children.push(newNode);
      this.mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
        path: dirPath,
        fileNode: parentNode,
      });
    }
  }

  /**
   * Handle a file being removed
   */
  private handleFileRemoved(filePath: string): void {
    if (!this.rootFileNode || !this.mainWindow) return;

    const dirPath = path.dirname(filePath);
    const parentNode = searchFileNode(this.rootFileNode, dirPath);

    if (parentNode && parentNode.expanded && parentNode.children) {
      const { selectedPaths: changes } = toggleFileNodeSelection(
        this.rootFileNode,
        filePath,
        false,
      );
      updateSelectedPaths(this.selectedPaths, changes);

      this.mainWindow.webContents.send(
        ipcChannels.FILE_NODE_SELECTION_CHANGED,
        {
          path: filePath,
          selected: false,
        },
      );

      const fileName = path.basename(filePath);
      parentNode.children = parentNode.children.filter(
        (child) => child.name !== fileName,
      );

      this.mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
        path: dirPath,
        fileNode: parentNode,
      });

      // Update file contents using the service
      this.fileContentService.updateFileContents(this.rootFileNode, {
        selectedOnly: true,
      });
    }
  }

  /**
   * Handle a file being changed
   */
  private handleFileChanged(filePath: string): void {
    if (!this.rootFileNode || !this.mainWindow) return;

    // For file content changes, check if the file is selected
    const fileNode = searchFileNode(this.rootFileNode, filePath);
    if (fileNode && fileNode.selected) {
      // Read the file content
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileContents = [{ path: filePath, content }];

        // Update the UI with the new content
        this.mainWindow.webContents.send(
          ipcChannels.FILE_CONTENTS_ADD,
          fileContents,
        );
      } catch (err) {
        console.error('Error reading changed file:', err);
      }

      // Update file contents using the service
      this.fileContentService.updateFileContents(this.rootFileNode, {
        selectedOnly: true,
      });
    }
  }

  /**
   * Handle a directory being added
   */
  private handleDirectoryAdded(dirPath: string): void {
    if (!this.rootFileNode || !this.mainWindow) return;

    const parentPath = path.dirname(dirPath);
    const parentNode = searchFileNode(this.rootFileNode, parentPath);

    if (parentNode && parentNode.expanded && parentNode.children) {
      const dirName = path.basename(dirPath);

      // Check if directory already exists in the children array to avoid duplicates
      const existingDirIndex = parentNode.children.findIndex(
        (child) => child.path === dirPath || child.name === dirName,
      );

      // If directory exists, remove it first to avoid duplicates
      if (existingDirIndex !== -1) {
        parentNode.children.splice(existingDirIndex, 1);
      }

      const newNode: FileNode = {
        name: dirName,
        path: dirPath,
        type: 'directory',
        expanded: false,
        children: [],
        selected: false,
      };

      parentNode.children.push(newNode);
      this.mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
        path: parentPath,
        fileNode: parentNode,
      });
    }
  }

  /**
   * Handle a directory being removed
   */
  private handleDirectoryRemoved(dirPath: string): void {
    if (!this.rootFileNode || !this.mainWindow) return;

    const parentPath = path.dirname(dirPath);
    const parentNode = searchFileNode(this.rootFileNode, parentPath);

    if (parentNode && parentNode.expanded && parentNode.children) {
      const dirName = path.basename(dirPath);
      parentNode.children = parentNode.children.filter(
        (child) => child.name !== dirName,
      );

      const { selectedPaths: changes } = toggleFileNodeSelection(
        this.rootFileNode,
        dirPath,
        false,
      );
      updateSelectedPaths(this.selectedPaths, changes);

      this.mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
        path: parentPath,
        fileNode: parentNode,
      });

      // Update file contents using the service
      this.fileContentService.updateFileContents(this.rootFileNode, {
        selectedOnly: true,
      });
    }
  }

  /**
   * Get the root file node
   */
  public getRootFileNode(): FileNode | null {
    return this.rootFileNode;
  }

  /**
   * Update the root file node
   */
  public setRootFileNode(fileNode: FileNode): void {
    this.rootFileNode = fileNode;
  }

  /**
   * Get the set of selected paths
   */
  public getSelectedPaths(): Set<string> {
    return this.selectedPaths;
  }
}

// Factory function for creating a new service instance
export function createFileWatcherService(
  mainWindow: BrowserWindow,
  fileContentService: FileContentService,
): FileWatcherService {
  return new FileWatcherService(mainWindow, fileContentService);
}
