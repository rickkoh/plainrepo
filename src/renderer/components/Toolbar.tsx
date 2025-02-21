/**
 * Show directory structure
 * Show number of tokens
 * Copy button
 * @returns Toolbar
 */

import { cn } from '@/lib/utils';
import { useCopyToClipboard, useDebounceCallback } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

import { useWorkspaceContext } from '../contexts/WorkspaceContext';
import { useFileContext } from '../contexts/FileContext';

export default function Toolbar() {
  const { autoSync, setAutoSync } = useWorkspaceContext();
  const { fileNode, content, tokenCount } = useFileContext();

  const [, copy] = useCopyToClipboard();

  const [isHovering, setIsHovering] = useState(false);

  const delayedHoverOn = useDebounceCallback(() => {
    setIsHovering(true);
  }, 420);

  const delayedHoverOff = useDebounceCallback(() => {
    setIsHovering(false);
  }, 420);

  if (!fileNode) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8">
      <div className="flex flex-row justify-center gap-4 p-2 rounded-md bg-accent">
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
        <div
          className="relative"
          onMouseEnter={() => {
            delayedHoverOff.cancel();
            delayedHoverOn();
          }}
          onMouseLeave={() => {
            delayedHoverOn.cancel();
            delayedHoverOff();
          }}
        >
          <Button
            variant="default"
            type="button"
            className="flex px-2 py-1"
            onClick={() => {
              if (content) {
                copy(content);
                toast('Copied everything');
                delayedHoverOn.cancel();
                setIsHovering(false);
              } else {
                toast.error('Nothing to copy');
              }
            }}
          >
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'px-2 py-1 mb-2 hover:bg-primary hover:text-primary-foreground',
              'absolute right-0 flex h-full w-fit bottom-0 -z-10',
              'transition-all duration-300',
              isHovering ? 'visible' : 'invisible',
            )}
            style={{ marginBottom: isHovering ? `54px` : `0` }}
            onClick={() => {
              // TODO: Copy everything
              toast('Copied everything');
              delayedHoverOn.cancel();
              setIsHovering(false);
            }}
          >
            Copy Everything
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'px-2 py-1 mb-2 hover:bg-primary hover:text-primary-foreground',
              'absolute right-0 flex h-full w-fit bottom-0 -z-10',
              'transition-all duration-300',
              isHovering ? 'visible' : 'invisible',
            )}
            style={{ marginBottom: isHovering ? `100px` : '0px' }}
            onClick={() => {
              // TODO: Copy contents only
              setIsHovering(false);
              toast('Copied contents only');
              delayedHoverOn.cancel();
            }}
          >
            Copy Contents Only
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'px-2 py-1 mb-2 hover:bg-primary hover:text-primary-foreground',
              'absolute right-0 flex h-full w-fit bottom-0 -z-10',
              'transition-all duration-300',
              isHovering ? 'visible' : 'invisible',
            )}
            style={{ marginBottom: isHovering ? `146px` : '0px' }}
            onClick={() => {
              // TODO: Copy directory tree
              setIsHovering(false);
              toast('Copied directory tree');
              delayedHoverOn.cancel();
            }}
          >
            Copy Directory Tree
          </Button>
        </div>
      </div>
    </div>
  );
}
