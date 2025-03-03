// File: src/renderer/redux/selectors/appSelectors.ts
import { RootState } from '../store';

export const selectDarkMode = (state: RootState) => state.app.darkMode;
export const selectShouldIncludeGitIgnore = (state: RootState) =>
  state.app.shouldIncludeGitIgnore;
export const selectCopyLimit = (state: RootState) => state.app.copyLimit;
export const selectExclude = (state: RootState) => state.app.exclude;
export const selectReplace = (state: RootState) => state.app.replace;
export const selectAppSettings = (state: RootState) => ({
  darkMode: state.app.darkMode,
  shouldIncludeGitIgnore: state.app.shouldIncludeGitIgnore,
  copyLimit: state.app.copyLimit,
  exclude: state.app.exclude,
  replace: state.app.replace,
});
