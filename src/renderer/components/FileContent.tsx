import React, { useCallback, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useFileContentContext } from '../contexts/FileContentContext';
import { useDirectoryTreeContext } from '../contexts/DirectoryTreeContext';

const LINE_HEIGHT = 24;
const HEADER_FOOTER = 48;
const GAP = 24;

export default function FileContent() {
  const { directoryTree } = useDirectoryTreeContext();
  const { fileContents } = useFileContentContext();
  const listRef = useRef<List>(null);

  // Reset the list cache whenever fileContents changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [fileContents]);

  // Calculate item size based on number of lines
  const getItemSize = (index: number) => {
    const fileContent = fileContents[index];
    if (!fileContent) {
      return 0;
    }

    let contentLines = fileContent.content.split('\n').length;

    if (index === 0) {
      contentLines += directoryTree.split('\n').length - 1;
    }

    // console.log(`Total number of lines for ${index} is ${contentLines}`);

    return contentLines * LINE_HEIGHT + HEADER_FOOTER + GAP;
  };

  const getItemKey = useCallback(
    (index: number) => fileContents[index]?.path || index.toString(),
    [fileContents],
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  function ItemRenderer({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) {
    const fileContent = fileContents[index];
    if (!fileContent) return null;

    return (
      <div style={style} className="px-4">
        <pre
          className="whitespace-pre font-mono text-base"
          style={{
            lineHeight: `${LINE_HEIGHT}px`,
          }}
        >
          {index === 0 && directoryTree}
          <br />
          ```{fileContent.name}
          <br />
          {fileContent.content}
          <br />
          ```
        </pre>
      </div>
    );
  }

  if (!fileContents || fileContents.length === 0) {
    return <div />;
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          height={height}
          width={width}
          itemCount={fileContents.length}
          itemSize={getItemSize}
          itemKey={getItemKey}
          overscanCount={3}
        >
          {ItemRenderer}
        </List>
      )}
    </AutoSizer>
  );
}
