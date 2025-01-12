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
import { cn } from '@/lib/utils';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFileContext } from '../contexts/FileContext';
import { FileNode, FileNodeSchema } from '../../types/FileNode';

function TreeNode({
  fileNode,
  form,
  isRoot,
  fieldString,
}: {
  fileNode: FileNode;
  form: any;
  isRoot?: boolean;
  fieldString?: string;
}) {
  const [open, setOpen] = useState<CheckedState>(false);

  return (
    <FormField
      control={form.control}
      name={`${fieldString}.selected`}
      render={({ field }) => {
        return (
          <div
            key={fileNode.path}
            className="flex flex-col gap-4"
            style={{
              marginLeft: isRoot ? '' : '16px',
            }}
          >
            <div className="flex flex-row space-x-2">
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              {fileNode.type === 'directory' && (
                <Checkbox checked={open} onCheckedChange={setOpen} />
              )}
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

TreeNode.defaultProps = {
  isRoot: false,
  fieldString: '',
};

function Tree({
  workspace,
  onStructureChange,
}: {
  workspace: FileNode;
  onStructureChange?: (workspace: FileNode) => void;
}) {
  const form = useForm<FileNode>({
    defaultValues: workspace,
  });

  function onSubmit(values: any) {
    console.log(values);
  }

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
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full p-4 overflow-x-scroll bg-zinc-100"
      >
        <TreeNode fileNode={workspace} form={form} isRoot />
      </form>
    </Form>
  );
}

Tree.defaultProps = {
  onStructureChange: () => {},
};

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

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

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
    <div className="w-full h-full p-4 overflow-x-scroll bg-zinc-100">
      <pre className="whitespace-pre-wrap">Path: {JSON.stringify(rootDir)}</pre>

      {workspace && (
        <Tree workspace={workspace} onStructureChange={getContent} />
      )}

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

          <Button
            type="button"
            className="px-4 py-2 text-white bg-green-700 rounded-md"
            onClick={handleClick}
          >
            Open Workspace
          </Button>

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
