import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { FileNode } from '../../types/FileNode';
import { useTabsManagerContext } from './TabsManagerContext';

interface FileContextProps {
  fileNode?: FileNode;
  setFileNode: (fileNode: FileNode) => void;
  directoryStructure: Promise<string>;
  content: Promise<string>;
  tokenCount: Promise<number>;
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

  const directoryStructure = useMemo(async () => {
    if (!fileNode) {
      return '';
    }
    const toReturn =
      await window.electron.ipcRenderer.getDirectoryStructure(fileNode);
    if (!toReturn) {
      return '';
    }
    return toReturn;
  }, [fileNode]);

  const content = useMemo(async () => {
    if (!fileNode) {
      return '';
    }
    const toReturn = await window.electron.ipcRenderer.getContent(fileNode);
    if (!toReturn) {
      return '';
    }
    return toReturn;
  }, [fileNode]);

  const tokenCount = useMemo(async () => {
    if (!content) {
      return 0;
    }
    const thisContent = await content;
    const toReturn =
      await window.electron.ipcRenderer.getTokenCount(thisContent);
    if (!toReturn) {
      return 0;
    }
    return toReturn;
  }, [content]);

  const providerValue = useMemo(
    () => ({
      fileNode,
      setFileNode,
      directoryStructure,
      content,
      tokenCount,
    }),
    [content, directoryStructure, fileNode, setFileNode, tokenCount],
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
