import { RootState } from '../rootReducer';

export const selectTokenCount = (state: RootState) => state.stats.tokenCount;
export const selectFileSize = (state: RootState) => state.stats.fileSize;
export const selectFileCount = (state: RootState) => state.stats.fileCount;
