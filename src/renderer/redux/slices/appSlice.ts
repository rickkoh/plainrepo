// File: src/renderer/redux/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AppSettings,
  ExcludeList,
  ReplaceList,
} from '../../../types/AppSettings';

interface AppState {
  darkMode: boolean;
  shouldIncludeGitIgnore: boolean;
  copyLimit: number;
  exclude: ExcludeList;
  replace: ReplaceList;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  darkMode: false,
  shouldIncludeGitIgnore: true,
  copyLimit: 500000,
  exclude: [],
  replace: [],
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
    setShouldIncludeGitIgnore(state, action: PayloadAction<boolean>) {
      state.shouldIncludeGitIgnore = action.payload;
    },
    setCopyLimit(state, action: PayloadAction<number>) {
      state.copyLimit = action.payload;
    },
    setExclude(state, action: PayloadAction<ExcludeList>) {
      state.exclude = action.payload;
    },
    addExclude(state, action: PayloadAction<string>) {
      state.exclude.push(action.payload);
    },
    removeExclude(state, action: PayloadAction<number>) {
      state.exclude.splice(action.payload, 1);
    },
    updateExclude(
      state,
      action: PayloadAction<{ index: number; value: string }>,
    ) {
      state.exclude[action.payload.index] = action.payload.value;
    },
    setReplace(state, action: PayloadAction<ReplaceList>) {
      state.replace = action.payload;
    },
    addReplace(state, action: PayloadAction<{ from: string; to: string }>) {
      state.replace.push(action.payload);
    },
    removeReplace(state, action: PayloadAction<number>) {
      state.replace.splice(action.payload, 1);
    },
    updateSettings(state, action: PayloadAction<AppSettings>) {
      return { ...state, ...action.payload };
    },
    loadSettingsStart(state) {
      state.loading = true;
      state.error = null;
    },
    loadSettingsSuccess(state, action: PayloadAction<AppSettings>) {
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
      };
    },
    loadSettingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
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
  loadSettingsStart,
  loadSettingsSuccess,
  loadSettingsFailure,
} = appSlice.actions;

const appReducer = appSlice.reducer;

export default appReducer;

// Thunk to load app settings
export const loadAppSettings = () => async (dispatch: any) => {
  dispatch(loadSettingsStart());
  try {
    const settings = await window.electron.ipcRenderer.readAppSettings();
    dispatch(loadSettingsSuccess(settings));
  } catch (error) {
    dispatch(
      loadSettingsFailure(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    );
  }
};
