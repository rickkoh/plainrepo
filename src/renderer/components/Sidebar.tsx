import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Files, Search as SearchIcon, SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

import Search from './Search';
import Explorer from './Explorer';
import Settings from './Settings';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('explorer');

  return (
    <Tabs
      defaultValue="account"
      value={activeTab}
      className="flex flex-row w-full h-full"
    >
      <TabsList className="flex flex-col justify-start h-full p-0 w-fit border-r border-border rounded-none">
        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
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
          onClick={() => setActiveTab('search')}
          className={cn(
            'border-l-2 border-background py-4 px-2 text-muted-foreground',
            'hover:text-foreground',
            activeTab === 'search' && 'text-foreground border-foreground',
          )}
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={cn(
            'border-l-2 border-background py-4 px-2 text-muted-foreground mt-auto',
            'hover:text-foreground',
            activeTab === 'settings' && 'text-foreground border-foreground',
          )}
        >
          <SettingsIcon />
        </button>
      </TabsList>
      <TabsContent value="explorer" className="w-full h-full mt-0">
        <Explorer />
      </TabsContent>
      <TabsContent value="search" className="w-full h-full mt-0">
        <Search />
      </TabsContent>
      <TabsContent value="settings" className="w-full h-full mt-0">
        <Settings />
      </TabsContent>
    </Tabs>
  );
}
