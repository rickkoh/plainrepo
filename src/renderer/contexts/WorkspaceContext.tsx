import { FileNode, FileNodeSchema } from '@/src/types/FileNode';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { z } from 'zod';

interface WorkspaceContextProps {
  workingDir?: string;
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
  const [workingDir, setWorkingDir] = useState<string>();

  const [originalFileNode, setOriginalFileNode] = useState<FileNode>();

  const [filterName, setFilterName] = useState<string>();

  const workingDirName = useMemo(() => {
    return workingDir ? workingDir.split('/').pop() : '';
  }, [workingDir]);

  const providerValue = useMemo(
    () => ({
      workingDir,
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

  const handlePathSet = (arg: unknown) => {
    const safeArg = z.string().safeParse(arg);
    if (!safeArg.success) {
      return;
    }
    setWorkingDir(safeArg.data);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('workspace:path', handlePathSet);
    window.electron.ipcRenderer.on('workspace:fileNode', handleRootDirSet);

    return () => {
      window.electron.ipcRenderer.off('workspace:path', handlePathSet);
      window.electron.ipcRenderer.off('workspace:fileNode', handleRootDirSet);
    };
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
