import { File, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  TabData,
  useTabsManagerContext,
} from '../../contexts/TabsManagerContext';

export default function TabsBar() {
  const { tabs, setActiveTab, activeTabIndex, newTab, closeTab } =
    useTabsManagerContext();

  return (
    <div className="flex flex-row w-full">
      {/* TODO: Allow users to rename their tab */}
      {tabs.map((tab: TabData, index) => (
        <button
          // eslint-disable-next-line react/no-array-index-key
          key={tab.id}
          type="button"
          className={cn(
            'flex flex-row items-center border border-t-0 px-4 py-1 space-x-2',
            index === activeTabIndex && 'border-foreground',
          )}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(index);
          }}
        >
          <span>
            <File className="w-4 h-4" />
          </span>
          <p>Tab {tab.id}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(index);
            }}
          >
            <X />
          </button>
        </button>
      ))}

      <button type="button" onClick={newTab} className="ml-2">
        <Plus />
      </button>
    </div>
  );
}
