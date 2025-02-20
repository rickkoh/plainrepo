import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FileNode } from '@/src/types/FileNode';
import { TabData, TabDataArray } from '@/src/types/TabData';
import reconcileFileNode, {
  buildSavedMap,
} from '@/src/main/utils/FileReconcilor';

import { useWorkspaceContext } from './WorkspaceContext';

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
  setTabTitle: (index: number, title: string) => void;
  setFileNode: (newFileNode: FileNode) => void;
}

export const TabsManagerContext = createContext<
  TabsManagerContextProps | undefined
>(undefined);

interface TabsManagerProviderProps {}

export default function TabsManagerProvider({
  children,
}: PropsWithChildren<TabsManagerProviderProps>) {
  const { fileNode, autoSync, workingDir } = useWorkspaceContext();

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

    // Build a set of used IDs for O(1) lookups.
    const usedIds = new Set(tabs.map((tab) => Number(tab.id)));

    // Find the smallest missing positive integer.
    let id = 1;
    while (usedIds.has(id)) {
      id += 1;
    }

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

  const setFileNode = useCallback(
    async (newFileNode: FileNode) => {
      const newTabs = [...tabs];

      let { content, tokenCount } = newTabs[activeTabIndex];

      if (autoSync) {
        content = await window.electron.ipcRenderer.getContent(newFileNode);
        tokenCount = Number(
          await window.electron.ipcRenderer.getTokenCount(content),
        );
      }

      newTabs[activeTabIndex] = {
        ...newTabs[activeTabIndex],
        fileNode: newFileNode,
        content,
        tokenCount,
      };
      setTabs(newTabs);
    },
    [activeTabIndex, autoSync, setTabs, tabs],
  );

  const prevAutoSyncRef = useRef(false);

  const refreshTab = useCallback(async () => {
    const newTabs = [...tabs];
    const content = await window.electron.ipcRenderer.getContent(
      newTabs[activeTabIndex].fileNode,
    );
    const tokenCount = Number(
      await window.electron.ipcRenderer.getTokenCount(content),
    );
    newTabs[activeTabIndex] = {
      ...newTabs[activeTabIndex],
      content,
      tokenCount,
    };
    setTabs(newTabs);
  }, [activeTabIndex, setTabs, tabs]);

  useEffect(() => {
    if (autoSync && !prevAutoSyncRef.current) {
      refreshTab();
    }
    prevAutoSyncRef.current = !!autoSync;
  }, [autoSync, refreshTab]);

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
      setTabTitle,
      setFileNode,
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
      setTabTitle,
      setFileNode,
    ],
  );

  useEffect(() => {
    if (workingDir && fileNode) {
      window.electron.ipcRenderer
        .loadWorkspace(workingDir)
        .then(async (prevTabs) => {
          const reconciledTabs = prevTabs.map((tab) => {
            const savedMap = buildSavedMap(tab.fileNode);
            const reconciledFileNode = reconcileFileNode(fileNode, savedMap);
            return {
              ...tab,
              fileNode: reconciledFileNode,
            };
          });
          _setTabs(reconciledTabs);
          return null;
        })
        .catch(() => {
          return null;
        });
    }
  }, [autoSync, fileNode, workingDir]);

  return (
    <TabsManagerContext.Provider value={providerValue}>
      {children}
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
