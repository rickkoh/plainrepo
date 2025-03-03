// File: src/renderer/redux/slices/workspaceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileNode } from '../../../types/FileNode';

interface WorkspaceState {
  workingDir: string | null;
  workingDirName: string | null;
  fileNode: FileNode | null;
  filterName: string | null;
}

const initialState: WorkspaceState = {
  workingDir: null,
  workingDirName: null,
  fileNode: null,
  filterName: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkingDir(state, action: PayloadAction<string>) {
      state.workingDir = action.payload;
      state.workingDirName = action.payload.split('/').pop() || null;
    },
    setFileNode(state, action: PayloadAction<FileNode>) {
      state.fileNode = action.payload;
    },
    setFilterName(state, action: PayloadAction<string | null>) {
      state.filterName = action.payload;
    },
    openDirectory() {
      // This is just a marker action - actual side effect handled in middleware
    },
    streamContent() {
      // This is just a marker action - actual side effect handled in middleware
    },
  },
});

export const {
  setWorkingDir,
  setFileNode,
  setFilterName,
  openDirectory,
  streamContent,
} = workspaceSlice.actions;

const workspaceReducer = workspaceSlice.reducer;

export default workspaceReducer;
