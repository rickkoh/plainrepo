// // File: src/renderer/redux/selectors/statsSelectors.ts
// import { createSelector } from '@reduxjs/toolkit';
// import { RootState } from '../store';
// import { selectSelectedFiles } from './filesSelectors';
// import { selectActiveTabSelectedFilePaths } from './tabsSelectors';
// import { selectFileContentsById } from './fileContentsSelectors';

// export const selectTotalFileSize = (state: RootState) =>
//   state.stats.totalFileSize;
// export const selectTotalSelectedFiles = (state: RootState) =>
//   state.stats.totalSelectedFiles;
// export const selectTotalFiles = (state: RootState) => state.stats.totalFiles;
// export const selectLargestFile = (state: RootState) => state.stats.largestFile;

// // Calculate total size of selected files in the active tab
// export const selectActiveTabTotalSize = createSelector(
//   [selectActiveTabSelectedFilePaths, selectFilesById],
//   (selectedPaths, filesById) => {
//     let totalSize = 0;
//     // eslint-disable-next-line no-restricted-syntax
//     for (const path of selectedPaths) {
//       const file = filesById[path];
//       if (file && file.size) {
//         totalSize += file.size;
//       }
//     }
//     return totalSize;
//   },
// );

// // Calculate selection statistics
// export const selectSelectionStats = createSelector(
//   [selectSelectedFiles, selectFileContentsById],
//   (selectedFiles, fileContentsById) => {
//     let totalSize = 0;
//     let largestFile = null;
//     let largestSize = 0;

//     for (const file of selectedFiles) {
//       if (file.type === 'file' && file.size) {
//         totalSize += file.size;

//         if (file.size > largestSize) {
//           largestSize = file.size;
//           largestFile = file;
//         }
//       }
//     }

//     return {
//       totalSelectedFiles: selectedFiles.length,
//       totalSize,
//       largestFile: largestFile
//         ? {
//             path: largestFile.path,
//             size: largestFile.size || 0,
//           }
//         : null,
//     };
//   },
// );
