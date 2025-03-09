import { FileNode } from '@/src/types/FileNode';

export type SavedMap = Map<string, FileNode>;

/**
 * Builds a map from file path to FileNode for all nodes in the saved tree.
 * This allows quick lookups when reconciling.
 */
export function buildSavedMap(saved: FileNode): SavedMap {
  const map = new Map<string, FileNode>();
  function traverse(node: FileNode) {
    map.set(node.path, node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  traverse(saved);
  return map;
}

/**
 * Reconciles the current file tree with the saved state.
 *
 * For each node in the current tree, if there’s a corresponding node in the saved state,
 * it preserves the saved “selected” flag; otherwise, it defaults to false.
 *
 * @param current - The up-to-date file node from the current scan.
 * @param savedMap - A Map built from the saved file tree.
 * @returns A new FileNode tree with reconciled “selected” states.
 */
export default function reconcileFileNode(
  current: FileNode,
  savedMap: SavedMap,
): FileNode {
  // Look up the current node in the saved map by its unique path.
  const savedNode = savedMap.get(current.path);
  const selected = savedNode ? savedNode.selected : false;
  // const content = savedNode ? savedNode.content : undefined;
  const lastSynced = savedNode ? savedNode.lastSynced : undefined;

  let reconciledChildren: FileNode[] | undefined;
  if (current.children && current.children.length > 0) {
    // Recursively reconcile each child.
    reconciledChildren = current.children.map((child) =>
      reconcileFileNode(child, savedMap),
    );
  }

  return {
    ...current,
    selected,
    // content,
    lastSynced,
    children: reconciledChildren,
  };
}
