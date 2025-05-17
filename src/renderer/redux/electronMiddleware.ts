import { Dispatch, Middleware, UnknownAction } from 'redux';
import { ipcChannels } from '@/src/shared/ipcChannels';

import { RootState } from './rootReducer';
import {
  setSearchResults,
  setIsSearching,
  setLastSearchQuery,
} from './slices/filesSlice';

// This middleware intercepts actions that need to communicate with Electron
// Renderer => Main
const electronMiddleware: Middleware<{}, RootState, Dispatch<UnknownAction>> =
  (store) => (next) => (action) => {
    // First, pass the action through to the reducer
    const result = next(action);

    const unknownAction = action as UnknownAction;

    // Then handle any side effects
    // Action types can be identified {sliceName}/{actionName}
    switch (unknownAction.type) {
      case /^app\/(set|add|remove|update|replace|toggle)/.test(
        unknownAction.type,
      )
        ? unknownAction.type
        : '': {
        window.electron.ipcRenderer.updateAppSettings(store.getState().app);
        break;
      }

      case 'workspace/openDirectory': {
        window.electron.ipcRenderer.sendMessage(
          ipcChannels.DIALOG_OPEN_DIRECTORY,
        );
        break;
      }

      case 'files/resetSelection': {
        // Clear file contents when selection is reset
        store.dispatch({ type: 'fileContents/clearFileContents' });
        break;
      }

      // New handler for search action
      case 'search/searchFiles': {
        const query = (unknownAction as any).payload;

        if (query && query.searchTerm) {
          store.dispatch(setLastSearchQuery(query));
          store.dispatch(setIsSearching(true));

          // Use IIFE to suppress 'unused promise' warnings
          (async () => {
            try {
              const response =
                await window.electron.ipcRenderer.searchFiles(query);
              if (response.success && response.result) {
                store.dispatch(setSearchResults(response.result));
              } else {
                console.error('Search failed:', response.error);
                store.dispatch(setSearchResults([]));
              }
            } catch (err) {
              console.error('Search error:', err);
              store.dispatch(setSearchResults([]));
            } finally {
              store.dispatch(setIsSearching(false));
            }
          })();
        }
        break;
      }

      default: {
        break;
      }
    }

    return result;
  };

// Helper function to re-run the last search if there's an active one
const maybeRerunSearch = (store: any) => {
  const { files } = store.getState();
  const { lastSearchQuery, searchResults } = files;

  // If we have a previous search query and there are search results,
  // re-run the search to update the results
  if (lastSearchQuery && searchResults.length > 0) {
    store.dispatch({ type: 'search/searchFiles', payload: lastSearchQuery });
  }
};

// Set up listeners for IPC events from Electron
// Listens and dispatches actions to the store
// Actions types are {sliceName}/{actionName}
// Main => Renderer
export const setupElectronListeners = (store: any) => {
  // Workspace events
  window.electron.ipcRenderer.on(
    ipcChannels.WORKSPACE_PATH_SET,
    (path: unknown) => {
      store.dispatch({ type: 'workspace/setWorkingDir', payload: path });
    },
  );

  // File node events
  window.electron.ipcRenderer.on(
    ipcChannels.WORKSPACE_FILENODE_SET,
    (fileNode: unknown) => {
      store.dispatch({
        type: 'workspace/setWorkingFileNode',
        payload: fileNode,
      });
      store.dispatch({ type: 'files/setFileNode', payload: fileNode });

      // Reset search results when workspace changes
      store.dispatch(setLastSearchQuery(null));
      store.dispatch(setSearchResults([]));
    },
  );

  // Directory events
  window.electron.ipcRenderer.on(
    ipcChannels.FILE_NODE_UPDATE,
    (updatedNode: unknown) => {
      store.dispatch({ type: 'files/updateFileNode', payload: updatedNode });

      // Re-run search if we have an active search
      maybeRerunSearch(store);
    },
  );

  window.electron.ipcRenderer.on(
    ipcChannels.FILE_NODE_SELECTION_CHANGED,
    (changes: unknown) => {
      store.dispatch({
        type: 'files/toggleFileNodeSelection',
        payload: changes,
      });
    },
  );

  // File content events
  window.electron.ipcRenderer.on(ipcChannels.FILE_CONTENTS_CLEAR, () => {
    store.dispatch({ type: 'fileContents/clearFileContents' });
  });

  window.electron.ipcRenderer.on(ipcChannels.WORKSPACE_FILENODE_DELETE, () => {
    throw new Error('Not implemented');
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

  // Notification listener
  window.electron.ipcRenderer.on(
    ipcChannels.NOTIFICATION_SEND,
    (notification: unknown) => {
      store.dispatch({
        type: 'notifications/showNotification',
        payload: notification,
      });
    },
  );
};

export default electronMiddleware;
