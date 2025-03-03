// File: src/renderer/redux/slices/filesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileNode } from '../../../types/FileNode';

interface FilesState {
  byId: Record<string, FileNode>;
  allIds: string[];
}

const initialState: FilesState = {
  byId: {},
  allIds: [],
};

// Helper function to flatten file node structure
const flattenFileNode = (fileNode: FileNode): FileNode[] => {
  const result: FileNode[] = [fileNode];

  if (fileNode.type === 'directory' && fileNode.children) {
    // eslint-disable-next-line no-restricted-syntax
    for (const child of fileNode.children) {
      result.push(...flattenFileNode(child));
    }
  }

  return result;
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    updateFileNodes(state, action: PayloadAction<FileNode>) {
      const rootNode = action.payload;
      const flattenedNodes = flattenFileNode(rootNode);

      // Clear existing data
      state.byId = {};
      state.allIds = [];

      // Add all nodes
      // eslint-disable-next-line no-restricted-syntax
      for (const node of flattenedNodes) {
        state.byId[node.path] = node;
        state.allIds.push(node.path);
      }
    },
    updateFileSelection(
      state,
      action: PayloadAction<{ path: string; selected: boolean }>,
    ) {
      const { path, selected } = action.payload;

      if (state.byId[path]) {
        state.byId[path].selected = selected;

        // If it's a directory, apply selection to all children
        const updateChildrenSelection = (
          nodePath: string,
          isSelected: boolean,
        ) => {
          const node = state.byId[nodePath];

          if (node.type === 'directory' && node.children) {
            // eslint-disable-next-line no-restricted-syntax
            for (const child of node.children) {
              const childPath = child.path;
              if (state.byId[childPath]) {
                state.byId[childPath].selected = isSelected;
                updateChildrenSelection(childPath, isSelected);
              }
            }
          }
        };

        if (state.byId[path].type === 'directory') {
          updateChildrenSelection(path, selected);
        }
      }
    },
    clearFiles(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { updateFileNodes, updateFileSelection, clearFiles } =
  filesSlice.actions;

const filesReducer = filesSlice.reducer;

export default filesReducer;
