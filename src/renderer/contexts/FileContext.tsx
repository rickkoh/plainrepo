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
  rootDir?: string;
  setRootDir: (path: string) => void;
  content?: string;
  workspace?: FileNode;
  setWorkspace: (workspace: FileNode) => void;
  autoSync?: boolean;
  setAutoSync: (autoSync: boolean) => void;
  getContent: (fileNode: FileNode) => void;
  pingIpc: () => void;
  tokenCount?: number;
  setTokenCount: (tokenCount: number) => void;
}

export const FileContext = createContext<FileContextProps | undefined>(
  undefined,
);

/**
 * Send the rootDir to ipc
 * Ipc will read the directory using fs and send the files back in a specific format, let's call this format fileNode
 * Users can select the file they want to view and the fileNode will be sent back to the ipcMain
 * ipcMain will read the file and send the content back to the ipcRenderer
 * Everytime this happens we first start by doing the bruteforce method- read the file one by one and send the content back
 * In future we can optimize this by reading the file in chunks and sending the content back in chunks
 * Or we can first find the difference of the selected file and the previous file and send only the difference
 * renderer -> select root -> fs returns structure -> renderer renders structure
 * -> renderer selects file -> [ipcRenderer sends fileNode -> ipcMain reads file -> ipcMain sends content](this part can be optimised)
 * -> ipcRenderer receives content -> renderer renders content
 * @param param
 * @returns
 */

interface FileProviderProps {}

export default function FileProvider({
  children,
}: PropsWithChildren<FileProviderProps>) {
  const [rootDir, _setRootDir] = useState<string>();

  const [workspace, _setWorkspace] = useState<FileNode>();

  const [content, _setContent] = useState<string>();

  const [autoSync, _setAutoSync] = useState<boolean>();

  const [tokenCount, setTokenCount] = useState<number>();

  const pingIpc = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
  }, []);

  const setRootDir = useCallback((path: string) => {
    window.electron.ipcRenderer.sendMessage('set-root-dir', path);
    _setRootDir(path);
  }, []);

  const getContent = useCallback((fileNode: FileNode) => {
    window.electron.ipcRenderer.sendMessage('get-content', fileNode);
  }, []);

  const setWorkspace = useCallback(
    (newWorkspace: FileNode) => {
      _setWorkspace(newWorkspace);
      if (autoSync) {
        getContent(newWorkspace);
      }
    },
    [autoSync, getContent],
  );

  const setContent = useCallback((contentToSet: string) => {
    window.electron.ipcRenderer.sendMessage('get-token-count', contentToSet);
    _setContent(contentToSet);
  }, []);

  const setAutoSync = useCallback(
    (newAutoSync: boolean) => {
      _setAutoSync(newAutoSync);
      if (newAutoSync && workspace) {
        getContent(workspace);
      }
    },
    [workspace, getContent],
  );

  const providerValue = useMemo(
    () => ({
      rootDir,
      setRootDir,
      workspace,
      setWorkspace,
      content,
      autoSync,
      setAutoSync,
      getContent,
      pingIpc,
      tokenCount,
      setTokenCount,
    }),
    [
      rootDir,
      setRootDir,
      workspace,
      setWorkspace,
      content,
      autoSync,
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
      const fileNode = FileNodeSchema.parse(arg);
      setWorkspace(fileNode);
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
  }, [setWorkspace, setContent]);

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
