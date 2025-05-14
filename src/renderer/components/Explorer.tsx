/* eslint-disable react/require-default-props */
/* eslint-disable no-console */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';

import { FileNode } from '../../types/FileNode';
import { useAppSelector } from '../redux/hooks';
import { selectWorkingDir } from '../redux/selectors/workspaceSelectors';
import { selectFileNode } from '../redux/selectors/filesSelectors';

function TreeNode({
  fileNode,
  isRoot = false,
  level = 1,
}: {
  fileNode: FileNode;
  isRoot?: boolean;
  level?: number;
}) {
  // const dispatch = useAppDispatch();

  const [open, setOpen] = useState<CheckedState>(isRoot ?? false);

  return (
    <div key={fileNode.path} className="flex flex-col">
      <div
        className="flex flex-row items-center space-x-2 hover:bg-accent whitespace-nowrap"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <button
          type="button"
          className={cn(
            fileNode.type === 'file' && 'opacity-0 pointer-events-none',
          )}
          onClick={() => {
            window.electron.ipcRenderer.sendMessage(`fileNode:update`, {
              path: fileNode.path,
              expanded: !open,
            });
            setOpen(!open);
          }}
        >
          <ChevronRight className={cn(open && 'rotate-90')} />
        </button>
        <Checkbox
          id={fileNode.path}
          checked={fileNode.selected}
          onCheckedChange={(checked) => {
            window.electron.ipcRenderer.sendMessage('fileNode:select', {
              path: fileNode.path,
              selected: checked === true,
            });
          }}
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

function Tree({ fileNode }: { fileNode: FileNode }) {
  return (
    <div className=" w-full h-full py-4 overflow-x-scroll bg-background ">
      <TreeNode fileNode={fileNode} isRoot />
    </div>
  );
}

export default function Explorer() {
  const workingDir = useAppSelector(selectWorkingDir);

  const fileNode = useAppSelector(selectFileNode);

  const handleClick = () => {
    window.electron.ipcRenderer.sendMessage('dialog:openDirectory');
  };

  return (
    <div className="flex flex-col items-start w-full h-full max-h-screen pt-4 overflow-hidden bg-background">
      <pre className="px-4 whitespace-nowrap text-sm">
        Explorer: {JSON.stringify(workingDir)}
      </pre>

      {fileNode && <Tree fileNode={fileNode} />}

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
