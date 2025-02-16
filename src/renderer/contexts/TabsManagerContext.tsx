import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { FileNode } from '@/src/types/FileNode';

import { useWorkspaceContext } from './WorkspaceContext';
import FileProvider from './FileContext';

export type TabData = {
  id: string;
  title: string;
  fileNode: FileNode;
  content: string;
  tokenCount: number;
};
interface TabsManagerContextProps {
  tabs: TabData[];
  activeTabIndex: number;
  tabsLength: number;
  activeTab: TabData | undefined;
  setActiveTab: (index: number) => void;
  closeTab: (index: number) => void;
  newTab: () => void;
  nextTab: () => void;
  previousTab: () => void;
  setFileNode: (newFileNode: FileNode) => void;
}

export const TabsManagerContext = createContext<
  TabsManagerContextProps | undefined
>(undefined);

let id = 0;

interface LevelProps {
  fileNode: FileNode;
}

function Level({ children, fileNode }: PropsWithChildren<LevelProps>) {
  const [tabs, setTabs] = useState<TabData[]>([
    {
      id: String(id),
      title: 'Tab',
      fileNode: JSON.parse(JSON.stringify(fileNode)),
      content: '',
      tokenCount: 0,
    },
  ]);

  const tabsLength = useMemo(() => tabs.length, [tabs]);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const activeTab = useMemo(() => {
    return tabs[activeTabIndex];
  }, [activeTabIndex, tabs]);

  const setActiveTab = (index: number) => {
    setActiveTabIndex(index);
  };

  const closeTab = useCallback(
    (index: number) => {
      const newTabs = tabs.filter((_, i) => i !== index);
      setTabs(newTabs);
    },
    [tabs],
  );

  const newTab = useCallback(() => {
    if (fileNode === undefined) {
      return;
    }
    id += 1;
    const newTabData: TabData = {
      id: String(id),
      title: 'Tab',
      fileNode: JSON.parse(JSON.stringify(fileNode)),
      content: '',
      tokenCount: 0,
    };

    setTabs([...tabs, newTabData]);
  }, [fileNode, tabs]);

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
    [activeTabIndex, tabs],
  );

  const providerValue = useMemo(
    () => ({
      tabs,
      activeTabIndex,
      tabsLength,
      activeTab,
      setActiveTab,
      nextTab,
      previousTab,
      closeTab,
      newTab,
      setFileNode,
    }),
    [
      activeTab,
      activeTabIndex,
      closeTab,
      newTab,
      nextTab,
      previousTab,
      setFileNode,
      tabs,
      tabsLength,
    ],
  );

  return (
    <TabsManagerContext.Provider value={providerValue}>
      <FileProvider fileNode={activeTab.fileNode} setFileNode={setFileNode}>
        {children}
      </FileProvider>
    </TabsManagerContext.Provider>
  );
}

interface TabsManagerProviderProps {}

export default function TabsManagerProvider({
  children,
}: PropsWithChildren<TabsManagerProviderProps>) {
  const { fileNode, setWorkingDir } = useWorkspaceContext();

  const handleClick = async () => {
    const folder = await window.electron.ipcRenderer.selectFolder();
    if (folder) {
      setWorkingDir(folder);
    }
  };

  if (fileNode) {
    return <Level fileNode={fileNode}>{children}</Level>;
  }
  return (
    <Button
      type="button"
      className="px-4 py-2 text-primary-foreground bg-primary rounded-md"
      onClick={handleClick}
    >
      Open Folder
    </Button>
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
