import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Tailwind.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import FileProvider from './contexts/FileContext';
import Viewer from './components/Viewer';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';

function Hello() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-background text-foreground">
      <FileProvider>
        <div className="flex flex-row w-full h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={15} maxSize={60}>
              <Sidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <Viewer />
              <Toolbar />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </FileProvider>
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
