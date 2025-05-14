import { FileNode } from '../../types/FileNode';

/**
 * Search for the `targetNode` by path within `fileNode` and return the `targetNode's` reference
 *
 * @param fileNode - The file node to search in
 * @param searchPath - The path to search for
 * @returns The file node if found, otherwise null
 */
export function searchFileNode(
  fileNode: FileNode,
  searchPath: string,
): FileNode | null {
  if (fileNode.path === searchPath) {
    return fileNode;
  }

  if (fileNode.type === 'directory' && fileNode.children) {
    for (let i = 0; i < fileNode.children.length; i += 1) {
      const child = fileNode.children[i];
      const result = searchFileNode(child, searchPath);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Flattens a FileNode tree into a flat array of nodes.
 *
 * @param fileNode The file node (root of the tree) to process.
 * @returns An array containing all nodes from the tree.
 * @complexity O(n)
 */
export function flattenFileNode(
  fileNode: FileNode,
  options: { selectedOnly?: boolean } = {
    selectedOnly: false,
  },
): FileNode[] {
  const result: FileNode[] = [];
  function flatten(node: FileNode) {
    if (
      node.type === 'directory' &&
      node.children &&
      node.children.length > 0
    ) {
      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        flatten(child);
      }
    } else if (node.type === 'file') {
      if (options.selectedOnly && !node.selected) {
        return;
      }

      result.push(node);
    }
  }
  flatten(fileNode);
  return result;
}

/**
 * Toggles the selection state of a file node and all its children
 * Also updates parent selection states based on children
 *
 * @param rootNode The root file node to traverse
 * @param targetPath The path of the node to toggle
 * @param selected The selection state to set
 * @returns A boolean indicating if any node was toggled
 */
export function toggleFileNodeSelection(
  rootNode: FileNode,
  targetPath: string,
  selected: boolean,
): boolean {
  const toggleChildrenSelection = (node: FileNode, isSelected: boolean) => {
    if (!node.children) return;

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      child.selected = isSelected;

      if (child.type === 'directory' && child.children) {
        toggleChildrenSelection(child, isSelected);
      }
    }
  };

  const findAndToggle = (node: FileNode): boolean => {
    if (node.path === targetPath) {
      node.selected = selected;

      if (node.type === 'directory' && node.children) {
        toggleChildrenSelection(node, selected);
      }

      return true;
    }

    if (node.type === 'directory' && node.children) {
      for (let i = 0; i < node.children.length; i += 1) {
        if (findAndToggle(node.children[i])) {
          // Update parent selection based on children's selection state
          node.selected = node.children.some((child) => child.selected);
          return true;
        }
      }
    }

    return false;
  };

  return findAndToggle(rootNode);
}

export function toggleFlatFileNodeSelection(
  fileNodeList: FileNode[],
  targetPath: string,
  selected: boolean,
) {
  for (let i = 0; i < fileNodeList.length; i += 1) {
    const fileNode = fileNodeList[i];
    if (targetPath.includes(fileNode.path)) {
      fileNode.selected = selected;
    }
  }
}

/**
 * Resets selection for all nodes in the tree
 *
 * @param rootNode The root file node to reset selection for
 */
export function resetSelection(rootNode: FileNode) {
  if (!rootNode) return;

  toggleFileNodeSelection(rootNode, rootNode.path, false);
}
