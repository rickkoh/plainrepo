// File: src/renderer/App.tsx
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/sonner';

import { store, persistor } from './redux/store';

import './App.css';
import './Tailwind.css';

import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import FileContent from './components/FileContent';
import { setupElectronListeners } from './redux/electronMiddleware';
import TabBar from './components/TabBar';
import { useAppSelector } from './redux/hooks';
import { selectDarkMode } from './redux/selectors/appSelectors';
import { cn } from '@/lib/utils';

// Set up Electron IPC listeners when the app initializes
setupElectronListeners(store);

function MainLayout() {
  const isDarkMode = useAppSelector(selectDarkMode);
  return (
    <main
      className={cn(
        'relative w-full h-screen overflow-hidden',
        isDarkMode ? 'dark' : 'light',
      )}
    >
      <div className="flex flex-col w-full h-full">
        <TabBar />
        <div className="flex flex-row flex-1 w-full h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={20} maxSize={80}>
              <Sidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <FileContent />
              <Toolbar />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <Toaster position="top-right" />
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />} />
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}
