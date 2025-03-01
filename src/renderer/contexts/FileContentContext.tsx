import { FileContent } from '@/src/types/FileContent';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from 'react';

/**
 * Each tab will still maintain their version of file node with all the selected files
 * When we select new files O(n), we will send that back to the backend
 * The backend will flatten it O(n)
 * Then it will chunk it O(n)
 * Then it will discover the file nodes content O(n)
 * Then it will send it back to the frontend chunk by chunk
 * The operations must can be done either through: ADD_FILE_CONTENT O(nlogn), REMOVE_FILE_CONTENT O(n), SET_FILE_CONTENT O(n), CLEAR_FILE_CONTENT O(1)
 * fileContent will be the state that will be used to for other components to render the content of the files
 * Total time complexity: O(n + n + n + n + nlogn) or O(n + n + n + n) or O(n + n + n + n) or O(n + n + n + 1) which is O(nlogn)
 * REndering will be handled using virtualization
 * TODO NEXT: Make it a single tabbed application
 */

// Define the state interface
interface State {
  fileContents: FileContent[];
}

// Define action types
type Action =
  | { type: 'ADD_FILE_CONTENT'; payload: FileContent[] }
  // | { type: 'REMOVE_FILE_CONTENT'; payload: string[] }
  // | {
  //     type: 'SET_FILE_CONTENT';
  //     payload: FileContent[];
  //   }
  | { type: 'CLEAR_FILE_CONTENT' };

interface FileContentContextProps {
  fileContents: FileContent[];
}

const FileContentContext = createContext<FileContentContextProps | undefined>(
  undefined,
);

// Helper function to sort files by path
const sortFilesByPath = (files: FileContent[]): FileContent[] => {
  return [...files].sort((a, b) => a.path.localeCompare(b.path));
};

// Helper function to add files efficiently using a Map for O(1) lookup
const addFilesToState = (
  currentFiles: FileContent[],
  newFiles: FileContent[],
): FileContent[] => {
  const filesMap = new Map<string, FileContent>();

  // Add existing files to map
  for (let i = 0; i < currentFiles.length; i += 1) {
    filesMap.set(currentFiles[i].path, currentFiles[i]);
  }

  // Add or update with new files
  for (let i = 0; i < newFiles.length; i += 1) {
    filesMap.set(newFiles[i].path, newFiles[i]);
  }

  // Convert map back to array and sort
  return sortFilesByPath(Array.from(filesMap.values()));
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_FILE_CONTENT': // O(n log n) due to sorting
      return {
        fileContents: addFilesToState(state.fileContents, action.payload),
      };

    // case 'REMOVE_FILE_CONTENT': // O(n) to filter + create new array
    //   return {
    //     fileContents: state.fileContents.filter(
    //       (file) => !action.payload.includes(file.path),
    //     ),
    //   };

    // case 'SET_FILE_CONTENT': // O(n log n) due to sorting
    //   return {
    //     fileContents: sortFilesByPath(action.payload),
    //   };

    case 'CLEAR_FILE_CONTENT':
      return {
        fileContents: [],
      };

    default:
      return state;
  }
}

interface FileContentProviderProps {}

export default function FileContentProvider({
  children,
}: PropsWithChildren<FileContentProviderProps>) {
  const [state, dispatch] = useReducer(reducer, { fileContents: [] });

  // Set up the electron IPC listener
  useEffect(() => {
    const handler = (action: unknown) => {
      // @ts-ignore
      dispatch(action);
    };

    window.electron.ipcRenderer.on('stream:content', handler);

    return () => {
      window.electron.ipcRenderer.off('stream:content', handler);
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const providerValue = useMemo(
    () => ({
      fileContents: state.fileContents,
    }),
    [state.fileContents],
  );

  return (
    <FileContentContext.Provider value={providerValue}>
      {children}
    </FileContentContext.Provider>
  );
}

export function useFileContentContext() {
  const context = useContext(FileContentContext);
  if (!context) {
    throw new Error(
      'useFileContentContext must be used within a FileContentProvider',
    );
  }
  return context;
}
