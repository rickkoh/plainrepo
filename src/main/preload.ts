// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { FileNode } from '../types/FileNode';
import { TabDataArray } from '../types/TabData';

export type Channels =
  | 'ipc-example'
  | 'set-root-dir'
  | 'root-dir-set'
  | 'get-content'
  | 'get-token-count'
  | 'set-app-settings';

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
    readUserData: () => ipcRenderer.invoke('userData:read'),
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    getContent: (fileNode: FileNode): Promise<string> =>
      ipcRenderer.invoke('file:get-content', fileNode),
    getTokenCount: (string: string): Promise<string> =>
      ipcRenderer.invoke('file:get-token-count', string),
    saveWorkspace: (p: string, tabData: TabDataArray): Promise<void> =>
      ipcRenderer.invoke('workspace:save', p, tabData),
    loadWorkspace: (p: string): Promise<TabDataArray> =>
      ipcRenderer.invoke('workspace:load', p),
    updateAppSettings: (
      settings: unknown,
    ): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('appSettings:update', settings),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
