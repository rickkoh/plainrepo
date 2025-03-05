import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';
import { selectDarkMode } from '../redux/selectors/appSelectors';
import { useAppSelector } from '../redux/hooks';

interface ThemeProps {}

export default function MainTheme({ children }: PropsWithChildren<ThemeProps>) {
  const isDarkMode = useAppSelector(selectDarkMode);

  return (
    <main
      className={cn(
        'relative w-full h-screen overflow-hidden',
        'bg-background text-foreground',
        'transition-all duration-200',
        isDarkMode && 'dark',
      )}
    >
      {children}
    </main>
  );
}
