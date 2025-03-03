// File: src/renderer/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './rootReducer';
import electronMiddleware from './electronMiddleware';

const persistConfig = {
  key: 'root',
  storage,
  // Only persist UI state, settings, and tab configuration
  // Don't persist large file content data
  whitelist: ['app', 'tabs'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable data in certain paths
        ignoredActions: [
          'workspace/setFileNode',
          'fileContents/addFileContents',
        ],
        ignoredPaths: ['workspace.fileNode', 'fileContents.byId'],
      },
    }).concat(electronMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
