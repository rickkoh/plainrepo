import { RootState } from '../rootReducer';

export const selectFileNode = (state: RootState) => state.files.fileNode;
export const selectDirectoryTree = (state: RootState) =>
  state.files.directoryTree;
export const selectSearchResults = (state: RootState) =>
  state.files.searchResults;
export const selectIsSearching = (state: RootState) => state.files.isSearching;
