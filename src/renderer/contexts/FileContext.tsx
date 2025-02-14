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
import { FileNode, FileNodeSchema } from '../../types/FileNode';

interface FileContextProps {
  workingDirName?: string;
  workingDir?: string;
  setWorkingDir: (path: string) => void;
  content?: string;
  fileNode?: FileNode;
  setFileNode: (fileNode: FileNode) => void;
  autoSync?: boolean;
  setAutoSync: (autoSync: boolean) => void;
  filterName?: string;
  setFilterName: (filterName: string) => void;
  getContent: (fileNode: FileNode) => void;
  pingIpc: () => void;
  tokenCount?: number;
  setTokenCount: (tokenCount: number) => void;
}

export const FileContext = createContext<FileContextProps | undefined>(
  undefined,
);

interface FileProviderProps {}

export default function FileProvider({
  children,
}: PropsWithChildren<FileProviderProps>) {
  const [workingDir, _setWorkingDir] = useState<string>();

  const [fileNode, _setFileNode] = useState<FileNode>();

  const [content, _setContent] = useState<string>();

  const [autoSync, _setAutoSync] = useState<boolean>();

  const [tokenCount, setTokenCount] = useState<number>();

  const [filterName, setFilterName] = useState<string>();

  const workingDirName = useMemo(() => {
    return workingDir ? workingDir.split('/').pop() : '';
  }, [workingDir]);

  const pingIpc = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
  }, []);

  const setWorkingDir = useCallback((path: string) => {
    window.electron.ipcRenderer.sendMessage('set-root-dir', path);
    _setWorkingDir(path);
  }, []);

  const getContent = (tempFileNode: FileNode) => {
    window.electron.ipcRenderer.sendMessage('get-content', tempFileNode);
  };

  const setFileNode = useCallback(
    (tempFileNode: FileNode) => {
      _setFileNode(tempFileNode);
      if (autoSync) {
        getContent(tempFileNode);
      }
    },
    [autoSync],
  );

  const setContent = (contentToSet: string) => {
    window.electron.ipcRenderer.sendMessage('get-token-count', contentToSet);
    _setContent(contentToSet);
  };

  const setAutoSync = useCallback(
    (newAutoSync: boolean) => {
      _setAutoSync(newAutoSync);
      if (newAutoSync && fileNode) {
        getContent(fileNode);
      }
    },
    [fileNode],
  );

  const providerValue = useMemo(
    () => ({
      workingDirName,
      workingDir,
      setWorkingDir,
      fileNode,
      setFileNode,
      content,
      autoSync,
      setAutoSync,
      filterName,
      setFilterName,
      getContent,
      pingIpc,
      tokenCount,
      setTokenCount,
    }),
    [
      workingDirName,
      workingDir,
      setWorkingDir,
      fileNode,
      setFileNode,
      content,
      autoSync,
      filterName,
      setFilterName,
      setAutoSync,
      pingIpc,
      tokenCount,
    ],
  );

  const handleIpcExample = useCallback((arg: unknown) => {
    // eslint-disable-next-line no-console
    console.log(arg);
  }, []);

  const handleRootDirSet = useCallback(
    (arg: unknown) => {
      try {
        const newFileNode = FileNodeSchema.parse(arg);
        setFileNode(newFileNode);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse root dir set message', error);
      }
    },
    [setFileNode],
  );

  const handleGetContent = (arg: unknown) => {
    const parsedResult = z.string().safeParse(arg);
    if (!parsedResult.success) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse content', parsedResult.error);
      return;
    }
    setContent(parsedResult.data);
  };

  const handleGetTokenCount = (arg: unknown) => {
    const parsedResult = z.number().safeParse(arg);
    if (!parsedResult.success) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse token count', parsedResult.error);
      return;
    }
    setTokenCount(parsedResult.data);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-example', handleIpcExample);
    window.electron.ipcRenderer.on('root-dir-set', handleRootDirSet);
    window.electron.ipcRenderer.on('get-content', handleGetContent);
    window.electron.ipcRenderer.on('get-token-count', handleGetTokenCount);

    return () => {
      window.electron.ipcRenderer.off('ipc-example', handleIpcExample);
      window.electron.ipcRenderer.off('root-dir-set', handleRootDirSet);
      window.electron.ipcRenderer.off('get-content', handleGetContent);
      window.electron.ipcRenderer.off('get-token-count', handleGetTokenCount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
