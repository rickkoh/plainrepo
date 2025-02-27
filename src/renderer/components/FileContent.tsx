import React, { useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useFileContentContext } from '../contexts/FileContentContext';

// Constants for height calculation
const LINE_HEIGHT = 24; // Height of each line in pixels
const PADDING = 16; // Top/bottom padding for each item
const HEADER_FOOTER = 56; // Height for file name and closing backticks + margin

export default function FileContent() {
  const { fileContents } = useFileContentContext();
  const listRef = useRef<List>(null);

  // Calculate item size based on number of lines
  const getItemSize = (index: number) => {
    const fileContent = fileContents[index];
    if (!fileContent) return 100;

    const contentLines = fileContent.content.split('\n').length;

    return contentLines * LINE_HEIGHT + PADDING; // + HEADER_FOOTER;
  };

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
        <pre className="whitespace-pre font-mono text-base leading-6 overflow-x-auto py-2">
          ```{fileContent.name}
          {fileContent.content}
          ```
        </pre>
      </div>
    );
  }

  if (!fileContents || fileContents.length === 0) {
    return <div>No content</div>;
  }

  return (
    <div className="w-full h-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={fileContents.length}
            itemSize={getItemSize}
            className="overflow-y-auto"
            overscanCount={2}
          >
            {ItemRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
