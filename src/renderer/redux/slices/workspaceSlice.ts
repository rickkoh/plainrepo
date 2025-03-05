import { FileNode } from '@/src/types/FileNode';
import { createSlice } from '@reduxjs/toolkit';

interface WorkspaceState {
  workingDir?: string;
  workingDirName?: string;
  fileNode?: FileNode;
  filterName?: string;
}

const initialState: WorkspaceState = {
  workingDir: undefined,
  workingDirName: undefined,
  fileNode: undefined,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkingDir(state, action) {
      state.workingDir = action.payload;
    },
    setWorkingDirName(state, action) {
      state.workingDirName = action.payload;
    },
    setWorkingFileNode(state, action) {
      state.fileNode = action.payload;
    },
  },
});

export const {
  setWorkingDir,
  setWorkingDirName,
  setWorkingFileNode: setFileNode,
} = workspaceSlice.actions;

const workspaceReducer = workspaceSlice.reducer;

export default workspaceReducer;
