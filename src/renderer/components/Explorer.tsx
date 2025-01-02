/* eslint-disable no-console */
import { ChangeEvent, useEffect, useRef } from 'react';
import { useFileContext } from '../contexts/FileContext';
import { FileNode } from '../../types/FileNode';

function Tree({ fileNode }: { fileNode: FileNode }) {
  return (
    <div
      key={fileNode.path}
      className="flex flex-col gap-4"
      style={{
        marginLeft: '16px',
      }}
    >
      <div className="flex flex-row gap-2">
        <input
          type="checkbox"
          checked={fileNode.selected}
          // onChange={(e) => setIsSelected(e.currentTarget.checked)}
        />
        <span>{fileNode.type === 'file' ? 'file' : 'folder'}</span>
        <p>{fileNode.name}</p>
        {fileNode.type === 'directory' && (
          <button type="button">{fileNode.opened ? 'Close' : 'Open'}</button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {fileNode.type === 'directory' && fileNode.opened && (
          <div>
            {fileNode.children &&
              fileNode.children.map((child) => <Tree fileNode={child} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Explorer() {
  const { rootDir, setRootDir, workspace, setRootDirr, getContent } =
    useFileContext();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('directory', '');
      inputRef.current.setAttribute('webkitdirectory', '');
    }
  }, []);

  function handleClick() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line prefer-destructuring
    const files = event.target.files;
    // TODO: Refactor and beautify this
    if (files && files.length > 0) {
      const split = files[0].path.split('/');
      const nrootDir = split.filter((v, i) => i !== split.length - 1).join('/');
      setRootDir(nrootDir);
      setRootDirr(nrootDir);
    } else {
      setRootDir('');
    }
  };

  return (
    <div className="w-64 h-full p-4 bg-zinc-100 overflow-x-scroll">
      <pre className="whitespace-pre-wrap">Path: {JSON.stringify(rootDir)}</pre>

      {workspace && <Tree fileNode={workspace} />}

      {workspace && (
        <button
          type="button"
          className="px-4 py-2 text-white bg-green-700 rounded-md"
          onClick={() => getContent(workspace)}
        >
          Get Content
        </button>
      )}

      {!workspace && (
        <div className="flex flex-col gap-4">
          <p>No workspace selected</p>

          <button
            type="button"
            className="px-4 py-2 text-white bg-green-700 rounded-md"
            onClick={handleClick}
          >
            Open Workspace
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleFolderSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
