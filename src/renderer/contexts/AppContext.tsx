import { cn } from '@/lib/utils';
import {
  AppSettings,
  AppSettingsSchema,
  Exclude,
} from '@/src/types/AppSettings';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface AppContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  exclude: Exclude;
  setExclude: (excludeList: Exclude) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {}

export default function AppProvider({
  children,
}: PropsWithChildren<AppProviderProps>) {
  const appSettings = useRef<AppSettings>();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [exclude, _setExclude] = useState<Exclude>([]);

  const toggleDarkMode = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('toggle-dark-mode', !isDarkMode);
    setIsDarkMode((prev) => !prev);
  }, [isDarkMode]);

  const setExclude = useCallback(
    (newExclude: Exclude) => {
      _setExclude(newExclude);
      appSettings.current = { ...appSettings.current, exclude: newExclude };
      console.log('called and sending message');
      window.electron.ipcRenderer.sendMessage(
        'set-app-settings',
        appSettings.current,
      );
    },
    [_setExclude],
  );

  const providerValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      exclude,
      setExclude,
    }),
    [exclude, isDarkMode, setExclude, toggleDarkMode],
  );

  useEffect(() => {
    window.electron.ipcRenderer
      .readUserData()
      .then((userData) => {
        const tempUserData = AppSettingsSchema.parse(userData);
        setIsDarkMode(tempUserData.darkMode ?? false);
        _setExclude(tempUserData.exclude ?? []);
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
