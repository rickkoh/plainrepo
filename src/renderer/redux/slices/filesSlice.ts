import { FileNode } from '@/src/types/FileNode';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  toggleFlatFileNodeSelection,
  toggleFileNodeSelection as toggleNodeSelection,
} from '@/src/shared/utils/FileNodeUtils';

interface FileState {
  byId: Record<string, string>;
  allIds: string[];
  fileNode?: FileNode;
  directoryTree?: string;
  searchResults: FileNode[];
  isSearching: boolean;
  lastSearchQuery: { searchTerm: string; [key: string]: any } | null;
}

const initialState: FileState = {
  byId: {},
  allIds: [],
  fileNode: undefined,
  directoryTree: undefined,
  searchResults: [],
  isSearching: false,
  lastSearchQuery: null,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFileNode(state, action: PayloadAction<FileNode>) {
      state.fileNode = action.payload;
    },
    updateFileNode(
      state,
      action: PayloadAction<{ path: string; fileNode: FileNode }>,
    ) {
      const { path, fileNode } = action.payload;

      if (!state.fileNode) return;

      const findAndUpdateNode = (root: FileNode): boolean => {
        const stack: FileNode[] = [root];

        while (stack.length > 0) {
          const currentNode = stack.pop();
          if (currentNode) {
            if (currentNode.path === path) {
              Object.assign(currentNode, fileNode);
              return true;
            }

            if (currentNode.children && currentNode.children.length > 0) {
              for (let i = 0; i < currentNode.children.length; i += 1) {
                const reverseIndex = currentNode.children.length - 1 - i;
                stack.push(currentNode.children[reverseIndex]);
              }
            }
          }
        }

        return false;
      };

      findAndUpdateNode(state.fileNode);
    },
    toggleFileNodeSelection(
      state,
      action: PayloadAction<{ path: string; selected: boolean }>,
    ) {
      const { path, selected } = action.payload;

      if (!state.fileNode) return;

      toggleNodeSelection(state.fileNode, path, selected);
      toggleFlatFileNodeSelection(state.searchResults, path, selected);
    },
    resetSelection(state) {
      if (!state.fileNode) {
        return;
      }

      toggleNodeSelection(state.fileNode, state.fileNode.path, false);
    },
    setDirectoryTree(state, action: PayloadAction<string>) {
      state.directoryTree = action.payload;
    },
    setSearchResults(state, action: PayloadAction<FileNode[]>) {
      state.searchResults = action.payload;
    },
    setIsSearching(state, action: PayloadAction<boolean>) {
      state.isSearching = action.payload;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    setLastSearchQuery(
      state,
      action: PayloadAction<{ searchTerm: string; [key: string]: any } | null>,
    ) {
      state.lastSearchQuery = action.payload;
    },
  },
});

export const {
  setFileNode,
  updateFileNode,
  toggleFileNodeSelection,
  resetSelection,
  setDirectoryTree,
  setSearchResults,
  setIsSearching,
  clearSearchResults,
  setLastSearchQuery,
} = fileSlice.actions;

const filesReducer = fileSlice.reducer;

export default filesReducer;
