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
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { z } from 'zod';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildFileNode,
  buildFileNode1,
  generateFileTree,
} from './utils/DirectoryTree';
import getContent from './utils/ContentAggregator';
import { FileNodeSchema } from '../types/FileNode';
import TokenEstimator from './utils/TokenEstimator';

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

// TODO: Rename the event to something more meaningful
ipcMain.on('set-root-dir', async (event, arg) => {
  // We will just do the brute force method first
  console.log('Setting root dir');
  // Start measuring time
  const start = Date.now();
  // Call the function
  const directoryTree = buildFileNode1(arg);
  // End measuring time
  const timeTaken = Date.now() - start;
  console.log('Time taken:', timeTaken);
  console.log('returning directoryTree', directoryTree);
  event.reply('root-dir-set', directoryTree);
});

ipcMain.on('get-content', async (event, arg) => {
  console.log('attempting to get-content');
  const parsedResult = FileNodeSchema.safeParse(arg);
  if (!parsedResult.success) {
    event.reply('get-content', 'Failed to parse file node');
    return;
  }
  const fileNode = parsedResult.data;
  let content = '';
  content += `${generateFileTree(fileNode)}\n`;
  content += getContent(fileNode);
  event.reply('get-content', content);
});

ipcMain.on('get-token-count', async (event, arg) => {
  console.log('attempting to get-token-count');
  const parsedResult = z.string().safeParse(arg);
  if (!parsedResult.success) {
    event.reply('get-token-count', 'Failed to parse content');
    return;
  }

  const content = parsedResult.data;

  const tokenCount = TokenEstimator.estimateTokens(content);

  event.reply('get-token-count', tokenCount);
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
