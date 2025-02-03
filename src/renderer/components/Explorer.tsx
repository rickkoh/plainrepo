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
import { ChevronRight } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import { useFileContext } from '../contexts/FileContext';
import { FileNode, FileNodeSchema } from '../../types/FileNode';

function TreeNode({
  fileNode,
  form,
  isRoot = false,
  fieldString = '',
  level = 1,
}: {
  fileNode: FileNode;
  form: any;
  isRoot?: boolean;
  fieldString?: string;
  level?: number;
}) {
  const [open, setOpen] = useState<CheckedState>(isRoot ?? false);

  return (
    <FormField
      control={form.control}
      name={`${fieldString}.selected`}
      render={({ field }) => {
        const handleOnCheckedChange = (checkedState: CheckedState) => {
          const applySelection = (node: FileNode, state: CheckedState) => {
            if (node.type === 'directory' && node.children) {
              node.children.forEach((child) => {
                applySelection(child, state);
              });
            }
            const checked: boolean = state === 'indeterminate' ? false : state;
            node.selected = checked;
          };

          if (fileNode !== undefined) {
            applySelection(fileNode, checkedState);
          }

          if (fieldString === '') {
            form.reset(fileNode);
          } else {
            form.setValue(`${fieldString}`, fileNode);
          }

          // Update parents
          if (checkedState) {
            form.setValue(`.selected`, checkedState);
            processIncrements(fieldString, (prefix: string) => {
              form.setValue(`${prefix}.selected`, checkedState);
            });
          }

          field.onChange(checkedState);
        };

        return (
          <div key={fileNode.path} className="flex flex-col">
            <FormItem>
              <FormControl>
                <div
                  className="flex flex-row items-center space-x-2 hover:bg-accent"
                  style={{ paddingLeft: `${level * 16}px` }}
                >
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
                    id={fileNode.path}
                    checked={field.value}
                    onCheckedChange={handleOnCheckedChange}
                  />
                  <Label
                    htmlFor={fileNode.path}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {fileNode.name}
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex flex-col gap-4">
              {fileNode.type === 'directory' && open && (
                <div>
                  {fileNode.children &&
                    fileNode.children.map((child, index) => (
                      <TreeNode
                        key={child.path}
                        fileNode={child}
                        form={form}
                        fieldString={`${fieldString}${isRoot ? '' : '.'}children.${index}`}
                        level={level + 1}
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
  const form = useForm<FileNode>({ resolver: zodResolver(FileNodeSchema) });

  useEffect(() => {
    form.reset(workspace);
  }, [form, workspace]);

  useEffect(() => {
    if (onStructureChange) {
      const subscription = form.watch((values) => {
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
        className="w-full h-full py-4 overflow-x-scroll bg-background"
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
    window.electron.ipcRenderer.selectFolder();
    // if (inputRef.current) {
    //   inputRef.current.click();
    // }
  };

  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files || files.length === 0) {
      setRootDir('');
      return;
    }

    // Get all paths
    const paths = Array.from(files).map((file) =>
      file.webkitRelativePath ? file.path : file.path,
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
    <div className="flex flex-col items-start w-full h-full max-h-screen py-2 overflow-hidden bg-background">
      <pre className="px-4 whitespace-nowrap text-sm">
        Explorer: {JSON.stringify(rootDir)}
      </pre>

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
        <div className="flex flex-col gap-4 p-4">
          <Button
            type="button"
            className="px-4 py-2 text-primary-foreground bg-primary rounded-md"
            onClick={handleClick}
          >
            Open Folder
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
    </div>
  );
}
