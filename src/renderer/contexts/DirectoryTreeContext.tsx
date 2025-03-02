import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

// Define the state interface
interface State {
  directoryTree: string;
}

// Define action types
type Action = { type: 'SET_DIRECTORY_TREE'; payload: string };

interface DirectoryTreeContextProps {
  directoryTree: string;
}

const DirectoryTreeContext = createContext<
  DirectoryTreeContextProps | undefined
>(undefined);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DIRECTORY_TREE': // O(1)
      return {
        ...state,
        directoryTree: action.payload,
      };
    default:
      return state;
  }
}

interface DirectoryTreeProviderProps {}

export default function DirectoryTreeProvider({
  children,
}: PropsWithChildren<DirectoryTreeProviderProps>) {
  const [state, dispatch] = useReducer(reducer, { directoryTree: '' });

  // Set up the electron IPC listener for directory tree updates
  useEffect(() => {
    const handler = (action: unknown) => {
      // @ts-ignore
      dispatch(action);
    };

    window.electron.ipcRenderer.on('stream:directoryTree', handler);

    return () => {
      window.electron.ipcRenderer.off('stream:directoryTree', handler);
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const providerValue = useMemo(
    () => ({
      directoryTree: state.directoryTree,
    }),
    [state.directoryTree],
  );

  return (
    <DirectoryTreeContext.Provider value={providerValue}>
      {children}
    </DirectoryTreeContext.Provider>
  );
}

export function useDirectoryTreeContext() {
  const context = useContext(DirectoryTreeContext);
  if (!context) {
    throw new Error(
      'useDirectoryTreeContext must be used within a DirectoryTreeProvider',
    );
  }
  return context;
}
