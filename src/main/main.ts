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
import chokidar from 'chokidar';

import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  buildFileNode,
  flattenFileNode,
  generateDirectoryStructure,
} from './utils/FileBuilder';
import { streamGetContent } from './utils/ContentAggregator';
import { FileNodeSchema } from '../types/FileNode';
import {
  readAppSettings,
  writeAppSettings,
  globToRegex,
} from './utils/AppSettings';
import { FileContent } from '../types/FileContent';
import TokenEstimator from './utils/TokenEstimator';
import { ipcChannels } from '../shared/ipcChannels';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('dialog:openDirectory', async () => {
  if (!mainWindow) {
    return null;
  }
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (canceled) {
    return null;
  }

  const appSettings = readAppSettings();
  const excludeList = appSettings.exclude || [];
  const ignoreFunction = globToRegex(excludeList);

  const watcher = chokidar.watch(filePaths[0], {
    depth: 1,
    ignored: ignoreFunction,
  });

  // TODO: Find out where the is the single source of truth for the file node
  // Update the file node when the file is added, changed, or deleted
  // @ts-ignore
  watcher.on('add', (path1) => {
    console.log('add', path1);
  });

  // @ts-ignore
  watcher.on('change', (path1) => {
    console.log('change', path1);
  });

  // @ts-ignore
  watcher.on('unlink', (path1) => {
    console.log('unlink', path1);
  });

  mainWindow.webContents.send('workspace:path', filePaths[0]);

  const start = Date.now();
  const directoryTree = buildFileNode(filePaths[0]);
  const timeTaken = Date.now() - start;

  console.log('Time taken:', timeTaken);
  mainWindow.webContents.send('workspace:fileNode', directoryTree);

  return null;
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
  const directoryTree = generateDirectoryStructure(fileNode);

  // Send the directory tree structure directly
  mainWindow.webContents.send(ipcChannels.DIRECTORY_TREE_SET, directoryTree);

  // Send initial token count
  let count = TokenEstimator.estimateTokens(directoryTree);
  mainWindow.webContents.send(ipcChannels.TOKEN_COUNT_SET, count);

  // Clear previous content before loading new content
  mainWindow.webContents.send(ipcChannels.FILE_CONTENTS_CLEAR);

  // Stream content in chunks
  const flattenedFileNodes = flattenFileNode(fileNode);
  streamGetContent(flattenedFileNodes, (fileContents: FileContent[]) => {
    if (!mainWindow) {
      return;
    }

    // Update token count with your preferred for loop style
    for (let i = 0; i < fileContents.length; i += 1) {
      const fileContent = fileContents[i];
      count += TokenEstimator.estimateTokens(fileContent.content);
    }

    mainWindow.webContents.send(ipcChannels.TOKEN_COUNT_SET, count);

    // Add new content
    mainWindow.webContents.send(ipcChannels.FILE_CONTENTS_ADD, fileContents);
  });

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
