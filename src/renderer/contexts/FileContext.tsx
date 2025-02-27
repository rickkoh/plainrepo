import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FileNode } from '../../types/FileNode';
import { useWorkspaceContext } from './WorkspaceContext';

interface FileContextProps {
  fileNode?: FileNode;
  setFileNode: (fileNode: FileNode) => void;
}

const FileContext = createContext<FileContextProps | undefined>(undefined);

interface FileProviderProps {}

export default function FileProvider({
  children,
}: PropsWithChildren<FileProviderProps>) {
  const { fileNode } = useWorkspaceContext();

  const [currentFileNode, setCurrentFileNode] = useState<FileNode>();

  const setFileNode = (newFileNode: FileNode) => {
    window.electron.ipcRenderer.streamContent(newFileNode);
    setCurrentFileNode(newFileNode);
  };

  useEffect(() => {
    if (!fileNode) {
      return;
    }
    setFileNode(fileNode);
  }, [fileNode]);

  const providerValue = useMemo(
    () => ({
      fileNode: currentFileNode,
      setFileNode,
    }),
    [currentFileNode],
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
