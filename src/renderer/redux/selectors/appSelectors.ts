import { RootState } from '../rootReducer';

export const selectDarkMode = (state: RootState) => state.app.darkMode;
export const selectShouldIncludeGitIgnore = (state: RootState) =>
  state.app.shouldIncludeGitIgnore;
export const selectCopyLimit = (state: RootState) => state.app.copyLimit;
export const selectExclude = (state: RootState) => state.app.exclude;
export const selectReplace = (state: RootState) => state.app.replace;
export const selectChunkSize = (state: RootState) => state.app.chunkSize;
export const selectMaxFileSize = (state: RootState) => state.app.maxFileSize;
export const selectAppSettings = (state: RootState) => state.app;
