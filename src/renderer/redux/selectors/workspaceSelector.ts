// File: src/renderer/redux/selectors/workspaceSelectors.ts
import { RootState } from '../store';

export const selectWorkingDir = (state: RootState) =>
  state.workspace.workingDir;
export const selectWorkingDirName = (state: RootState) =>
  state.workspace.workingDirName;
export const selectFileNode = (state: RootState) => state.workspace.fileNode;
export const selectFilterName = (state: RootState) =>
  state.workspace.filterName;
