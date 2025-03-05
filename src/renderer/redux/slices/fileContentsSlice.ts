import { FileContent } from '@/src/types/FileContent';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileContentsState {
  byId: Record<string, string>;
  allIds: string[];
  fileContents: FileContent[];
}

const initialState: FileContentsState = {
  byId: {},
  allIds: [],
  fileContents: [],
};

const fileContentsSlice = createSlice({
  name: 'fileContents',
  initialState,
  reducers: {
    setFileContents(state, action: PayloadAction<FileContent[]>) {
      state.byId = action.payload.reduce(
        (acc, file) => {
          acc[file.path] = file.content;
          return acc;
        },
        {} as Record<string, string>,
      );

      state.allIds = action.payload.map((file) => file.path);
    },
    clearFileContents(state) {
      state.byId = {};
      state.allIds = [];
      state.fileContents = [];
    },
    addFileContents(state, action: PayloadAction<FileContent[]>) {
      // Helper function to sort files by path
      const sortFilesByPath = (files: FileContent[]): FileContent[] => {
        return [...files].sort((a, b) => a.path.localeCompare(b.path));
      };

      // Helper function to add files efficiently using a Map for O(1) lookup
      const addFilesToState = (
        currentFiles: FileContent[],
        newFiles: FileContent[],
      ): FileContent[] => {
        const filesMap = new Map<string, FileContent>();

        // Add existing files to map
        for (let i = 0; i < currentFiles.length; i += 1) {
          filesMap.set(currentFiles[i].path, currentFiles[i]);
        }

        // Add or update with new files
        for (let i = 0; i < newFiles.length; i += 1) {
          filesMap.set(newFiles[i].path, newFiles[i]);
        }

        // Convert map back to array and sort
        return sortFilesByPath(Array.from(filesMap.values()));
      };

      state.fileContents = addFilesToState(state.fileContents, action.payload);
    },
  },
});

export const { setFileContents, clearFileContents, addFileContents } =
  fileContentsSlice.actions;

const fileContentsReducer = fileContentsSlice.reducer;

export default fileContentsReducer;
