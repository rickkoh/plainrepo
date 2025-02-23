import { FileNode } from '@/src/types/FileNode';
import { useCallback, useEffect, useState } from 'react';

import { useFileContext } from '../../contexts/FileContext';

interface ContentProps {
  fileNode: FileNode;
}

function Content({ fileNode: fileContentNode }: ContentProps) {
  if (
    fileContentNode.type === 'directory' &&
    fileContentNode.children &&
    fileContentNode.children.length > 0 &&
    fileContentNode.selected
  ) {
    return (
      <div>
        {fileContentNode.children.map((child) => (
          <Content key={child.path} fileNode={child} />
        ))}
      </div>
    );
  }

  if (fileContentNode.selected) {
    return (
      <>
        <pre className="whitespace-pre-wrap">```{fileContentNode.name}</pre>
        <pre className="whitespace-pre-wrap">{fileContentNode.content}</pre>
        <pre className="whitespace-pre-wrap">```</pre>
        <br />
      </>
    );
  }

  return null;
}

function TabsContentArea() {
  const { fileNode, directoryStructure } = useFileContext();

  const [resolvedDirectoryTree, setResolvedDirectoryTree] = useState<string>();

  const getResolvedDirectoryTree = useCallback(async () => {
    const resolved = await directoryStructure;
    setResolvedDirectoryTree(resolved);
  }, [directoryStructure]);

  useEffect(() => {
    getResolvedDirectoryTree();
  }, [getResolvedDirectoryTree]);

  if (!fileNode) {
    return null;
  }

  return (
    <div className="w-full h-full p-8 py-2 overflow-scroll">
      <pre className="whitespace-pre-wrap">{resolvedDirectoryTree}</pre>
      <br />
      <Content fileNode={fileNode} />
    </div>
  );
}

export default TabsContentArea;
