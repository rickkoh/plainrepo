import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './Tailwind.css';
import { Button } from '@/components/ui/button';
import Explorer from './components/Explorer';
import FileProvider from './contexts/FileContext';
import Viewer from './components/Viewer';
import Toolbar from './components/Toolbar';

function Hello() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <FileProvider>
        <div className="flex flex-row w-full h-full">
          <Button onClick={() => console.log('Hello, world!')}>
            Hello, world!
          </Button>
          <Explorer />
          <Viewer />
          <Toolbar />
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
