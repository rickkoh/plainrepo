// File: src/renderer/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import workspaceReducer from './slices/workspaceSlice';
import filesReducer from './slices/filesSlice';
import fileContentsReducer from './slices/fileContentsSlice';
import directoryTreeReducer from './slices/directoryTreeSlice';
import tokenCountReducer from './slices/tokenCountSlice';
import tabsReducer from './slices/tabsSlice';
import statsReducer from './slices/statsSlice';

// eslint-disable-next-line import/prefer-default-export
export const rootReducer = combineReducers({
  app: appReducer,
  workspace: workspaceReducer,
  files: filesReducer,
  fileContents: fileContentsReducer,
  directoryTree: directoryTreeReducer,
  tokenCount: tokenCountReducer,
  tabs: tabsReducer,
  stats: statsReducer,
});
