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
  tokenCount: number;
}

// Define action types
type Action =
  | { type: 'SET_TOKEN_COUNT'; payload: number }
  | { type: 'INCREMENT_TOKEN_COUNT'; payload: number }
  | { type: 'RESET_TOKEN_COUNT' };

interface TokenCountContextProps {
  tokenCount: number;
}

const TokenCountContext = createContext<TokenCountContextProps | undefined>(
  undefined,
);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TOKEN_COUNT': // O(1)
      return {
        ...state,
        tokenCount: action.payload,
      };
    case 'INCREMENT_TOKEN_COUNT': // O(1)
      return {
        ...state,
        tokenCount: state.tokenCount + action.payload,
      };
    case 'RESET_TOKEN_COUNT': // O(1)
      return {
        ...state,
        tokenCount: 0,
      };
    default:
      return state;
  }
}

interface TokenCountProviderProps {}

export default function TokenCountProvider({
  children,
}: PropsWithChildren<TokenCountProviderProps>) {
  const [state, dispatch] = useReducer(reducer, { tokenCount: 0 });

  // Set up the electron IPC listener for token count updates
  useEffect(() => {
    const handler = (action: unknown) => {
      // @ts-ignore
      dispatch(action);
    };

    window.electron.ipcRenderer.on('stream:tokenCount', handler);

    return () => {
      window.electron.ipcRenderer.off('stream:tokenCount', handler);
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const providerValue = useMemo(
    () => ({
      tokenCount: state.tokenCount,
    }),
    [state.tokenCount],
  );

  return (
    <TokenCountContext.Provider value={providerValue}>
      {children}
    </TokenCountContext.Provider>
  );
}

export function useTokenCountContext() {
  const context = useContext(TokenCountContext);
  if (!context) {
    throw new Error(
      'useTokenCountContext must be used within a TokenCountProvider',
    );
  }
  return context;
}
