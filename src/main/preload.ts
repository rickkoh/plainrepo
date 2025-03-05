// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { FileNode } from '../types/FileNode';
import { AppSettings } from '../types/AppSettings';
import { IPCChannel } from '../shared/ipcChannels';

export type Channels =
  | 'ipc-example'
  | 'dialog:openDirectory'
  | 'workspace:path'
  | 'workspace:fileNode'
  | 'stream:content'
  | 'stream:tokenCount'
  | 'stream:directoryTree'
  | 'content:stream'
  | IPCChannel;

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    off(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.removeListener(channel, func);
    },
    readAppSettings: () => ipcRenderer.invoke('appSettings:read'),
    updateAppSettings: (
      settings: AppSettings,
    ): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('appSettings:update', settings),
    streamContent: (fileNode: FileNode) =>
      ipcRenderer.invoke('stream:content', fileNode),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
