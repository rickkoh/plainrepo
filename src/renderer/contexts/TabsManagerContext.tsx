import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FileNode } from '@/src/types/FileNode';
import { TabData, TabDataArray } from '@/src/types/TabData';

import { useWorkspaceContext } from './WorkspaceContext';
import FileProvider from './FileContext';

interface TabsManagerContextProps {
  tabs: TabDataArray;
  activeTabIndex: number;
  tabsLength: number;
  activeTab: TabData | undefined;
  canCreateNewTab: boolean;
  setActiveTab: (index: number) => void;
  closeTab: (index: number) => void;
  newTab: () => void;
  nextTab: () => void;
  previousTab: () => void;
  setFileNode: (newFileNode: FileNode) => void;
  setTabTitle: (index: number, title: string) => void;
}

export const TabsManagerContext = createContext<
  TabsManagerContextProps | undefined
>(undefined);

let id = 0;

interface TabsManagerProviderProps {}

export default function TabsManagerProvider({
  children,
}: PropsWithChildren<TabsManagerProviderProps>) {
  const { fileNode, workingDir } = useWorkspaceContext();

  const [tabs, _setTabs] = useState<TabDataArray>([]);

  const tabsLength = useMemo(() => tabs.length, [tabs]);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const activeTab = useMemo(() => {
    return tabs[activeTabIndex];
  }, [activeTabIndex, tabs]);

  const canCreateNewTab = useMemo(() => fileNode !== undefined, [fileNode]);

  const setTabs = useCallback(
    (newTabs: TabDataArray) => {
      if (workingDir === undefined) {
        return;
      }
      _setTabs(newTabs);
      if (window.electron.ipcRenderer !== undefined) {
        window.electron.ipcRenderer.saveWorkspace(workingDir, newTabs);
      }
    },
    [workingDir],
  );

  const setActiveTab = (index: number) => {
    setActiveTabIndex(index);
  };

  const closeTab = useCallback(
    (index: number) => {
      const newTabs = tabs.filter((_, i) => i !== index);
      if (newTabs.length === 0) {
        // id += 1;
        // newTabs.push({
        //   id: String(id),
        //   title: 'Tab',
        //   fileNode: JSON.parse(JSON.stringify(fileNode)),
        //   content: '',
        //   tokenCount: 0,
        // });
        return;
      }
      if (activeTabIndex >= newTabs.length) {
        setActiveTabIndex(newTabs.length - 1);
      }
      setTabs(newTabs);
    },
    [activeTabIndex, setTabs, tabs],
  );

  const newTab = useCallback(() => {
    if (!canCreateNewTab) {
      return;
    }
    id += 1;
    const newTabData: TabData = {
      id: String(id),
      title: `Tab ${id}`,
      fileNode: JSON.parse(JSON.stringify(fileNode)),
      content: '',
      tokenCount: 0,
    };

    setTabs([...tabs, newTabData]);
  }, [canCreateNewTab, fileNode, setTabs, tabs]);

  const nextTab = useCallback(() => {
    const nextIndex = (activeTabIndex + 1) % tabsLength;
    setActiveTabIndex(nextIndex);
  }, [activeTabIndex, tabsLength]);

  const previousTab = useCallback(() => {
    const prevIndex = (activeTabIndex - 1) % tabsLength;
    setActiveTabIndex(prevIndex);
  }, [activeTabIndex, tabsLength]);

  const setFileNode = useCallback(
    (newFileNode: FileNode) => {
      const newTabs = [...tabs];
      newTabs[activeTabIndex] = {
        ...newTabs[activeTabIndex],
        fileNode: newFileNode,
      };
      setTabs(newTabs);
    },
    [activeTabIndex, setTabs, tabs],
  );

  const setTabTitle = useCallback(
    (index: number, title: string) => {
      const newTabs = [...tabs];

      newTabs[index] = {
        ...newTabs[index],
        title,
      };
      setTabs(newTabs);
    },
    [setTabs, tabs],
  );

  const providerValue = useMemo(
    () => ({
      tabs,
      activeTabIndex,
      tabsLength,
      activeTab,
      canCreateNewTab,
      setActiveTab,
      nextTab,
      previousTab,
      closeTab,
      newTab,
      setFileNode,
      setTabTitle,
    }),
    [
      tabs,
      activeTabIndex,
      tabsLength,
      activeTab,
      canCreateNewTab,
      nextTab,
      previousTab,
      closeTab,
      newTab,
      setFileNode,
      setTabTitle,
    ],
  );

  useEffect(() => {
    // if (true) {
    // }
    // if (workingDir === undefined) {
    //   return;
    // }
    // window.electron.ipcRenderer
    //   .loadWorkspace(workingDir)
    //   .then((loadedTabs) => {
    //     if (loadedTabs !== undefined) {
    //       _setTabs(loadedTabs);
    //     }
    //     return null;
    //   })
    //   .catch(() => {});

    if (tabsLength === 0) {
      newTab();
    }
  }, [newTab, tabsLength, workingDir]);

  return (
    <TabsManagerContext.Provider value={providerValue}>
      <FileProvider
        fileNode={activeTab ? activeTab.fileNode : undefined}
        setFileNode={setFileNode}
      >
        {children}
      </FileProvider>
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
