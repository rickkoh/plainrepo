import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Tailwind.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import AppProvider from './contexts/AppContext';
import WorkingDirectoryProvider from './contexts/WorkspaceContext';
import TabsManagerProvider from './contexts/TabsManagerContext';
import TabsPanel from './components/Tabs/TabsPanel';

function Hello() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <AppProvider>
        <WorkingDirectoryProvider>
          <TabsManagerProvider>
            <div className="flex flex-row w-full h-full">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={15} maxSize={60}>
                  <Sidebar />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                  <TabsPanel />
                  <Toolbar />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </TabsManagerProvider>
        </WorkingDirectoryProvider>
      </AppProvider>
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
