import { useCallback, useState } from 'react';
import { BaseFileNode, FileNode } from '@/src/types/FileNode';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';

import { useFileContext } from '../contexts/FileContext';

/**
 * When you change the filter string, we can't necessary remove the fileNode from the tree because it might be selected.
 * Even if it is not selected, we can't remove it because it might be a parent of a selected node.
 * 1.
 * We can have a separate fileNode, and then as we search, we build the second file node, or just a flatlist with the path to the node.
 * And then if someone selects it, we traverse our main node and select all the nodes in the path.
 * To do this, we need to have the path of the node in the nodeitself.
 * The path is from the root, then the children, we need to specify the index of the child.
 * Traverse until we finally get to the node.
 * 2. instead of making it flat, we render the tree for only those nodes that match the filter.
 * Then again, if we do this, we also have to expand all the nodes.
 * Only those nodes who itself or their children match the filter will be shown.
 *
 * In terms of User Experience, which option is better?
 */

interface SearchedFileNode extends BaseFileNode {
  numberPath: number[];
}

export default function Search() {
  const { fileNode, setFileNode } = useFileContext();

  const [filterName, _setFilterName] = useState<string>();

  const [searchedFileNodes, setSearchedFileNodes] =
    useState<SearchedFileNode[]>();

  const setFilterName = useCallback(
    (tempFilterName: string) => {
      _setFilterName(tempFilterName);

      if (tempFilterName === '') {
        setSearchedFileNodes(undefined);
        return;
      }

      if (fileNode === undefined) {
        return;
      }

      const tempSearchedFileNodes: SearchedFileNode[] = [];

      const traverse = (node: FileNode, numberPath: number[]) => {
        if (node.children === undefined) {
          return;
        }

        for (let i = 0; i < node.children.length; i += 1) {
          const child = node.children[i];
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

          traverse(child, tempNumberPath);
        }
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
    <div className="w-full h-full pt-4 flex flex-col space-y-2">
      <p className="px-4 text-sm">Search</p>
      <div className="flex flex-col space-y-2 px-4">
        <input
          className="border border-foreground focus:rounded-none"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        {searchedFileNodes && searchedFileNodes.length > 0 ? (
          searchedFileNodes.map((searchedFileNode, index) => (
            <div
              key={searchedFileNode.name}
              className="flex flex-row items-center space-x-2 hover:bg-accent px-4"
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
            </div>
          ))
        ) : (
          <p className="px-4 text-sm">No results found</p>
        )}
      </div>
    </div>
  );
}
