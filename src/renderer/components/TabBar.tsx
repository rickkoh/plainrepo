/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// File: src/renderer/components/TabBar.tsx
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  selectAllTabs,
  selectActiveTabId,
} from '../redux/selectors/tabsSelectors';
import { createTab, closeTab, activateTab } from '../redux/slices/tabsSlice';

export default function TabBar() {
  const dispatch = useAppDispatch();
  const tabs = useAppSelector(selectAllTabs);
  const activeTabId = useAppSelector(selectActiveTabId);

  // Create initial tab if none exists
  useEffect(() => {
    if (tabs.length === 0) {
      dispatch(createTab('Main'));
    }
  }, [dispatch, tabs.length]);

  const handleCreateTab = () => {
    dispatch(createTab());
  };

  const handleCloseTab = (id: string) => {
    dispatch(closeTab(id));
  };

  const handleActivateTab = (id: string) => {
    dispatch(activateTab(id));
  };

  return (
    <div className="flex flex-row items-center border-b border-border">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'flex items-center h-10 px-4 border-r border-border cursor-pointer',
              activeTabId === tab.id
                ? 'bg-background'
                : 'bg-muted hover:bg-background/80',
            )}
            onClick={() => handleActivateTab(tab.id)}
          >
            <span className="mr-2">{tab.name}</span>
            <button
              type="button"
              className="opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2"
        onClick={handleCreateTab}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
