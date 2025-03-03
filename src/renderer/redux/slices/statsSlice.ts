// File: src/renderer/redux/slices/statsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StatsState {
  totalFileSize: number;
  totalSelectedFiles: number;
  totalFiles: number;
  largestFile: {
    path: string;
    size: number;
  } | null;
}

const initialState: StatsState = {
  totalFileSize: 0,
  totalSelectedFiles: 0,
  totalFiles: 0,
  largestFile: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setStats(state, action: PayloadAction<Partial<StatsState>>) {
      return { ...state, ...action.payload };
    },
    resetStats() {
      return initialState;
    },
  },
});

export const { setStats, resetStats } = statsSlice.actions;

export default statsSlice.reducer;
