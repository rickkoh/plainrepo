import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import FileNodeProvider from './FileContext';
import { useWorkspaceContext } from './WorkspaceContext';

interface TabsManagerContextProps {
  tabsLength: number;
  activeTab: number;
  setActiveTab: (index: number) => void;
  closeTab: (index: number) => void;
  newTab: () => void;
  nextTab: () => void;
  previousTab: () => void;
}

export const TabsManagerContext = createContext<
  TabsManagerContextProps | undefined
>(undefined);

interface TabsManagerProviderProps {}

export default function TabsManagerProvider({
  children,
}: PropsWithChildren<TabsManagerProviderProps>) {
  const { fileNode } = useWorkspaceContext();

  const [tabsLength, _setTabsLength] = useState(1);

  const [activeTab, setActiveTab] = useState(0);

  const closeTab = useCallback(
    (index: number) => {
      if (tabsLength === 1) {
        return;
      }
      if (index === tabsLength - 1) {
        setActiveTab(index - 1);
      }
      if (index < activeTab) {
        setActiveTab(activeTab - 1);
      }
      _setTabsLength(tabsLength - 1);
    },
    [activeTab, tabsLength],
  );

  const newTab = useCallback(() => {
    _setTabsLength(tabsLength + 1);
    setActiveTab(tabsLength);
  }, [tabsLength]);

  const nextTab = useCallback(() => {
    setActiveTab((activeTab + 1) % tabsLength);
  }, [activeTab, tabsLength]);

  const previousTab = useCallback(() => {
    setActiveTab((activeTab - 1 + tabsLength) % tabsLength);
  }, [activeTab, tabsLength]);

  const providerValue = useMemo(
    () => ({
      tabsLength,
      activeTab,
      setActiveTab,
      nextTab,
      previousTab,
      closeTab,
      newTab,
    }),
    [activeTab, closeTab, newTab, nextTab, previousTab, tabsLength],
  );
  const { setWorkingDir } = useWorkspaceContext();
  const handleClick = async () => {
    const folder = await window.electron.ipcRenderer.selectFolder();
    if (folder) {
      setWorkingDir(folder);
    }
  };

  return (
    <TabsManagerContext.Provider value={providerValue}>
      <Tabs value={String(activeTab)} className="w-full h-full overflow-scroll">
        {Array.from({ length: tabsLength }).map((_, index) => {
          return (
            <TabsContent
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              value={String(index)}
              className="w-full h-full mt-0 data-[state=inactive]:hidden testtt"
              forceMount
            >
              {fileNode && (
                <FileNodeProvider fileNode={fileNode}>
                  {children}
                </FileNodeProvider>
              )}
            </TabsContent>
          );
        })}
        {fileNode === undefined && (
          <Button
            type="button"
            className="px-4 py-2 text-primary-foreground bg-primary rounded-md"
            onClick={handleClick}
          >
            Open Folder
          </Button>
        )}
      </Tabs>
    </TabsManagerContext.Provider>
  );
}

export function useTabsManagerContext() {
  const context = useContext(TabsManagerContext);
  if (!context) {
    throw new Error(
      'useTabsManagerContext must be used within an TabsManagerProvider',
    );
  }
  return context;
}
