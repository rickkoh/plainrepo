import { RootState } from '../rootReducer';

export const selectFileNode = (state: RootState) => state.files.fileNode;
export const selectDirectoryTree = (state: RootState) =>
  state.files.directoryTree;
