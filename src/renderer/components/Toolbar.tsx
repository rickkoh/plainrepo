/**
 * Show directory structure
 * Show number of tokens
 * Copy button
 * @returns Toolbar
 */

import { cn } from '@/lib/utils';
import { useCopyToClipboard, useDebounceCallback } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useFileContext } from '../contexts/FileContext';

export default function Toolbar() {
  const { fileNode, directoryStructure, content, tokenCount } =
    useFileContext();

  const [, copy] = useCopyToClipboard();

  const [isHovering, setIsHovering] = useState(false);

  const [actualTokenCount, setActualTokenCount] = useState(0);

  const delayedHoverOn = useDebounceCallback(() => {
    setIsHovering(true);
  }, 420);

  const delayedHoverOff = useDebounceCallback(() => {
    setIsHovering(false);
  }, 420);

  const copyEverything = async () => {
    const everything = (await Promise.all([directoryStructure, content])).join(
      '\n',
    );
    copy(everything);
  };

  const copyContent = async () => {
    copy(await content);
  };

  const copyDirectoryTree = async () => {
    copy(await directoryStructure);
  };

  const getActualTokenCount = useCallback(async () => {
    const resolvedTokenCount = await tokenCount;
    setActualTokenCount(resolvedTokenCount);
  }, [tokenCount]);

  useEffect(() => {
    getActualTokenCount();
  }, [getActualTokenCount]);

  if (!fileNode) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8">
      <div className="flex flex-row justify-center gap-4 p-2 rounded-md bg-accent">
        <button type="button" className="px-2 py-1">
          {actualTokenCount} Tokens
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
              copyEverything();
              toast('Copied everything');
              delayedHoverOn.cancel();
              setIsHovering(false);
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
              copyEverything();
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
              copyContent();
              setIsHovering(false);
              toast('Copied contents only');
              delayedHoverOn.cancel();
            }}
          >
            Copy Content
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
              copyDirectoryTree();
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
