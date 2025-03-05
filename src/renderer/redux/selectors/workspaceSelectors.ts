import { RootState } from '../rootReducer';

export const selectWorkingDir = (state: RootState) =>
  state.workspace.workingDir;
export const selectWorkingDirName = (state: RootState) =>
  state.workspace.workingDirName;
export const selectingWorkingFileNode = (state: RootState) =>
  state.workspace.fileNode;
