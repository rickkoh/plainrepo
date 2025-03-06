import {
  useMemo,
  useState,
  useCallback,
  useRef,
  ChangeEvent,
  CSSProperties,
} from 'react';
import { cn } from '@/lib/utils';
import { BaseFileNode, FileNode } from '@/src/types/FileNode';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Folder } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectFileNode } from '../redux/selectors/filesSelectors';
import { toggleFileNodeSelection } from '../redux/slices/filesSlice';
import { selectWorkingDir } from '../redux/selectors/workspaceSelectors';

interface MatchedFileNode extends BaseFileNode {
  indexPath: number[];
}

const ITEM_HEIGHT = 36;

export default function Search() {
  const workingDir = useAppSelector(selectWorkingDir);

  const dispatch = useAppDispatch();
  const fileNode = useAppSelector(selectFileNode);
  const listRef = useRef<List>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  const [showFiles, setShowFiles] = useState<boolean>(true);
  const [showFolders, setShowFolders] = useState<boolean>(true);

  const debouncedSearch = useDebounceCallback((value: string) => {
    setDebouncedSearchQuery(value);
  }, 300);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const filteredNodes = useMemo(() => {
    if (
      !debouncedSearchQuery ||
      debouncedSearchQuery.trim() === '' ||
      !fileNode
    ) {
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
          child.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) &&
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
  }, [fileNode, debouncedSearchQuery, showFiles, showFolders]);

  const getItemKey = useCallback(
    (index: number) => filteredNodes[index]?.path || index.toString(),
    [filteredNodes],
  );

  const ItemRenderer = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const matchedNode = filteredNodes[index];
      if (!matchedNode) return null;

      return (
        <div
          style={style}
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
            <Folder size={16} className="shrink-0 text-muted-foreground" />
          ) : (
            <File size={16} className="shrink-0 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {matchedNode.path.slice(workingDir?.length)}
          </p>
        </div>
      );
    },
    [filteredNodes, workingDir, dispatch],
  );

  return (
    <div className="flex flex-col w-full h-full py-4 space-y-2">
      <p className="px-4 text-sm">Search</p>
      <div className="flex flex-col px-4 space-y-2">
        <input
          className="px-1 border bg-background text-foreground placeholder:text-foreground border-accent focus:rounded-none"
          placeholder="Search for file"
          value={searchQuery}
          onChange={handleSearchChange}
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
      <div className="flex-1">
        {filteredNodes && filteredNodes.length > 0 ? (
          <div className="h-full w-full">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={filteredNodes.length}
                  itemSize={() => ITEM_HEIGHT}
                  itemKey={getItemKey}
                  overscanCount={5}
                >
                  {ItemRenderer}
                </List>
              )}
            </AutoSizer>
          </div>
        ) : (
          <p className="px-4 text-sm">No results found</p>
        )}
      </div>
    </div>
  );
}
