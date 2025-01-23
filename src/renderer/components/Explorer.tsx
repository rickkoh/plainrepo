/* eslint-disable react/require-default-props */
/* eslint-disable no-console */
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn, processIncrements } from '@/lib/utils';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDebounceCallback } from 'usehooks-ts';
import { ChevronRight, Settings } from 'lucide-react';

import { useFileContext } from '../contexts/FileContext';
import { FileNode, FileNodeSchema } from '../../types/FileNode';

function TreeNode({
  fileNode,
  form,
  isRoot = false,
  fieldString = '',
}: {
  fileNode: FileNode;
  form: any;
  isRoot?: boolean;
  fieldString?: string;
}) {
  const [open, setOpen] = useState<CheckedState>(isRoot ?? false);

  return (
    <FormField
      control={form.control}
      name={`${fieldString}.selected`}
      render={({ field }) => {
        const handleOnCheckedChange = (checkedState: CheckedState) => {
          const updateChildren = (
            node: FileNode,
            state: CheckedState,
            childString: string,
          ) => {
            if (node.type === 'directory' && node.children) {
              node.children.forEach((child, index) =>
                updateChildren(
                  child,
                  state,
                  `${childString}.children.${index}`,
                ),
              );
            }
            form.setValue(`${childString}.selected`, state);
          };

          // If file is a directory, start the recursion
          if (fileNode.type === 'directory' && fileNode.children) {
            fileNode.children.forEach((child, index) => {
              updateChildren(
                child,
                checkedState,
                `${fieldString}.children.${index}`,
              );
            });
          }

          if (checkedState) {
            form.setValue(`.selected`, checkedState);
            processIncrements(fieldString, (prefix: string) => {
              console.log('Prefix:', prefix);
              form.setValue(`${prefix}.selected`, checkedState);
            });
          }

          console.log('Printing fieldString:', fieldString);

          field.onChange(checkedState);
        };

        return (
          <div
            key={fileNode.path}
            className="flex flex-col"
            style={{
              marginLeft: isRoot ? '' : '16px',
            }}
          >
            <div className="flex flex-row space-x-2 items-center">
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className={cn(
                        fileNode.type === 'file' &&
                          'opacity-0 pointer-events-none',
                      )}
                      onClick={() => setOpen(!open)}
                    >
                      <ChevronRight className={cn(open && 'rotate-90')} />
                    </button>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={handleOnCheckedChange}
                    />
                    <Label
                      htmlFor="open"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {fileNode.name}
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <div className="flex flex-col gap-4">
              {fileNode.type === 'directory' && (
                <div className={cn(open || 'hidden')}>
                  {fileNode.children &&
                    fileNode.children.map((child, index) => (
                      <TreeNode
                        key={child.path}
                        fileNode={child}
                        form={form}
                        fieldString={`${fieldString}.children.${index}`}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}

function Tree({
  workspace,
  onStructureChange = () => {},
}: {
  workspace: FileNode;
  onStructureChange?: (workspace: FileNode) => void;
}) {
  const form = useForm<FileNode>({
    defaultValues: workspace,
  });

  // function onSubmit(values: any) {
  //   console.log(values);
  // }

  useEffect(() => {
    if (onStructureChange) {
      const subscription = form.watch((values) => {
        // TODO: There should be no need to parse the file values
        const fileNode = FileNodeSchema.parse(values);
        onStructureChange(fileNode);
      });
      return () => subscription.unsubscribe();
    }
    return () => {};
  }, [form, onStructureChange]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Form {...form}>
      <form
        // onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full py-4 overflow-x-scroll bg-zinc-100"
      >
        <TreeNode fileNode={workspace} form={form} isRoot />
      </form>
    </Form>
  );
}

export default function Explorer() {
  const { rootDir, setRootDir, workspace, setWorkspace, getContent, autoSync } =
    useFileContext();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('directory', '');
      inputRef.current.setAttribute('webkitdirectory', '');
    }
  }, []);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files || files.length === 0) {
      setRootDir('');
      return;
    }

    // Get all paths
    const paths = Array.from(files).map((file) =>
      file.webkitRelativePath ? file.webkitRelativePath : file.path,
    );

    console.log(paths);

    // Derive the root directory by taking the common prefix
    const commonRootPath = paths.reduce((commonPath, currentPath) => {
      const normalizedCommonPath = commonPath.replace(/\\/g, '/');
      const normalizedCurrentPath = currentPath.replace(/\\/g, '/');
      const commonSegments = normalizedCommonPath.split('/');
      const currentSegments = normalizedCurrentPath.split('/');
      const common = [];

      for (
        let i = 0;
        i < Math.min(commonSegments.length, currentSegments.length);
        // eslint-disable-next-line no-plusplus
        i++
      ) {
        if (commonSegments[i] === currentSegments[i]) {
          common.push(commonSegments[i]);
        } else {
          break;
        }
      }

      return common.join('/');
    }, paths[0]);

    setRootDir(commonRootPath);
  };

  const debounceGetContent = useDebounceCallback(getContent, 1000);

  return (
    <div className="relative w-full h-screen p-4 overflow-hidden bg-zinc-100 flex flex-col items-start">
      <button type="button" onClick={handleClick}>
        <pre className="whitespace-nowrap">Path: {JSON.stringify(rootDir)}</pre>
      </button>

      {workspace && (
        <Tree
          workspace={workspace}
          onStructureChange={(dir) => {
            setWorkspace(dir);
            if (autoSync) {
              debounceGetContent(dir);
            }
          }}
        />
      )}

      {!workspace && (
        <div className="flex flex-col gap-4">
          <p>No workspace selected</p>

          <Button
            type="button"
            className="px-4 py-2 text-white bg-green-700 rounded-md"
            onClick={handleClick}
          >
            Open Workspace
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFolderSelect}
        className="hidden"
      />

      <div className="mt-auto" />

      <Button type="button">
        <Settings />
      </Button>
    </div>
  );
}
