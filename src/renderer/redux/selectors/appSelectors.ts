import {
  AppSettings,
  CopyLimit,
  ExcludeList,
  ReplaceList,
} from '@/src/types/AppSettings';
import { RootState } from '../rootReducer';

export const selectDarkMode = (state: RootState): boolean => state.app.darkMode;
export const selectShouldIncludeGitIgnore = (state: RootState) =>
  state.app.shouldIncludeGitIgnore;
export const selectCopyLimit = (state: RootState): CopyLimit =>
  state.app.copyLimit;
export const selectExclude = (state: RootState): ExcludeList =>
  state.app.exclude;
export const selectReplace = (state: RootState): ReplaceList =>
  state.app.replace;
export const selectAppSettings = (state: RootState): AppSettings => ({
  darkMode: state.app.darkMode,
  shouldIncludeGitIgnore: state.app.shouldIncludeGitIgnore,
  copyLimit: state.app.copyLimit,
  exclude: state.app.exclude,
  replace: state.app.replace,
});
