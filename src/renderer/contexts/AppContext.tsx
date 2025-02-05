import { cn } from '@/lib/utils';
import { UserDataSchema } from '@/src/types/UserData';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AppContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {}

export default function AppProvider({
  children,
}: PropsWithChildren<AppProviderProps>) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleDarkMode = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('toggle-dark-mode', !isDarkMode);
    setIsDarkMode((prev) => !prev);
  }, [isDarkMode]);

  const providerValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
    }),
    [isDarkMode, toggleDarkMode],
  );

  useEffect(() => {
    window.electron.ipcRenderer
      .readUserData()
      .then((userData) => {
        const tempUserData = UserDataSchema.parse(userData);
        setIsDarkMode(tempUserData.darkMode ?? false);
        return null;
      })
      .catch(() => {
        setIsDarkMode(false);
      });
    return () => {};
  }, []);

  return (
    <AppContext.Provider value={providerValue}>
      <div
        className={cn(
          'w-full h-full bg-background text-foreground',
          'transition-all duration-200',
          isDarkMode && 'dark',
        )}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
}
