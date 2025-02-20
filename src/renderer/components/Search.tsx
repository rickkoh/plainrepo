import { useCallback, useMemo, useState } from 'react';
import { BaseFileNode, FileNode } from '@/src/types/FileNode';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import { useFileContext } from '../contexts/FileContext';

interface MatchedFileNode extends BaseFileNode {
  indexPath: number[];
}

// Helper function
function updateFileNodeAtPath(
  node: FileNode,
  indexPath: number[],
  checked: CheckedState,
): FileNode {
  if (indexPath.length === 0) {
    return { ...node, selected: checked === 'indeterminate' ? false : checked };
  }

  const index = indexPath[0];
  if (!node.children || index >= node.children.length) {
    return node;
  }

  const newChildren = [...node.children];

  newChildren[index] = updateFileNodeAtPath(
    newChildren[index],
    indexPath.slice(1),
    checked,
  );

  const selected = newChildren.some((child) => child.selected);

  return { ...node, children: newChildren, selected };
}

export default function Search() {
  const { fileNode, setFileNode } = useFileContext();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectAll, setSelectAll] = useState<CheckedState>(false);

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
          child.type !== 'directory' &&
          child.name.toLowerCase().includes(searchQuery.toLowerCase()) // Search case-insensitive
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
  }, [fileNode, searchQuery]);

  const handleCheckboxChange = useCallback(
    (checked: CheckedState, matchedFileNode: MatchedFileNode) => {
      if (!fileNode) {
        return;
      }
      const updatedFileTree = updateFileNodeAtPath(
        fileNode,
        matchedFileNode.indexPath,
        checked,
      );
      setFileNode(updatedFileTree);
    },
    [fileNode, setFileNode],
  );

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
      <div>
        {filteredNodes && filteredNodes.length > 0 ? (
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
            {filteredNodes.map((matchedNode) => (
              <div
                key={matchedNode.path}
                className="flex flex-row items-center px-4 space-x-2 hover:bg-accent"
              >
                <Checkbox
                  id={matchedNode.path}
                  checked={matchedNode.selected}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked, matchedNode)
                  }
                />
                <label htmlFor={matchedNode.path}>{matchedNode.name}</label>
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
