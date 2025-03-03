// File: src/renderer/redux/selectors/filesSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectFilesById = (state: RootState) => state.files.byId;
export const selectFileIds = (state: RootState) => state.files.allIds;

export const selectAllFiles = createSelector(
  [selectFilesById, selectFileIds],
  (byId, allIds) => allIds.map((id) => byId[id]),
);

export const selectFileByPath = (path: string) =>
  createSelector([selectFilesById], (byId) => byId[path] || null);

export const selectSelectedFiles = createSelector([selectAllFiles], (files) =>
  files.filter((file) => file.selected),
);

export const selectSelectedFilePaths = createSelector(
  [selectSelectedFiles],
  (selectedFiles) => selectedFiles.map((file) => file.path),
);

export const selectDirectoryFiles = (directoryPath: string) =>
  createSelector([selectAllFiles], (files) =>
    files.filter(
      (file) =>
        file.path.startsWith(directoryPath) && file.path !== directoryPath,
    ),
  );
