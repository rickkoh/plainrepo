import { FileNode } from '@/src/types/FileNode';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toggleFileNodeSelection as toggleNodeSelection } from '@/src/shared/utils/FileNodeUtils';

interface FileState {
  byId: Record<string, string>;
  allIds: string[];
  fileNode?: FileNode;
  directoryTree?: string;
  searchResults: FileNode[];
  isSearching: boolean;
}

const initialState: FileState = {
  byId: {},
  allIds: [],
  fileNode: undefined,
  directoryTree: undefined,
  searchResults: [],
  isSearching: false,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFileNode(state, action: PayloadAction<FileNode>) {
      // Might need to have a middleware here to calling streaming of the content
      state.fileNode = action.payload;
      // The idea is that once we open up the directory, the filenode (only the root) is created
      // Then the rest of the filenode we have to apppend as we discover
      // Discover == Expand || Search || Select
      // Expand -> Open only the next level of the directory
      // Search -> Expand only to the level of the searched file
      // Select -> Recursively expand all children of the selected node
    },
    updateFileNode(
      state,
      action: PayloadAction<{ path: string; fileNode: FileNode }>,
    ) {
      // Have to find the node in the fileNode tree
      // And then replaces/updates the node with the new node
      state.fileNode = action.payload.fileNode;
    },
    expandDirectory(
      state,
      action: PayloadAction<{ path: string; fileNode: FileNode }>,
    ) {
      const { path, fileNode } = action.payload;

      if (!state.fileNode) return;

      const findAndUpdateNode = (root: FileNode) => {
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
  },
});

export const {
  setFileNode,
  toggleFileNodeSelection,
  resetSelection,
  setDirectoryTree,
  setSearchResults,
  setIsSearching,
  clearSearchResults,
} = fileSlice.actions;

const filesReducer = fileSlice.reducer;

export default filesReducer;
