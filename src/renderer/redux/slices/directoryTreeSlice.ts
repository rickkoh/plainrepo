// File: src/renderer/redux/slices/directoryTreeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DirectoryTreeState {
  treeString: string;
}

const initialState: DirectoryTreeState = {
  treeString: '',
};

const directoryTreeSlice = createSlice({
  name: 'directoryTree',
  initialState,
  reducers: {
    setDirectoryTree(state, action: PayloadAction<string>) {
      state.treeString = action.payload;
    },
    clearDirectoryTree(state) {
      state.treeString = '';
    },
  },
});

export const { setDirectoryTree, clearDirectoryTree } =
  directoryTreeSlice.actions;

const directoryTreeReducer = directoryTreeSlice.reducer;

export default directoryTreeReducer;
