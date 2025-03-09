import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Tailwind.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/sonner';

import { Provider } from 'react-redux';
import { store } from './redux/store';

import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import FileContent from './components/FileContent';

import MainTheme from './components/Theme';
import { setupElectronListeners } from './redux/electronMiddleware';
import { loadAppSettings } from './redux/slices/appSlice';
import { useAppDispatch } from './redux/hooks';

setupElectronListeners(store);

function Hello() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAppSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainTheme>
      <div className="flex flex-row w-full h-full">
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
      <Toaster position="top-right" />
    </MainTheme>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
        </Routes>
      </Router>
    </Provider>
  );
}
