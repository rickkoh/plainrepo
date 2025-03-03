// File: src/renderer/redux/slices/tabsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface TabState {
  id: string;
  name: string;
  selectedFilePaths: string[];
}

interface TabsState {
  byId: Record<string, TabState>;
  allIds: string[];
  activeTabId: string | null;
}

const initialState: TabsState = {
  byId: {},
  allIds: [],
  activeTabId: null,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    createTab(state, action: PayloadAction<string | undefined>) {
      const id = uuidv4();
      const name = action.payload || `Tab ${state.allIds.length + 1}`;

      state.byId[id] = {
        id,
        name,
        selectedFilePaths: [],
      };

      state.allIds.push(id);

      // If this is the first tab, make it active
      if (state.allIds.length === 1) {
        state.activeTabId = id;
      }
    },
    closeTab(state, action: PayloadAction<string>) {
      const id = action.payload;
      const index = state.allIds.indexOf(id);

      // Remove the tab
      delete state.byId[id];
      state.allIds.splice(index, 1);

      // If the active tab was closed, activate another tab
      if (state.activeTabId === id) {
        // Activate the tab to the left, or the first tab if none to the left
        const newIndex = Math.max(0, index - 1);
        state.activeTabId =
          state.allIds.length > 0 ? state.allIds[newIndex] : null;
      }
    },
    activateTab(state, action: PayloadAction<string>) {
      if (state.byId[action.payload]) {
        state.activeTabId = action.payload;
      }
    },
    renameTab(state, action: PayloadAction<{ id: string; name: string }>) {
      const { id, name } = action.payload;
      if (state.byId[id]) {
        state.byId[id].name = name;
      }
    },
    selectFilesInTab(
      state,
      action: PayloadAction<{ tabId: string; filePaths: string[] }>,
    ) {
      const { tabId, filePaths } = action.payload;
      if (state.byId[tabId]) {
        state.byId[tabId].selectedFilePaths = filePaths;
      }
    },
    toggleFileSelectionInTab(
      state,
      action: PayloadAction<{ tabId: string; filePath: string }>,
    ) {
      const { tabId, filePath } = action.payload;
      if (state.byId[tabId]) {
        const tab = state.byId[tabId];
        const index = tab.selectedFilePaths.indexOf(filePath);

        if (index >= 0) {
          // Remove file if it's already selected
          tab.selectedFilePaths.splice(index, 1);
        } else {
          // Add file if it's not selected
          tab.selectedFilePaths.push(filePath);
        }
      }
    },
  },
});

export const {
  createTab,
  closeTab,
  activateTab,
  renameTab,
  selectFilesInTab,
  toggleFileSelectionInTab,
} = tabsSlice.actions;

const tabsReducer = tabsSlice.reducer;

export default tabsReducer;
