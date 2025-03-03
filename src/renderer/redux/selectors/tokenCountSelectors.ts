// File: src/renderer/redux/selectors/tokenCountSelectors.ts
import { RootState } from '../store';

// eslint-disable-next-line import/prefer-default-export
export const selectTokenCount = (state: RootState) => state.tokenCount.count;
