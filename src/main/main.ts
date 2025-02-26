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
import { z } from 'zod';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  buildFileNode,
  flattenFileNode,
  generateDirectoryStructure,
  syncFileNode,
} from './utils/FileBuilder';
import getContent from './utils/ContentAggregator';
import { FileNodeSchema } from '../types/FileNode';
import TokenEstimator from './utils/TokenEstimator';
import { readAppSettings, writeAppSettings } from './utils/AppSettings';
import { loadWorkspace, saveWorkspace } from './utils/AppData';
import { TabDataArraySchema } from '../types/TabData';

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
  console.log('Setting root dir');
  const start = Date.now();
  const directoryTree = buildFileNode(arg);
  const timeTaken = Date.now() - start;
  console.log('Time taken:', timeTaken);
  event.reply('root-dir-set', directoryTree);
});

ipcMain.on('set-app-settings', async (event, arg) => {
  console.log('attempting to write-user-data', arg);
  writeAppSettings(arg);
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

  // Convert fileNode to to flat array
  // Only those that are selected and is a file
  // Process them in chunks
  // For each chunk, process the fileNode and send an update to the renderer
  // The renderer will receive the update and update the ui
  // The update needs to be known how to be read by the renderer
  // The main process will send the update to the renderer
  // The renderer will be responsible for triggering the update, and updating the ui

  // Convert tokenEstimator to use streams
  // Update will just be increase, decrease, operations

  // Convert content to use streams

  ipcMain.handle('token:estimate', async (event, arg) => {
    if (!mainWindow) {
      return null;
    }
    const parsedResult = FileNodeSchema.safeParse(arg);

    if (!parsedResult.success) {
      return '';
    }

    const fileNode = parsedResult.data;
    const flattenedFileNodes = flattenFileNode(fileNode);

    let count = 0;

    TokenEstimator.streamEstimateTokens(
      flattenedFileNodes,
      (tokens: number) => {
        count += tokens;
        if (!mainWindow) {
          return;
        }
        mainWindow.webContents.send('stream:token:estimate', count);
      },
      { size: 100 },
    );

    return null;
  });

  ipcMain.handle('dialog:openDirectory', async () => {
    if (!mainWindow) {
      return null;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (!canceled) {
      return filePaths[0];
    }
    return null;
  });

  ipcMain.handle('userData:read', async () => {
    if (!mainWindow) {
      return null;
    }
    return readAppSettings();
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

  ipcMain.handle('file:get-content', async (event, arg) => {
    if (!mainWindow) {
      return null;
    }
    console.log('attempting to get-content');
    const parsedResult = FileNodeSchema.safeParse(arg);
    if (!parsedResult.success) {
      return '';
    }
    const fileNode = parsedResult.data;
    return getContent(fileNode);
  });

  ipcMain.handle('file:get-token-count', async (event, arg) => {
    if (!mainWindow) {
      return null;
    }
    console.log('attempting to get-token-count');
    const parsedResult = z.string().safeParse(arg);
    if (!parsedResult.success) {
      return '';
    }
    const str = parsedResult.data;
    const tokenCount = TokenEstimator.estimateTokens(str);
    return tokenCount;
  });

  ipcMain.handle('file:sync', async (event, arg) => {
    if (!mainWindow) {
      return null;
    }
    console.log('attempting to sync-file-node');

    const parsedResult = FileNodeSchema.safeParse(arg);
    if (!parsedResult.success) {
      return '';
    }

    let fileNode = parsedResult.data;

    fileNode = syncFileNode(fileNode);

    return fileNode;
  });

  ipcMain.handle('workspace:save', async (event, arg1, arg2) => {
    if (!mainWindow) {
      return null;
    }
    console.log('attempting to save workspace');
    const parsedArg1 = z.string().parse(arg1);
    const parsedArg2 = TabDataArraySchema.parse(arg2);

    saveWorkspace(parsedArg1, parsedArg2);

    return null;
  });

  ipcMain.handle('workspace:load', async (event, arg) => {
    if (!mainWindow) {
      return null;
    }
    console.log('attempting to load workspace');
    const parsedArg = z.string().parse(arg);
    const tabData = loadWorkspace(parsedArg);
    return tabData;
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
