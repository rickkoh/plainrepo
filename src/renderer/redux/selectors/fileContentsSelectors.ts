// File: src/renderer/redux/selectors/fileContentsSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { selectSelectedFilePaths } from './filesSelectors';

export const selectFileContentsById = (state: RootState) =>
  state.fileContents.byId;
export const selectFileContentIds = (state: RootState) =>
  state.fileContents.allIds;

export const selectAllFileContents = createSelector(
  [selectFileContentsById, selectFileContentIds],
  (byId, allIds) => allIds.map((id) => byId[id]),
);

export const selectFileContentByPath = (path: string) =>
  createSelector([selectFileContentsById], (byId) => byId[path] || null);

export const selectSelectedFileContents = createSelector(
  [selectFileContentsById, selectSelectedFilePaths],
  (byId, selectedPaths) =>
    selectedPaths.filter((path) => byId[path]).map((path) => byId[path]),
);
