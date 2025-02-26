import { FileNode, FileNodeSchema } from '@/src/types/FileNode';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface WorkspaceContextProps {
  workingDir?: string;
  setWorkingDir: (path: string) => void;
  workingDirName?: string;
  fileNode?: FileNode;
  filterName?: string;
  setFilterName: (filterName: string) => void;
}

export const WorkspaceContext = createContext<
  WorkspaceContextProps | undefined
>(undefined);

interface WorkspaceProviderProps {}

export default function WorkspaceProvider({
  children,
}: PropsWithChildren<WorkspaceProviderProps>) {
  const [workingDir, _setWorkingDir] = useState<string>();

  const [originalFileNode, setOriginalFileNode] = useState<FileNode>();

  const [filterName, setFilterName] = useState<string>();

  const workingDirName = useMemo(() => {
    return workingDir ? workingDir.split('/').pop() : '';
  }, [workingDir]);

  const setWorkingDir = (path: string) => {
    window.electron.ipcRenderer.sendMessage('set-root-dir', path);
    _setWorkingDir(path);
  };

  const providerValue = useMemo(
    () => ({
      workingDir,
      setWorkingDir,
      workingDirName,
      fileNode: originalFileNode,
      filterName,
      setFilterName,
    }),
    [workingDir, workingDirName, originalFileNode, filterName],
  );

  const handleRootDirSet = (arg: unknown) => {
    try {
      const newFileNode = FileNodeSchema.parse(arg);
      setOriginalFileNode(newFileNode);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse root dir set message', error);
    }
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('root-dir-set', handleRootDirSet);

    return () => {
      window.electron.ipcRenderer.off('root-dir-set', handleRootDirSet);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WorkspaceContext.Provider value={providerValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      'useWorkspaceContext must be used within an WorkspaceContextProvider',
    );
  }
  return context;
}
