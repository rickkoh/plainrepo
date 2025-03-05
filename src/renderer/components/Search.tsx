import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { BaseFileNode, FileNode } from '@/src/types/FileNode';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Folder } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectFileNode } from '../redux/selectors/filesSelectors';
import { toggleFileNodeSelection } from '../redux/slices/filesSlice';

interface MatchedFileNode extends BaseFileNode {
  indexPath: number[];
}

export default function Search() {
  const dispatch = useAppDispatch();
  const fileNode = useAppSelector(selectFileNode);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showFiles, setShowFiles] = useState<boolean>(true);
  const [showFolders, setShowFolders] = useState<boolean>(true);

  const filteredNodes = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '' || !fileNode) {
      return [];
    }

    const matchingNodes: MatchedFileNode[] = [];

    const buildMatchingNodes = (node: FileNode, indexPath: number[]) => {
      if (!node.children) {
        return;
      }
      node.children.forEach((child, i) => {
        const childPath = [...indexPath, i];
        if (
          child.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          ((child.type === 'directory' && showFolders) ||
            (child.type === 'file' && showFiles))
        ) {
          const matchedNode: MatchedFileNode = {
            ...child,
            indexPath: childPath,
          };
          matchingNodes.push(matchedNode);
        }
        buildMatchingNodes(child, childPath);
      });
    };

    buildMatchingNodes(fileNode, []);
    return matchingNodes;
  }, [fileNode, searchQuery, showFiles, showFolders]);

  return (
    <div className="flex flex-col w-full h-full py-4 space-y-2 overflow-y-scroll">
      <p className="px-4 text-sm">Search</p>
      <div className="flex flex-col px-4 space-y-2">
        <input
          className="px-1 border bg-background text-foreground placeholder:text-foreground border-accent focus:rounded-none"
          placeholder="Search for file"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-row items-center px-4 space-x-2">
        <button
          type="button"
          className={cn(
            'text-sm border-b border-muted-foreground text-muted-foreground',
            showFiles && 'text-foreground border-foreground',
          )}
          onClick={() => setShowFiles(!showFiles)}
        >
          Files
        </button>
        <button
          type="button"
          className={cn(
            'text-sm border-b border-muted-foreground text-muted-foreground',
            showFolders && 'text-foreground border-foreground',
          )}
          onClick={() => setShowFolders(!showFolders)}
        >
          Folders
        </button>
      </div>
      <div>
        {filteredNodes && filteredNodes.length > 0 ? (
          <div className="flex flex-col space-y-2">
            {filteredNodes.map((matchedNode) => (
              <div
                key={matchedNode.path}
                className="flex flex-row items-center px-4 space-x-2 hover:bg-accent whitespace-nowrap flex-nowrap"
              >
                <Checkbox
                  id={matchedNode.path}
                  checked={matchedNode.selected}
                  onCheckedChange={(checked) => {
                    dispatch(
                      toggleFileNodeSelection({
                        path: matchedNode.path,
                        selected: checked === true,
                      }),
                    );
                  }}
                />
                <label htmlFor={matchedNode.path}>{matchedNode.name}</label>
                {matchedNode.type === 'directory' ? (
                  <Folder
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                ) : (
                  <File size={16} className="shrink-0 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {matchedNode.path}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 text-sm">No results found</p>
        )}
      </div>
    </div>
  );
}
