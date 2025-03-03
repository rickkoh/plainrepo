// File: src/renderer/components/Sidebar.tsx
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import {
  Files,
  Moon,
  Search as SearchIcon,
  SettingsIcon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectDarkMode } from '../redux/selectors/appSelectors';
import { toggleDarkMode } from '../redux/slices/appSlice';
import Search from './Search';
import Explorer from './Explorer';
import Settings from './Settings';

enum Tab {
  ExplorerTab = 'explorer',
  SearchTab = 'search',
  SettingsTab = 'settings',
}

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectDarkMode);
  const [activeTab, setActiveTab] = useState(Tab.ExplorerTab);

  const handleToggleDarkMode = () => {
    console.log('dispatching');
    dispatch(toggleDarkMode());
  };

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      className="flex flex-row w-full h-full"
    >
      <TabsList className="flex flex-col justify-start h-full p-0 w-fit border-r border-border rounded-none">
        <button
          type="button"
          onClick={() => setActiveTab(Tab.ExplorerTab)}
          className={cn(
            'border-l-2 border-background py-4 px-2 text-muted-foreground',
            'hover:text-foreground',
            activeTab === 'explorer' && 'text-foreground border-foreground',
          )}
        >
          <Files />
        </button>
        <button
          type="button"
          onClick={handleToggleDarkMode}
          className={cn(
            'border-l-2 border-background py-4 px-2 text-muted-foreground mt-auto',
            'hover:text-foreground',
            // activeTab === 'settings' && 'text-foreground border-foreground',
          )}
        >
          {isDarkMode ? <Sun /> : <Moon />}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(Tab.SettingsTab)}
          className={cn(
            'border-l-2 border-background py-4 px-2 text-muted-foreground',
            'hover:text-foreground',
            activeTab === 'settings' && 'text-foreground border-foreground',
          )}
        >
          <SettingsIcon />
        </button>
      </TabsList>
      <TabsContent
        value="explorer"
        forceMount
        className="w-full h-full mt-0 data-[state=inactive]:hidden"
      >
        <Explorer />
      </TabsContent>
      <TabsContent
        value="settings"
        forceMount
        className="w-full h-full mt-0 data-[state=inactive]:hidden"
      >
        <Settings />
      </TabsContent>
    </Tabs>
  );
}
