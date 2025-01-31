/**
 * Show directory structure
 * Show number of tokens
 * Copy button
 * @returns Toolbar
 */

import { cn } from '@/lib/utils';
import { useCopyToClipboard } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { useFileContext } from '../contexts/FileContext';

export default function Toolbar() {
  const { autoSync, setAutoSync, content, tokenCount } = useFileContext();

  const [, copy] = useCopyToClipboard();

  return (
    <div className="fixed bottom-8 right-8">
      <div className="flex flex-row gap-4 p-2 bg-accent rounded-md justify-center">
        <button type="button" className="px-2 py-1">
          {tokenCount} Tokens
        </button>
        <button
          type="button"
          className={cn('px-2 py-1')}
          onClick={() => {
            setAutoSync(!autoSync);
          }}
        >
          Autosync {autoSync ? 'on' : 'off'}
        </button>
        <Button
          variant="default"
          type="button"
          className="px-2 py-1"
          onClick={() => {
            if (content) {
              copy(content);
            }
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
}
