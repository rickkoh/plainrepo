import { RootState } from '../rootReducer';

export const selectFileContents = (state: RootState) =>
  state.fileContents.fileContents;

export const selectFileContentByPath = (state: RootState, path: string) =>
  state.fileContents.byId[path];
