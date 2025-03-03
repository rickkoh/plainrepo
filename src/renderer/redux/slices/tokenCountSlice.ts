// File: src/renderer/redux/slices/tokenCountSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TokenCountState {
  count: number;
}

const initialState: TokenCountState = {
  count: 0,
};

const tokenCountSlice = createSlice({
  name: 'tokenCount',
  initialState,
  reducers: {
    setTokenCount(state, action: PayloadAction<number>) {
      state.count = action.payload;
    },
    resetTokenCount(state) {
      state.count = 0;
    },
  },
});

export const { setTokenCount, resetTokenCount } = tokenCountSlice.actions;

const tokenCountReducer = tokenCountSlice.reducer;

export default tokenCountReducer;
