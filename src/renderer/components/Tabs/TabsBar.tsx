import { File, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useTabsManagerContext } from '../../contexts/TabsManagerContext';

export default function TabsBar() {
  const { tabsLength, setActiveTab, activeTab, newTab, closeTab } =
    useTabsManagerContext();

  return (
    <div className="flex flex-row w-full">
      {/* TODO: Allow users to rename their tab */}
      {Array.from({ length: tabsLength }).map((_, index) => (
        <button
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          type="button"
          className={cn(
            'flex flex-row items-center border border-t-0 px-4 py-1 space-x-2',
            activeTab === index && 'border-foreground',
          )}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(index);
          }}
        >
          <span>
            <File className="w-4 h-4" />
          </span>
          <p>Tab {index}</p>
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
