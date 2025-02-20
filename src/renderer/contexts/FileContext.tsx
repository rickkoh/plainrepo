import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { FileNode } from '../../types/FileNode';
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
  }, [activeTab?.fileNode]);

  const content = useMemo(() => {
    return activeTab?.content;
  }, [activeTab?.content]);

  const tokenCount = useMemo(() => {
    return activeTab?.tokenCount;
  }, [activeTab?.tokenCount]);

  const providerValue = useMemo(
    () => ({
      fileNode,
      setFileNode,
      content,
      tokenCount,
    }),
    [fileNode, setFileNode, content, tokenCount],
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
