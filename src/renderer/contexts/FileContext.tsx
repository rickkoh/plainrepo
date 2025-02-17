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

interface FileContextProps {
  content?: string;
  fileNode?: FileNode;
  setFileNode: (fileNode: FileNode) => void;
  tokenCount?: number;
  setTokenCount: (tokenCount: number) => void;
}

export const FileContext = createContext<FileContextProps | undefined>(
  undefined,
);

interface FileProviderProps {
  fileNode: FileNode;
  setFileNode: (fileNode: FileNode) => void;
}

export default function FileProvider({
  fileNode,
  setFileNode,
  children,
}: PropsWithChildren<FileProviderProps>) {
  const { autoSync } = useWorkspaceContext();

  const [content, _setContent] = useState<string>();

  const [tokenCount, setTokenCount] = useState<number>();

  const [filterName, setFilterName] = useState<string>();

  const getTokenCount = async (contentToCount: string) => {
    const arg = await window.electron.ipcRenderer.getTokenCount(contentToCount);
    const parsedResult = z.number().safeParse(arg);
    if (!parsedResult.success) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse token count', parsedResult.error);
      return;
    }
    setTokenCount(parsedResult.data);
  };

  const setContent = useCallback((contentToSet: string) => {
    getTokenCount(contentToSet);
    _setContent(contentToSet);
  }, []);

  const getContent = useCallback(
    async (tempFileNode: FileNode) => {
      const tempContent =
        await window.electron.ipcRenderer.getContent(tempFileNode);
      const parsedResult = z.string().safeParse(tempContent);
      if (!parsedResult.success) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse content', parsedResult.error);
        return;
      }
      setContent(parsedResult.data);
    },
    [setContent],
  );

  const setThisFileNode = useCallback(
    (tempFileNode: FileNode) => {
      setFileNode(tempFileNode);
      if (autoSync) {
        getContent(tempFileNode);
      }
    },
    [autoSync, getContent, setFileNode],
  );

  useEffect(() => {
    if (autoSync) {
      getContent(fileNode);
    }
  }, [autoSync, fileNode, getContent]);

  const providerValue = useMemo(
    () => ({
      fileNode,
      setFileNode: setThisFileNode,
      content,
      filterName,
      setFilterName,
      tokenCount,
      setTokenCount,
    }),
    [fileNode, setThisFileNode, content, filterName, tokenCount],
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
    throw new Error(
      'useFileContext must be used within an FileContextProvider',
    );
  }
  return context;
}
