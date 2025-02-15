import { cn } from '@/lib/utils';
import {
  AppSettings,
  AppSettingsSchema,
  ExcludeList,
  ReplaceList,
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
  exclude: ExcludeList;
  setExclude: (excludeList: ExcludeList) => void;
  replace: ReplaceList;
  setReplace: (replaceList: ReplaceList) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {}

export default function AppProvider({
  children,
}: PropsWithChildren<AppProviderProps>) {
  const appSettings = useRef<AppSettings>();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [exclude, _setExclude] = useState<ExcludeList>([]);
  const [replace, _setReplace] = useState<ReplaceList>([]);

  const toggleDarkMode = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('toggle-dark-mode', !isDarkMode);
    setIsDarkMode((prev) => !prev);
  }, [isDarkMode]);

  const setExclude = (newExcludeList: ExcludeList) => {
    _setExclude(newExcludeList);
    appSettings.current = { ...appSettings.current, exclude: newExcludeList };
    window.electron.ipcRenderer.sendMessage(
      'set-app-settings',
      appSettings.current,
    );
  };

  const setReplace = (newReplaceList: ReplaceList) => {
    _setReplace(newReplaceList);
    appSettings.current = { ...appSettings.current, replace: newReplaceList };
    window.electron.ipcRenderer.sendMessage(
      'set-app-settings',
      appSettings.current,
    );
  };

  const providerValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      exclude,
      setExclude,
      replace,
      setReplace,
    }),
    [exclude, replace, isDarkMode, toggleDarkMode],
  );

  useEffect(() => {
    window.electron.ipcRenderer
      .readUserData()
      .then((userData) => {
        const tempUserData = AppSettingsSchema.parse(userData);
        appSettings.current = tempUserData;
        setIsDarkMode(tempUserData.darkMode ?? false);
        _setExclude(tempUserData.exclude ?? []);
        _setReplace(tempUserData.replace ?? []);
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
