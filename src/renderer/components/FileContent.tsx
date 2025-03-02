import React, { useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useFileContentContext } from '../contexts/FileContentContext';
import { useDirectoryTreeContext } from '../contexts/DirectoryTreeContext';

// Constants for height calculation
const LINE_HEIGHT = 24; // Height of each line in pixels
const HEADER_FOOTER = 48; // Height for file name and closing backticks + margin

export default function FileContent() {
  const { directoryTree } = useDirectoryTreeContext();
  const { fileContents } = useFileContentContext();
  const listRef = useRef<List>(null);

  // Calculate item size based on number of lines
  const getItemSize = (index: number) => {
    const fileContent = fileContents[index];

    const contentLines = fileContent.content.split('\n').length;

    return (contentLines + 1) * LINE_HEIGHT + HEADER_FOOTER;
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
        <pre className="whitespace-pre font-mono text-base leading-6 overflow-x-auto">
          ```{fileContent.name}
          <br />
          {fileContent.content}
          ```
        </pre>
      </div>
    );
  }

  if (!fileContents || fileContents.length === 0) {
    return <div />;
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <pre className="p-4 h-1/2 overflow-scroll">{directoryTree}</pre>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height / 2}
            width={width}
            itemCount={fileContents.length}
            itemSize={getItemSize}
            className="overflow-y-auto"
            // overscanCount={2}
          >
            {ItemRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
