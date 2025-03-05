import { Dispatch, Middleware, UnknownAction } from 'redux';
import { AppSettings } from '@/src/types/AppSettings';
import { FileNode } from '@/src/types/FileNode';
import { ipcChannels } from '@/src/shared/ipcChannels';

import { RootState } from './rootReducer';

// This middleware intercepts actions that need to communicate with Electron
const electronMiddleware: Middleware<{}, RootState, Dispatch<UnknownAction>> =
  (store) => (next) => (action) => {
    // First, pass the action through to the reducer
    const result = next(action);

    const unknownAction = action as UnknownAction;

    // Then handle any side effects
    switch (unknownAction.type) {
      case 'app/triggerUpdateSettings': {
        window.electron.ipcRenderer.updateAppSettings(
          unknownAction.payload as AppSettings,
        );
        break;
      }

      case /app\/set/.test(unknownAction.type) ? unknownAction.type : '': {
        window.electron.ipcRenderer.updateAppSettings(store.getState().app);
        break;
      }

      case 'workspace/openDirectory': {
        window.electron.ipcRenderer.sendMessage(
          ipcChannels.DIALOG_OPEN_DIRECTORY,
        );
        break;
      }

      case 'files/setFileNode': {
        window.electron.ipcRenderer.streamContent(
          unknownAction.payload as FileNode,
        );
        break;
      }

      case 'files/toggleFileNodeSelection': {
        if (store.getState().files.fileNode) {
          window.electron.ipcRenderer.streamContent(
            store.getState().files.fileNode!,
          );
        }
        break;
      }

      default: {
        break;
      }
    }

    return result;
  };

// Set up listeners for IPC events from Electron
export const setupElectronListeners = (store: any) => {
  // Workspace events
  window.electron.ipcRenderer.on(
    ipcChannels.WORKSPACE_PATH_SET,
    (path: unknown) => {
      store.dispatch({ type: 'workspace/setWorkingDir', payload: path });
    },
  );

  window.electron.ipcRenderer.on(
    ipcChannels.WORKSPACE_FILENODE_SET,
    (fileNode: unknown) => {
      store.dispatch({
        type: 'workspace/setWorkingFileNode',
        payload: fileNode,
      });
      store.dispatch({ type: 'files/setFileNode', payload: fileNode });
    },
  );

  window.electron.ipcRenderer.on(ipcChannels.FILE_CONTENTS_CLEAR, () => {
    store.dispatch({ type: 'fileContents/clearFileContents' });
  });

  window.electron.ipcRenderer.on(
    ipcChannels.FILE_CONTENTS_ADD,
    (fileContents: unknown) => {
      store.dispatch({
        type: 'fileContents/addFileContents',
        payload: fileContents,
      });
    },
  );

  window.electron.ipcRenderer.on(
    ipcChannels.DIRECTORY_TREE_SET,
    (treeStructure: unknown) => {
      store.dispatch({
        type: 'files/setDirectoryTree',
        payload: treeStructure,
      });
    },
  );

  window.electron.ipcRenderer.on(
    ipcChannels.TOKEN_COUNT_SET,
    (count: unknown) => {
      store.dispatch({
        type: 'stats/setTokenCount',
        payload: count,
      });
    },
  );
};

export default electronMiddleware;
