// File: src/renderer/components/Toolbar.tsx
import { betterNumberFormat, cn } from '@/lib/utils';
import { useCopyToClipboard, useDebounceCallback } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import TokenEstimator from '@/src/main/utils/TokenEstimator';
import { useAppSelector } from '../redux/hooks';
import { selectTokenCount } from '../redux/selectors/tokenCountSelectors';
import { selectDirectoryTree } from '../redux/selectors/directoryTreeSelectors';
import { selectAllFileContents } from '../redux/selectors/fileContentsSelectors';
import { selectCopyLimit } from '../redux/selectors/appSelectors';

export default function Toolbar() {
  const copyLimit = useAppSelector(selectCopyLimit);
  const directoryTree = useAppSelector(selectDirectoryTree);
  const fileContents = useAppSelector(selectAllFileContents);
  const tokenCount = useAppSelector(selectTokenCount);

  const [, copy] = useCopyToClipboard();
  const [isHovering, setIsHovering] = useState(false);

  const delayedHoverOn = useDebounceCallback(() => {
    setIsHovering(true);
  }, 420);

  const delayedHoverOff = useDebounceCallback(() => {
    setIsHovering(false);
  }, 420);

  const copyEverything = async () => {
    let content = '';
    content += `${directoryTree}\n`;

    for (let i = 0; i < fileContents.length; i += 1) {
      content += `\`\`\`${fileContents[i].name}\n${fileContents[i].content}\n\`\`\`\n\n`;
    }

    const estimated = TokenEstimator.estimateTokens(content);

    if (estimated <= copyLimit) {
      copy(content);
      toast('Copied everything');
    } else {
      toast(`Token count exceeds limit of ${betterNumberFormat(copyLimit)}`);
    }
    delayedHoverOn.cancel();
    setIsHovering(false);
  };

  const copyContent = async () => {
    let content = '';
    for (let i = 0; i < fileContents.length; i += 1) {
      content += `\`\`\`${fileContents[i].name}\n${fileContents[i].content}\n\`\`\`\n\n`;
    }

    const estimated = TokenEstimator.estimateTokens(content);

    if (estimated <= copyLimit) {
      copy(content);
      toast('Copied contents only');
    } else {
      toast(`Token count exceeds limit of ${betterNumberFormat(copyLimit)}`);
    }
    setIsHovering(false);
    delayedHoverOn.cancel();
  };

  const copyDirectoryTree = async () => {
    const estimated = TokenEstimator.estimateTokens(directoryTree);

    if (estimated <= copyLimit) {
      copy(directoryTree);
      toast('Copied directory tree');
    } else {
      toast(`Token count exceeds limit of ${betterNumberFormat(copyLimit)}`);
    }
    setIsHovering(false);
    delayedHoverOn.cancel();
  };

  return (
    <div className="fixed bottom-8 right-8">
      <div className="flex flex-row justify-center gap-4 p-2 rounded-md bg-accent">
        <button type="button" className="px-2 py-1">
          {tokenCount} Tokens
        </button>
        <button type="button" className="px-2 py-1">
          {betterNumberFormat(123)} Bytes
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
            }}
          >
            Copy Directory Tree
          </Button>
        </div>
      </div>
    </div>
  );
}
