import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  AppSettings,
  ChunkSize,
  CopyLimit,
  ExcludeItem,
  ExcludeList,
  MaxFileSize,
  ReplaceItem,
  ReplaceList,
  ShouldIncludeGitIgnore,
} from '../../../types/AppSettings';

interface AppState extends AppSettings {
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setShouldIncludeGitIgnore(
      state,
      action: PayloadAction<ShouldIncludeGitIgnore>,
    ) {
      state.shouldIncludeGitIgnore = action.payload;
    },
    setCopyLimit(state, action: PayloadAction<CopyLimit>) {
      if (action.payload < 1) {
        state.copyLimit = undefined;
        return;
      }
      state.copyLimit = action.payload;
    },
    setExclude(state, action: PayloadAction<ExcludeList>) {
      state.exclude = action.payload;
    },
    addExclude(state, action: PayloadAction<ExcludeItem>) {
      if (state.exclude === undefined) {
        state.exclude = [];
      }
      state.exclude.push(action.payload);
    },
    removeExclude(state, action: PayloadAction<number>) {
      if (state.exclude === undefined) {
        state.exclude = [];
      }
      state.exclude.splice(action.payload, 1);
    },
    updateExclude(
      state,
      action: PayloadAction<{ index: number; value: string }>,
    ) {
      if (state.exclude === undefined) {
        state.exclude = [];
      }
      state.exclude[action.payload.index] = action.payload.value;
    },
    setReplace(state, action: PayloadAction<ReplaceList>) {
      state.replace = action.payload;
    },
    addReplace(state, action: PayloadAction<ReplaceItem>) {
      if (state.replace === undefined) {
        state.replace = [];
      }
      state.replace.push(action.payload);
    },
    removeReplace(state, action: PayloadAction<number>) {
      if (state.replace === undefined) {
        state.replace = [];
      }
      state.replace.splice(action.payload, 1);
    },
    updateSettings(state, action: PayloadAction<AppSettings>) {
      return { ...state, ...action.payload };
    },
    setChunkSize(state, action: PayloadAction<ChunkSize>) {
      if (action.payload < 1) {
        state.chunkSize = undefined;
        return;
      }
      state.chunkSize = action.payload;
    },
    setMaxFileSize(state, action: PayloadAction<MaxFileSize>) {
      if (action.payload < 1) {
        state.maxFileSize = undefined;
        return;
      }
      state.maxFileSize = action.payload;
    },
    intialiseAppSettings(state, action: PayloadAction<AppSettings>) {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  toggleDarkMode,
  setShouldIncludeGitIgnore,
  setCopyLimit,
  setExclude,
  addExclude,
  removeExclude,
  updateExclude,
  setReplace,
  addReplace,
  removeReplace,
  updateSettings,
  setChunkSize,
  setMaxFileSize,
  intialiseAppSettings,
} = appSlice.actions;

const appReducer = appSlice.reducer;

export default appReducer;

// Thunk to load app settings
export const loadAppSettings = () => async (dispatch: any) => {
  try {
    const settings = await window.electron.ipcRenderer.readAppSettings();
    dispatch(intialiseAppSettings(settings));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Error loading app settings:', error);
  }
};
