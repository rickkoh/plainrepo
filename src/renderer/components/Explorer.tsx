/* eslint-disable react/require-default-props */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
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
import { ChevronRight } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounceCallback } from 'usehooks-ts';

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
  fileNode,
  onStructureChange = () => {},
}: {
  fileNode: FileNode;
  onStructureChange?: (fileNode: FileNode) => void;
}) {
  const form = useForm<FileNode>({
    resolver: zodResolver(FileNodeSchema),
    values: fileNode,
  });

  const debouncedOnStructureChange = useDebounceCallback((values) => {
    if (onStructureChange) {
      const tempFileNode = FileNodeSchema.parse(values);
      onStructureChange(tempFileNode);
    }
  }, 0);

  useEffect(() => {
    const subscription = form.watch(debouncedOnStructureChange);
    return () => subscription.unsubscribe();
  }, [debouncedOnStructureChange, form]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Form {...form}>
      <form className="w-full h-full py-4 overflow-x-scroll bg-background">
        <TreeNode fileNode={fileNode} form={form} isRoot />
      </form>
    </Form>
  );
}

export default function Explorer() {
  const { workingDir, setWorkingDir, fileNode, setFileNode } = useFileContext();

  const handleClick = async () => {
    const folder = await window.electron.ipcRenderer.selectFolder();
    if (folder) {
      setWorkingDir(folder);
    }
  };

  return (
    <div className="flex flex-col items-start w-full h-full max-h-screen pt-4 overflow-hidden bg-background">
      <pre className="px-4 whitespace-nowrap text-sm">
        Explorer: {JSON.stringify(workingDir)}
      </pre>

      {fileNode && (
        <Tree
          fileNode={fileNode}
          onStructureChange={(dir) => {
            setFileNode(dir);
          }}
        />
      )}

      {!fileNode && (
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
    </div>
  );
}
