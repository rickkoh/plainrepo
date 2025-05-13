import {
  useState,
  useCallback,
  useRef,
  ChangeEvent,
  CSSProperties,
} from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Folder, Loader2 } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectWorkingDir } from '../redux/selectors/workspaceSelectors';

const ITEM_HEIGHT = 36;

export default function Search() {
  const workingDir = useAppSelector(selectWorkingDir);
  const searchResults = useAppSelector((state) => state.files.searchResults);
  const isSearching = useAppSelector((state) => state.files.isSearching);

  const dispatch = useAppDispatch();
  const listRef = useRef<List>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFiles, setShowFiles] = useState<boolean>(true);
  const [showFolders, setShowFolders] = useState<boolean>(true);

  const debouncedSearch = useDebounceCallback((value: string) => {
    if (value.trim() && workingDir) {
      dispatch({
        type: 'search/searchFiles',
        payload: {
          searchTerm: value,
          includeFiles: showFiles,
          includeDirs: showFolders,
        },
      });
    }
  }, 300);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const getItemKey = useCallback(
    (index: number) => searchResults[index]?.path || index.toString(),
    [searchResults],
  );

  const ItemRenderer = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const matchedNode = searchResults[index];
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
              window.electron.ipcRenderer.sendMessage('fileNode:select', {
                path: matchedNode.path,
                selected: checked === true,
              });
            }}
          />
          <label htmlFor={matchedNode.path}>{matchedNode.name}</label>
          {matchedNode.type === 'directory' ? (
            <Folder size={16} className="shrink-0 text-muted-foreground" />
          ) : (
            <File size={16} className="shrink-0 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {workingDir
              ? matchedNode.path.slice(workingDir.length)
              : matchedNode.path}
          </p>
        </div>
      );
    },
    [searchResults, workingDir],
  );

  const handleShowFilesToggle = () => {
    const newValue = !showFiles;
    setShowFiles(newValue);

    if (searchQuery.trim()) {
      dispatch({
        type: 'search/searchFiles',
        payload: {
          searchTerm: searchQuery,
          includeFiles: newValue,
          includeDirs: showFolders,
        },
      });
    }
  };

  const handleShowFoldersToggle = () => {
    const newValue = !showFolders;
    setShowFolders(newValue);

    if (searchQuery.trim()) {
      dispatch({
        type: 'search/searchFiles',
        payload: {
          searchTerm: searchQuery,
          includeFiles: showFiles,
          includeDirs: newValue,
        },
      });
    }
  };

  const renderSearchContent = () => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm">Searching...</span>
        </div>
      );
    }

    if (!searchQuery.trim()) {
      return <p className="px-4 text-sm">Enter a search term</p>;
    }

    if (!searchResults?.length) {
      return <p className="px-4 text-sm">No results found</p>;
    }

    return (
      <div className="h-full w-full">
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              height={height}
              width={width}
              itemCount={searchResults.length}
              itemSize={() => ITEM_HEIGHT}
              itemKey={getItemKey}
              overscanCount={5}
            >
              {ItemRenderer}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  };

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
          onClick={handleShowFilesToggle}
        >
          Files
        </button>
        <button
          type="button"
          className={cn(
            'text-sm border-b border-muted-foreground text-muted-foreground',
            showFolders && 'text-foreground border-foreground',
          )}
          onClick={handleShowFoldersToggle}
        >
          Folders
        </button>
      </div>
      <div className="flex-1">{renderSearchContent()}</div>
    </div>
  );
}
