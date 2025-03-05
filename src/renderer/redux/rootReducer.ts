// File: src/renderer/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';

// eslint-disable-next-line import/prefer-default-export
export const rootReducer = combineReducers({
  app: appReducer,
  // workspace: workspaceReducer,
  // files: filesReducer,
  // fileContents: fileContentsReducer,
  // directoryTree: directoryTreeReducer,
  // tokenCount: tokenCountReducer,
  // tabs: tabsReducer,
  // stats: statsReducer,
});
