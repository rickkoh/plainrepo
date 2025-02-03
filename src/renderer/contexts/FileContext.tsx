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
import {
  FileNode,
  FileContentNode,
  FileNodeSchema,
} from '../../types/FileNode';

interface FileContextProps {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileContentNode, _setFileContentNode] = useState<FileContentNode>();

  const [content, _setContent] = useState<string>();

  const [autoSync, _setAutoSync] = useState<boolean>();

  const [tokenCount, setTokenCount] = useState<number>();

  const [filterName, setFilterName] = useState<string>();

  const pingIpc = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
  }, []);

  const setWorkingDir = useCallback((path: string) => {
    window.electron.ipcRenderer.sendMessage('set-root-dir', path);
    _setWorkingDir(path);
  }, []);

  const getContent = useCallback((tempFileNode: FileNode) => {
    window.electron.ipcRenderer.sendMessage('get-content', tempFileNode);
  }, []);

  const setFileNode = useCallback(
    (tempFileNode: FileNode) => {
      _setFileNode(tempFileNode);
      if (autoSync) {
        getContent(tempFileNode);
      }
    },
    [autoSync, getContent],
  );

  /**
   * Reasons for a fileContentNode is so that the fileNode contains the content of the file
   * This is useful if we want to perform search operations as we can search the content of the file
   * For fileNode with Content, we can retrieve the content when autosync is switched on. if it is off, there is no need to retrieve the content
   * Hence, the content should be optional
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setFileContentNode = useCallback(
    (tempFileContentNode: FileContentNode) => {
      _setFileContentNode(tempFileContentNode);
    },
    [],
  );

  const setContent = useCallback((contentToSet: string) => {
    window.electron.ipcRenderer.sendMessage('get-token-count', contentToSet);
    _setContent(contentToSet);
  }, []);

  const setAutoSync = useCallback(
    (newAutoSync: boolean) => {
      _setAutoSync(newAutoSync);
      if (newAutoSync && fileNode) {
        getContent(fileNode);
      }
    },
    [fileNode, getContent],
  );

  const providerValue = useMemo(
    () => ({
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
      workingDir,
      setWorkingDir,
      fileNode,
      setFileNode,
      content,
      autoSync,
      filterName,
      setFilterName,
      getContent,
      setAutoSync,
      pingIpc,
      tokenCount,
    ],
  );

  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-example', (arg) => {
      // eslint-disable-next-line no-console
      console.log(arg);
    });

    window.electron.ipcRenderer.on('root-dir-set', (arg) => {
      const newFileNode = FileNodeSchema.parse(arg);
      setFileNode(newFileNode);
    });

    window.electron.ipcRenderer.on('get-content', (arg) => {
      const newContent = z.string().parse(arg);
      setContent(newContent);
    });

    window.electron.ipcRenderer.on('get-token-count', (arg) => {
      const parsedResult = z.number().safeParse(arg);
      if (!parsedResult.success) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse token count', parsedResult.error);
        return;
      }
      const token = parsedResult.data;
      setTokenCount(token);
    });

    // TODO: Cleanup the listeners
  }, [setFileNode, setContent]);

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
