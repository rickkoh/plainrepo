import { useEffect, useState } from 'react';
import { z } from 'zod';
import { RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestComponentCount() {
  const [tokenCount, setTokenCount] = useState(0);
  const [loading] = useState(false);

  // Set up event listener
  useEffect(() => {
    // Handle receiving token count from IPC
    const handleTokenCount = (payload: unknown) => {
      const newTokenCount = z.number().parse(payload);
      setTokenCount(newTokenCount);
    };

    window.electron.ipcRenderer.on('stream:token:estimate', handleTokenCount);

    return () => {
      window.electron.ipcRenderer.off(
        'stream:token:estimate',
        handleTokenCount,
      );
    };
  }, []);

  return (
    <div className="fixed top-10 right-10 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md flex items-center gap-2">
      <p className="font-medium">Token count: {tokenCount.toLocaleString()}</p>
      <RefreshCcw
        className={cn(
          'ml-2 h-4 w-4 text-blue-600 transition-opacity duration-300',
          {
            'animate-spin': loading,
            'opacity-0': !loading,
            'opacity-100': loading,
          },
        )}
      />
    </div>
  );
}
