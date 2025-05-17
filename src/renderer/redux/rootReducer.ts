import { combineReducers } from '@reduxjs/toolkit';

import appReducer from './slices/appSlice';
import fileContentsReducer from './slices/fileContentsSlice';
import workspaceReducer from './slices/workspaceSlice';
import filesReducer from './slices/filesSlice';
import statsReducer from './slices/statsSlice';
import notificationsReducer from './slices/notificationsSlice';

// eslint-disable-next-line import/prefer-default-export
export const rootReducer = combineReducers({
  app: appReducer,
  workspace: workspaceReducer,
  fileContents: fileContentsReducer,
  files: filesReducer,
  stats: statsReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
