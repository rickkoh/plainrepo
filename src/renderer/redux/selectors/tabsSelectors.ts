// File: src/renderer/redux/selectors/tabsSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectTabsById = (state: RootState) => state.tabs.byId;
export const selectTabIds = (state: RootState) => state.tabs.allIds;
export const selectActiveTabId = (state: RootState) => state.tabs.activeTabId;

export const selectAllTabs = createSelector(
  [selectTabsById, selectTabIds],
  (byId, allIds) => allIds.map((id) => byId[id]),
);

export const selectActiveTab = createSelector(
  [selectTabsById, selectActiveTabId],
  (byId, activeTabId) => (activeTabId ? byId[activeTabId] : null),
);

export const selectActiveTabSelectedFilePaths = createSelector(
  [selectActiveTab],
  (activeTab) => (activeTab ? activeTab.selectedFilePaths : []),
);

export const selectTabByPath = (tabId: string) =>
  createSelector([selectTabsById], (byId) => byId[tabId] || null);
