import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';
import { selectDarkMode } from '../redux/selectors/appSelectors';
import { useAppSelector } from '../redux/hooks';

interface AppProviderProps {}

export default function AppProvider({
  children,
}: PropsWithChildren<AppProviderProps>) {
  const isDarkMode = useAppSelector(selectDarkMode);

  return (
    <div
      className={cn(
        'w-full h-full bg-background text-foreground transition-all duration-200',
        isDarkMode && 'dark',
      )}
    >
      {children}
    </div>
  );
}
