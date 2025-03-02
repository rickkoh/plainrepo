import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Tailwind.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/sonner';

import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import AppProvider from './contexts/AppContext';
import WorkspaceProvider from './contexts/WorkspaceContext';
import FileProvider from './contexts/FileContext';
import FileContent from './components/FileContent';
import FileContentProvider from './contexts/FileContentContext';
import DirectoryTreeProvider from './contexts/DirectoryTreeContext';
import TokenCountProvider from './contexts/TokenCountContext';

function Hello() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <AppProvider>
        <WorkspaceProvider>
          <FileProvider>
            <DirectoryTreeProvider>
              <FileContentProvider>
                <TokenCountProvider>
                  <div className="flex flex-row w-full h-full">
                    <ResizablePanelGroup direction="horizontal">
                      <ResizablePanel
                        defaultSize={30}
                        minSize={20}
                        maxSize={80}
                      >
                        <Sidebar />
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel>
                        {/* <TabsPanel /> */}
                        <FileContent />
                        <Toolbar />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </TokenCountProvider>
              </FileContentProvider>
            </DirectoryTreeProvider>
          </FileProvider>
        </WorkspaceProvider>
      </AppProvider>
      <Toaster position="top-right" />
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
