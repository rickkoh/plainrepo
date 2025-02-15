import { useCallback, useState } from 'react';
import { BaseFileNode, FileNode } from '@/src/types/FileNode';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';

import { useFileContext } from '../contexts/FileContext';

interface SearchedFileNode extends BaseFileNode {
  numberPath: number[];
}

export default function Search() {
  const { fileNode, setFileNode } = useFileContext();

  const [filterName, _setFilterName] = useState<string>('');

  const [searchedFileNodes, setSearchedFileNodes] =
    useState<SearchedFileNode[]>();

  const [selectAll, setSelectAll] = useState<CheckedState>(false);

  const setFilterName = useCallback(
    (tempFilterName: string) => {
      _setFilterName(tempFilterName);

      if (tempFilterName === '') {
        setSearchedFileNodes([]);
        return;
      }

      if (fileNode === undefined) {
        return;
      }

      const tempSearchedFileNodes: SearchedFileNode[] = [];

      const traverse = async (node: FileNode, numberPath: number[]) => {
        if (node.children === undefined) {
          return;
        }

        node.children.forEach(async (child, i) => {
          const tempNumberPath = [...numberPath, i];

          if (
            child.type !== 'directory' &&
            child.name.toLowerCase().includes(tempFilterName.toLowerCase())
          ) {
            const searchedFileNode: SearchedFileNode = {
              ...child,
              numberPath: tempNumberPath,
            };
            tempSearchedFileNodes.push(searchedFileNode);
          }

          await traverse(child, tempNumberPath);
        });
      };

      traverse(fileNode, []);
      setSearchedFileNodes(tempSearchedFileNodes);
    },
    [fileNode],
  );

  const handleOnCheckedChange = useCallback(
    (
      checked: CheckedState,
      index: number,
      searchedFileNode: SearchedFileNode,
    ) => {
      if (searchedFileNodes === undefined) {
        return;
      }

      const newSearchedFileNodes = [...searchedFileNodes];
      newSearchedFileNodes[index].selected =
        checked === 'indeterminate' ? false : checked;
      setSearchedFileNodes(newSearchedFileNodes);

      if (fileNode === undefined) {
        return;
      }

      let tempFileNode = fileNode;
      const { numberPath } = searchedFileNode;
      for (let i = 0; i < numberPath.length; i += 1) {
        if (
          tempFileNode.children === undefined ||
          numberPath[i] >= tempFileNode.children.length
        ) {
          return;
        }

        const child = tempFileNode.children[numberPath[i]];

        if (child === undefined) {
          return;
        }

        child.selected = checked === 'indeterminate' ? false : checked;

        tempFileNode = child;
      }
      setFileNode({ ...fileNode });
    },
    [fileNode, searchedFileNodes, setFileNode],
  );

  return (
    <div className="flex flex-col w-full h-full py-4 space-y-2 overflow-y-scroll">
      <p className="px-4 text-sm">Search</p>
      <div className="flex flex-col px-4 space-y-2">
        <input
          className="px-1 border bg-background text-foreground placeholder:text-foreground border-accent focus:rounded-none"
          placeholder="Search for file"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>
      <div>
        {searchedFileNodes && searchedFileNodes.length > 0 ? (
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center px-4 space-x-2">
              <button
                type="button"
                className="text-sm border-b border-foreground"
                onClick={() => setSelectAll(selectAll)}
              >
                Select all
              </button>
            </div>
            {searchedFileNodes.map((searchedFileNode, index) => (
              <div
                key={searchedFileNode.path}
                className="flex flex-row items-center px-4 space-x-2 hover:bg-accent"
              >
                <Checkbox
                  id={searchedFileNode.path}
                  checked={searchedFileNode.selected}
                  onCheckedChange={(checked) =>
                    handleOnCheckedChange(checked, index, searchedFileNode)
                  }
                />
                <label htmlFor={searchedFileNode.path}>
                  {searchedFileNode.name}
                </label>
                <p className="text-sm text-muted-foreground">
                  {searchedFileNode.path}
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
