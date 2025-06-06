import React, { useCallback, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useAppSelector } from '../redux/hooks';
import { selectFileContents } from '../redux/selectors/fileContentsSelectors';
import { selectDirectoryTree } from '../redux/selectors/filesSelectors';

const LINE_HEIGHT = 24;
const HEADER_FOOTER = 48;
const GAP = 24;

export default function FileContent() {
  const directoryTree = useAppSelector(selectDirectoryTree);

  const fileContents = useAppSelector(selectFileContents);

  const listRef = useRef<List>(null);

  // Calculate item size based on number of lines
  const getItemSize = (index: number) => {
    const fileContent = fileContents[index];
    if (!fileContent) {
      return 0;
    }

    let contentLines = fileContent.content.split('\n').length;

    if (index === 0 && directoryTree) {
      contentLines += directoryTree.split('\n').length - 1;
    }

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
    return (
      <div className="flex flex-col h-full bg-background p-6 text-muted-foreground justify-center items-center">
        <p className="text-center">
          Select a file from the explorer to view its content.
        </p>
      </div>
    );
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
          overscanCount={2}
        >
          {ItemRenderer}
        </List>
      )}
    </AutoSizer>
  );
}
