import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Tailwind.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import Explorer from './components/Explorer';
import FileProvider from './contexts/FileContext';
import Viewer from './components/Viewer';
import Toolbar from './components/Toolbar';

function Hello() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <FileProvider>
        <div className="flex flex-row w-full h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel>
              <Explorer />
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
