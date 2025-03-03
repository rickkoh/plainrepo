// File: src/renderer/redux/slices/fileContentsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileContent } from '../../../types/FileContent';

interface FileContentsState {
  byId: Record<string, FileContent>;
  allIds: string[];
}

const initialState: FileContentsState = {
  byId: {},
  allIds: [],
};

const fileContentsSlice = createSlice({
  name: 'fileContents',
  initialState,
  reducers: {
    addFileContents(state, action: PayloadAction<FileContent[]>) {
      const newContents = action.payload;

      // eslint-disable-next-line no-restricted-syntax
      for (const content of newContents) {
        // Only add to allIds if it's a new entry
        if (!state.byId[content.path]) {
          state.allIds.push(content.path);
        }
        state.byId[content.path] = content;
      }

      // Keep allIds sorted for consistent rendering
      state.allIds.sort();
    },
    clearFileContents(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { addFileContents, clearFileContents } = fileContentsSlice.actions;

const fileContentsReducer = fileContentsSlice.reducer;

export default fileContentsReducer;
