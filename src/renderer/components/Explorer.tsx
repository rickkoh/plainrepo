// File: src/renderer/components/Explorer.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateFileSelection } from '../redux/slices/filesSlice';
import { FileNode } from '../../types/FileNode';
import { toggleFileSelectionInTab } from '../redux/slices/tabsSlice';
import { selectActiveTabId } from '../redux/selectors/tabsSelectors';
import { openDirectory, streamContent } from '../redux/slices/workspaceSlice';
import {
  selectFileNode,
  selectWorkingDir,
} from '../redux/selectors/workspaceSelector';

function TreeNode({
  fileNode,
  level = 1,
}: {
  fileNode: FileNode;
  level?: number;
}) {
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const [open, setOpen] = useState<CheckedState>(level === 1 || false);

  const handleCheckboxChange = (checked: CheckedState) => {
    if (!activeTabId) return;

    // Update the file selection in the Redux store
    dispatch(
      updateFileSelection({
        path: fileNode.path,
        selected: checked === true,
      }),
    );

    // Update the tab selection
    dispatch(
      toggleFileSelectionInTab({
        tabId: activeTabId,
        filePath: fileNode.path,
      }),
    );
  };

  return (
    <div key={fileNode.path} className="flex flex-col">
      <div
        className="flex flex-row items-center space-x-2 hover:bg-accent"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <button
          type="button"
          className={cn(
            fileNode.type === 'file' && 'opacity-0 pointer-events-none',
          )}
          onClick={() => setOpen(!open)}
        >
          <ChevronRight className={cn(open && 'rotate-90')} />
        </button>
        <Checkbox
          id={fileNode.path}
          checked={fileNode.selected || false}
          onCheckedChange={handleCheckboxChange}
        />
        <Label
          htmlFor={fileNode.path}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {fileNode.name}
        </Label>
      </div>

      <div className="flex flex-col gap-4">
        {fileNode.type === 'directory' && open && (
          <div>
            {fileNode.children &&
              fileNode.children.map((child) => (
                <TreeNode key={child.path} fileNode={child} level={level + 1} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Explorer() {
  const dispatch = useAppDispatch();
  const workingDir = useAppSelector(selectWorkingDir);
  const fileNode = useAppSelector(selectFileNode);

  const handleClick = () => {
    dispatch(openDirectory());
  };

  const handleStreamContent = () => {
    if (fileNode) {
      dispatch(streamContent(fileNode));
    }
  };

  return (
    <div className="flex flex-col items-start w-full h-full max-h-screen pt-4 overflow-hidden bg-background">
      <pre className="px-4 whitespace-nowrap text-sm">
        Explorer: {workingDir || 'No directory selected'}
      </pre>

      {fileNode && (
        <div className="w-full h-full py-4 overflow-x-scroll bg-background">
          <TreeNode fileNode={fileNode} />
          <Button className="mt-4 ml-4" onClick={handleStreamContent}>
            Refresh Content
          </Button>
        </div>
      )}

      {!fileNode && (
        <div className="flex flex-col gap-4 p-4">
          <Button
            type="button"
            className="px-4 py-2 text-primary-foreground bg-primary rounded-md"
            onClick={handleClick}
          >
            Open Folder
          </Button>
        </div>
      )}
    </div>
  );
}
