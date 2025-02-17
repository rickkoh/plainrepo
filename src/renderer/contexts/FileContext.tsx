import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { z } from 'zod';
import { FileNode } from '../../types/FileNode';
import { useWorkspaceContext } from './WorkspaceContext';
import { useTabsManagerContext } from './TabsManagerContext';

interface FileContextProps {
  content?: string;
  fileNode?: FileNode;
  setFileNode: (fileNode: FileNode) => void;
  tokenCount?: number;
}

const FileContext = createContext<FileContextProps | undefined>(undefined);

interface FileProviderProps {}

export default function FileProvider({
  children,
}: PropsWithChildren<FileProviderProps>) {
  const { activeTab, setFileNode } = useTabsManagerContext();

  const fileNode = useMemo(() => {
    return activeTab?.fileNode;
  }, [activeTab]);

  const { autoSync } = useWorkspaceContext();

  const [content, _setContent] = useState<string>();
  const [tokenCount, setTokenCount] = useState<number>();

  const getTokenCount = useCallback(async (text: string) => {
    const response = await window.electron.ipcRenderer.getTokenCount(text);
    const parsed = z.number().safeParse(response);
    if (!parsed.success) {
      return;
    }
    setTokenCount(parsed.data);
  }, []);

  const setContent = useCallback(
    (newContent: string) => {
      getTokenCount(newContent);
      _setContent(newContent);
    },
    [getTokenCount],
  );

  const getContent = useCallback(
    async (node: FileNode) => {
      try {
        const response = await window.electron.ipcRenderer.getContent(node);
        const parsed = z.string().safeParse(response);
        if (!parsed.success) {
          console.error('Failed to parse content:', parsed.error);
          return;
        }
        setContent(parsed.data);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    },
    [setContent],
  );

  /**
   * Sets the file node and, if autoSync is enabled, retrieves its content.
   */
  const setThisFileNode = useCallback(
    (node: FileNode) => {
      setFileNode(node);
      if (autoSync) {
        getContent(node);
      }
    },
    [autoSync, getContent, setFileNode],
  );

  // When autoSync is enabled, fetch content whenever the file node changes.
  useEffect(() => {
    if (autoSync && fileNode) {
      getContent(fileNode);
    }
  }, [autoSync, fileNode, getContent]);

  const providerValue = useMemo(
    () => ({
      fileNode,
      setFileNode: setThisFileNode,
      content,
      tokenCount,
    }),
    [fileNode, setThisFileNode, content, tokenCount],
  );

  return (
    <FileContext.Provider value={providerValue}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
}
