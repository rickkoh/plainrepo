// File: src/renderer/redux/middleware/electronMiddleware.ts
import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import { Middleware } from 'redux';

// This middleware intercepts actions that need to communicate with Electron
const electronMiddleware: Middleware =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (store) => (next) => (action: ActionCreatorWithOptionalPayload<any>) => {
    // First, pass the action through to the reducer
    const result = next(action);

    console.log('Printing action.type');
    console.log(action.type);
    console.log(action);

    // Then handle any side effects
    switch (action.type) {
      //   case 'workspace/openDirectory':
      //     window.electron.ipcRenderer.sendMessage('dialog:openDirectory');
      //     break;

      //   case 'workspace/streamContent':
      //     window.electron.ipcRenderer.streamContent(action.payload);
      //     break;

      case 'app/updateSettings':
        console.log('triggered', action.payload);
        window.electron.ipcRenderer.updateAppSettings(action.payload);
        break;

      default:
        break;
    }

    return result;
  };

// Set up listeners for IPC events from Electron
export const setupElectronListeners = (store: any) => {
  window.electron.ipcRenderer.on('workspace:path', (path: unknown) => {
    store.dispatch({ type: 'workspace/setWorkingDir', payload: path });
  });

  window.electron.ipcRenderer.on('workspace:fileNode', (fileNode: unknown) => {
    store.dispatch({ type: 'workspace/setFileNode', payload: fileNode });
    store.dispatch({ type: 'workspace/streamContent', payload: fileNode });
  });

  window.electron.ipcRenderer.on('stream:directoryTree', (action: any) => {
    if (action.type === 'SET_DIRECTORY_TREE') {
      store.dispatch({
        type: 'directoryTree/setDirectoryTree',
        payload: action.payload,
      });
    }
  });

  window.electron.ipcRenderer.on('stream:tokenCount', (action: any) => {
    if (action.type === 'SET_TOKEN_COUNT') {
      store.dispatch({
        type: 'tokenCount/setTokenCount',
        payload: action.payload,
      });
    }
  });

  window.electron.ipcRenderer.on('stream:content', (action: any) => {
    if (action.type === 'CLEAR_FILE_CONTENT') {
      store.dispatch({ type: 'fileContents/clearFileContents' });
    } else if (action.type === 'ADD_FILE_CONTENT') {
      store.dispatch({
        type: 'fileContents/addFileContents',
        payload: action.payload,
      });
    }
  });
};

export default electronMiddleware;
