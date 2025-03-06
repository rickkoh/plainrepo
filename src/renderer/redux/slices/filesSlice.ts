import { FileNode } from '@/src/types/FileNode';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileState {
  byId: Record<string, string>;
  allIds: string[];
  fileNode?: FileNode;
  directoryTree?: string;
}

const initialState: FileState = {
  byId: {},
  allIds: [],
  fileNode: undefined,
  directoryTree: undefined,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFileNode(state, action: PayloadAction<FileNode>) {
      // Might need to have a middleware here to calling streaming of the content
      state.fileNode = action.payload;
    },
    toggleFileNodeSelection(
      state,
      action: PayloadAction<{ path: string; selected: boolean }>,
    ) {
      const { path, selected } = action.payload;

      if (!state.fileNode) return;

      const toggleChildrenSelection = (node: FileNode, isSelected: boolean) => {
        if (!node.children) return;

        for (let i = 0; i < node.children.length; i += 1) {
          const child = node.children[i];
          child.selected = isSelected;

          if (child.type === 'directory' && child.children) {
            toggleChildrenSelection(child, isSelected);
          }
        }
      };

      const findAndToggle = (node: FileNode): boolean => {
        if (node.path === path) {
          node.selected = selected;

          if (node.type === 'directory' && node.children) {
            toggleChildrenSelection(node, selected);
          }

          return true;
        }

        if (node.type === 'directory' && node.children) {
          for (let i = 0; i < node.children.length; i += 1) {
            if (findAndToggle(node.children[i])) {
              node.selected = node.children.some((child) => child.selected);
              return true;
            }
          }
        }

        return false;
      };

      findAndToggle(state.fileNode);
    },
    resetSelection(state) {
      if (!state.fileNode) {
        return;
      }

      const payload = { path: state.fileNode.path, selected: false };
      fileSlice.caseReducers.toggleFileNodeSelection(state, {
        type: 'files/toggleFileNodeSelection',
        payload,
      });
    },
    setDirectoryTree(state, action: PayloadAction<string>) {
      state.directoryTree = action.payload;
    },
  },
});

export const {
  setFileNode,
  toggleFileNodeSelection,
  resetSelection,
  setDirectoryTree,
} = fileSlice.actions;

const filesReducer = fileSlice.reducer;

export default filesReducer;
