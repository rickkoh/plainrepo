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
  useState,
} from 'react';

// Helper to update settings via IPC.
const updateAppSettings = (settings: AppSettings) => {
  window.electron.ipcRenderer.updateAppSettings(settings);
};

interface AppContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  shouldIncludeGitIgnore: boolean;
  setShouldIncludeGitIgnore: (shouldIncludeGitIgnore: boolean) => void;
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
  // Unified state for all app settings.
  const [appSettings, setAppSettings] = useState<AppSettings>({
    darkMode: false,
    exclude: [],
    replace: [],
  });

  // Update functions.
  const toggleDarkMode = useCallback(() => {
    const newSettings = { ...appSettings, darkMode: !appSettings.darkMode };
    setAppSettings(newSettings);
    updateAppSettings(newSettings);
  }, [appSettings]);

  const setShouldIncludeGitIgnore = useCallback(
    (shouldIncludeGitIgnore: boolean) => {
      const newSettings = {
        ...appSettings,
        shouldIncludeGitIgnore,
      };
      setAppSettings(newSettings);
      updateAppSettings(newSettings);
    },
    [appSettings],
  );

  const setExclude = useCallback(
    (newExclude: ExcludeList) => {
      const newSettings = { ...appSettings, exclude: newExclude };
      setAppSettings(newSettings);
      updateAppSettings(newSettings);
    },
    [appSettings],
  );

  const setReplace = useCallback(
    (newReplace: ReplaceList) => {
      const newSettings = { ...appSettings, replace: newReplace };
      setAppSettings(newSettings);
      updateAppSettings(newSettings);
    },
    [appSettings],
  );

  const isDarkMode = useMemo(
    () => appSettings.darkMode ?? false,
    [appSettings.darkMode],
  );

  const shouldIncludeGitIgnore = useMemo(
    () => appSettings.shouldIncludeGitIgnore ?? false,
    [appSettings.shouldIncludeGitIgnore],
  );

  const exclude = useMemo(
    () => appSettings.exclude ?? [],
    [appSettings.exclude],
  );

  const replace = useMemo(
    () => appSettings.replace ?? [],
    [appSettings.replace],
  );

  // Load initial settings on mount.
  useEffect(() => {
    window.electron.ipcRenderer
      .readAppSettings()
      .then((userData: unknown) => {
        const settings = AppSettingsSchema.parse(userData);
        setAppSettings(settings);
        return null;
      })
      .catch(() => {
        setAppSettings((prev) => ({ ...prev }));
      });
  }, []);

  // Memoize the provider value.
  const providerValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      shouldIncludeGitIgnore,
      setShouldIncludeGitIgnore,
      exclude,
      setExclude,
      replace,
      setReplace,
    }),
    [
      isDarkMode,
      toggleDarkMode,
      shouldIncludeGitIgnore,
      setShouldIncludeGitIgnore,
      exclude,
      setExclude,
      replace,
      setReplace,
    ],
  );

  return (
    <AppContext.Provider value={providerValue}>
      <div
        className={cn(
          'w-full h-full bg-background text-foreground transition-all duration-200',
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
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
