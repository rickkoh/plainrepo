// File: src/renderer/redux/selectors/directoryTreeSelectors.ts
import { RootState } from '../store';

// eslint-disable-next-line import/prefer-default-export
export const selectDirectoryTree = (state: RootState) =>
  state.directoryTree.treeString;
