import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StatsState {
  tokenCount: number;
  fileSize?: number;
  fileCount?: number;
}

const initialState: StatsState = {
  tokenCount: 0,
  fileSize: 0,
  fileCount: 0,
};

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setTokenCount(state, action: PayloadAction<number>) {
      state.tokenCount = action.payload;
    },
    resetTokenCount(state) {
      state.tokenCount = 0;
    },
    setFileSize(state, action: PayloadAction<number>) {
      state.fileSize = action.payload;
    },
    setFileCount(state, action: PayloadAction<number>) {
      state.fileCount = action.payload;
    },
    // setStats(state, action) {
    //   state.stats = action.payload;
    // },
  },
});

export const { setTokenCount } = statsSlice.actions;

const statsReducer = statsSlice.reducer;

export default statsReducer;
