/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { FileNode, FileNodeSchema } from '../types/FileNode';
import {
  FileNodeExpandSchema,
  FileNodeSearchSchema,
  FileNodeSelectionSchema,
} from '../types/FileNodeDto';
import { readAppSettings, writeAppSettings } from './utils/AppSettings';
import { ipcChannels } from '../shared/ipcChannels';
import {
  toggleFileNodeSelection,
  searchFileNode,
  updateSelectedPaths,
} from '../shared/utils/FileNodeUtils';
import {
  buildFileNode,
  buildFileNodeSingleLevel,
  buildFileNodeToPath,
  generateDirectoryStructure,
  searchFileSystem,
} from './utils/FileBuilder';
import {
  createFileContentService,
  FileContentService,
} from './services/fileContentService';
import {
  createFileWatcherService,
  FileWatcherService,
} from './services/fileWatcherService';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

// Global state
let rootFileNode: FileNode | null = null;
let rootDirectory: string | null = null;
let fileContentService: FileContentService | null = null;
let fileWatcherService: FileWatcherService | null = null;
const selectedPaths = new Set<string>();

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('dialog:openDirectory', async () => {
  if (!mainWindow) {
    return null;
  }

  const {
    canceled,
    filePaths: [selectedPath],
  } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (canceled) {
    return null;
  }

  rootDirectory = selectedPath;

  mainWindow.webContents.send('workspace:path', selectedPath);

  const start = Date.now();
  rootFileNode = buildFileNodeSingleLevel(selectedPath);

  // Initialize the file watcher with the root directory
  if (fileWatcherService) {
    fileWatcherService.initializeWatcher(selectedPath, rootFileNode);
  }

  const timeTaken = Date.now() - start;

  console.log('Time taken:', timeTaken);
  mainWindow.webContents.send('workspace:fileNode', rootFileNode);

  return null;
});

ipcMain.on('fileNode:update', (event, arg) => {
  console.log('Updating file node', arg);

  if (!mainWindow || !rootFileNode || !fileWatcherService) {
    return;
  }

  const parsedResult = FileNodeExpandSchema.safeParse(arg);
  if (!parsedResult.success) {
    return;
  }

  const { path: directoryPath, expanded } = parsedResult.data;

  if (!expanded) {
    // Unwatch the directory
    fileWatcherService!.unwatchDirectory(directoryPath);
    return;
  }

  const targetnode = searchFileNode(rootFileNode, directoryPath);

  if (!targetnode || targetnode.expanded) {
    return;
  }

  const expandedNode = buildFileNodeSingleLevel(directoryPath);
  fileWatcherService!.watchDirectory(directoryPath);

  Object.assign(targetnode, expandedNode);

  // Should perhaps rename expand to 'join' or 'deepen'
  mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
    path: directoryPath,
    fileNode: expandedNode,
  });
});

ipcMain.on('fileNode:select', (event, arg) => {
  console.log('Selecting node', arg);

  if (!mainWindow || !rootFileNode || !fileWatcherService) {
    return;
  }

  const parsedResult = FileNodeSelectionSchema.safeParse(arg);
  if (!parsedResult.success) {
    console.error('Error parsing file node selection', parsedResult.error);
    return;
  }

  const { path: nodePath, selected } = parsedResult.data;

  let targetNode = searchFileNode(rootFileNode, nodePath);

  if (!targetNode) {
    const result = buildFileNodeToPath(rootFileNode, nodePath);

    targetNode = result.node;

    result.expandedPaths.forEach(({ path: expandedPath, node }) => {
      if (!mainWindow) {
        return;
      }

      mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
        path: expandedPath,
        fileNode: node,
      });

      fileWatcherService!.watchDirectory(expandedPath);
    });

    if (!targetNode) {
      return;
    }
  }

  let expandedNode: FileNode | null = null;
  if (selected) {
    expandedNode = buildFileNode(targetNode.path);
    Object.assign(targetNode, expandedNode);
    mainWindow.webContents.send(ipcChannels.FILE_NODE_UPDATE, {
      path: targetNode.path,
      fileNode: expandedNode,
    });

    fileWatcherService!.watchDirectory(targetNode.path, Infinity);
  }

  // Update the root node in the file watcher service
  fileWatcherService!.setRootFileNode(rootFileNode);

  const { selectedPaths: changes } = toggleFileNodeSelection(
    rootFileNode,
    nodePath,
    selected,
  );
  updateSelectedPaths(selectedPaths, changes);

  mainWindow.webContents.send(ipcChannels.FILE_NODE_SELECTION_CHANGED, {
    path: targetNode.path,
    selected,
  });

  // Update file contents using the service
  if (fileContentService) {
    fileContentService.updateFileContents(rootFileNode, { selectedOnly: true });
  }
});

ipcMain.handle('search:files', async (event, arg) => {
  console.log('Searching for node', arg);
  if (!rootDirectory) {
    return { success: false, error: 'No workspace open' };
  }

  const parsedResult = FileNodeSearchSchema.safeParse(arg);
  if (!parsedResult.success) {
    return { success: false, error: 'Invalid search query' };
  }

  const search = parsedResult.data;

  const result = await searchFileSystem(rootDirectory, search.searchTerm, {
    maxResults: search.maxResults,
    includeFiles: search.includeFiles,
    includeDirs: search.includeDirs,
    caseSensitive: search.caseSensitive,
  });

  const resultWithSelected = result.map((node) => {
    return {
      ...node,
      selected: selectedPaths.has(node.path),
    };
  });

  return { success: true, result: resultWithSelected };
});

ipcMain.handle('stream:content', async (event, arg) => {
  if (!mainWindow) {
    return null;
  }

  const parsedResult = FileNodeSchema.safeParse(arg);
  if (!parsedResult.success) {
    return null;
  }

  const fileNode = parsedResult.data;

  // Use fileContentService to update content
  if (fileContentService) {
    fileContentService.updateFileContents(fileNode);
  }

  return null;
});

ipcMain.handle('appSettings:read', async () => {
  if (!mainWindow) {
    return null;
  }
  return readAppSettings();
});

ipcMain.handle('appSettings:update', async (event, settings) => {
  console.log('Updating app settings:', settings);
  try {
    // Write the settings to JSON (or however writeAppSettings is implemented)
    await writeAppSettings(settings);
    // Optionally, you could return some confirmation data
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update app settings:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:get-directory-structure', (event, arg) => {
  if (!mainWindow) {
    return null;
  }
  console.log('attempting to get-directory-structure');
  const parsedResult = FileNodeSchema.safeParse(arg);
  if (!parsedResult.success) {
    return '';
  }
  const fileNode = parsedResult.data;
  return generateDirectoryStructure(fileNode);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // Initialize services
  fileContentService = createFileContentService(mainWindow);
  fileWatcherService = createFileWatcherService(mainWindow, fileContentService);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
