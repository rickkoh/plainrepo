/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button } from '@/components/ui/button';
import { MoveRight, X } from 'lucide-react';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ExcludeItem, ReplaceItem } from '@/src/types/AppSettings';
import { Input } from '@/components/ui/input';

import EditableListItem from './Forms/EditableListItem';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

import {
  selectChunkSize,
  selectCopyLimit,
  selectExclude,
  selectMaxFileSize,
  selectReplace,
  selectShouldIncludeGitIgnore,
} from '../redux/selectors/appSelectors';

import {
  loadAppSettings,
  setChunkSize,
  setCopyLimit,
  setExclude,
  setMaxFileSize,
  setReplace,
  setShouldIncludeGitIgnore,
} from '../redux/slices/appSlice';

interface SettingsItemProps {}

function SettingsItem({ children }: PropsWithChildren<SettingsItemProps>) {
  return (
    <div className="flex flex-col px-2 space-y-2 border-l-2 border-transparent hover:border-accent">
      {children}
    </div>
  );
}

interface SettingsItemHeaderProps {}

function SettingsItemHeader({
  children,
}: PropsWithChildren<SettingsItemHeaderProps>) {
  return <p className="text-sm">{children}</p>;
}

interface SettingsItemDescriptionProps {}

function SettingsItemDescription({
  children,
}: PropsWithChildren<SettingsItemDescriptionProps>) {
  return <p className="text-sm">{children}</p>;
}

interface SettingsItemContentProps {}

function SettingsItemContent({
  children,
}: PropsWithChildren<SettingsItemContentProps>) {
  return <div className="text-sm">{children}</div>;
}

export default function Settings() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAppSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exclude = useAppSelector(selectExclude);

  const shouldIncludeGitIgnore = useAppSelector(selectShouldIncludeGitIgnore);

  const replace = useAppSelector(selectReplace);

  const copyLimit = useAppSelector(selectCopyLimit);

  const chunkSize = useAppSelector(selectChunkSize);

  const maxFileSize = useAppSelector(selectMaxFileSize);

  const [newExcludeText, setNewExcludeText] = useState<ExcludeItem>('');

  const [showAddExclude, setShowAddExclude] = useState(false);

  const [newReplace, setNewReplace] = useState<ReplaceItem>({
    from: '',
    to: '',
  });

  const [showAddReplace, setShowAddReplace] = useState(false);

  function handleRemoveExclude(index: number) {
    const setSet = [...(exclude || [])];
    setSet.splice(index, 1);
    dispatch(setExclude(setSet));
  }

  function handleEditExclude(index: number, newText: string) {
    const setSet = [...(exclude || [])];
    setSet[index] = newText;
    dispatch(setExclude(setSet));
  }

  function handleAddExclude() {
    dispatch(setExclude([...(exclude || []), newExcludeText]));
    setNewExcludeText('');
  }

  const handleCancelAddExclude = useCallback(() => {
    setShowAddExclude(false);
    setNewExcludeText('');
  }, []);

  function handleRemoveReplace(index: number) {
    const setSet = [...(replace || [])];
    setSet.splice(index, 1);
    dispatch(setReplace(setSet));
  }

  function handleAddReplace() {
    dispatch(setReplace([...(replace || []), newReplace]));
    setNewReplace({ from: '', to: '' });
  }

  const handleCancelAddReplace = useCallback(() => {
    setShowAddReplace(false);
    setNewReplace({ from: '', to: '' });
  }, []);

  return (
    <div className="flex flex-col w-full h-full px-4 py-4 space-y-4">
      <p className="text-sm">Settings</p>
      <div className="flex flex-col space-y-6 overflow-y-scroll">
        <SettingsItem>
          <SettingsItemHeader>
            Explorer: <b>Exclude</b>
          </SettingsItemHeader>
          <SettingsItemDescription>
            Configure glob patterns for excluding files and folders.
          </SettingsItemDescription>
          <SettingsItemContent>
            {exclude &&
              exclude.map((item, i) => (
                <EditableListItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={item + i}
                  value={item}
                  placeholder="Exclude Pattern"
                  onDelete={() => handleRemoveExclude(i)}
                  onUpdate={(updatedExcludePattern) =>
                    handleEditExclude(i, String(updatedExcludePattern))
                  }
                />
              ))}
            {showAddExclude ? (
              <div className="flex flex-row items-center w-full space-x-2 text-sm">
                <input
                  name="exclude-input"
                  placeholder="Exclude Pattern"
                  className="w-full px-1 border bg-background text-foreground placeholder:text-muted-foreground border-accent focus:rounded-none"
                  value={newExcludeText}
                  onChange={(e) => setNewExcludeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExclude();
                    }
                  }}
                />
                <button type="button" onClick={handleAddExclude}>
                  Ok
                </button>
                <button type="button" onClick={handleCancelAddExclude}>
                  Cancel
                </button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setShowAddExclude(true)}
                className="px-0 w-fit"
                variant="link"
              >
                Add Pattern
              </Button>
            )}
          </SettingsItemContent>
        </SettingsItem>
        <SettingsItem>
          <SettingsItemHeader>
            Explorer: <b>Include gitignore</b>
          </SettingsItemHeader>
          <Checkbox
            id="includeGitIgnore"
            checked={shouldIncludeGitIgnore}
            onCheckedChange={(checkedState) =>
              dispatch(
                setShouldIncludeGitIgnore(
                  checkedState === 'indeterminate' ? false : checkedState,
                ),
              )
            }
          />
          <label
            htmlFor="includeGitIgnore"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Include .gitignore when considering excludes
          </label>
        </SettingsItem>
        <SettingsItem>
          <SettingsItemHeader>
            Content: <b>Replace</b>
          </SettingsItemHeader>
          <SettingsItemDescription>
            Configure patterns for replacing content in files.
          </SettingsItemDescription>
          <SettingsItemContent>
            {replace &&
              replace.map((item, i) => (
                <li
                  // eslint-disable-next-line react/no-array-index-key
                  key={item.from + item.to + i}
                  className="flex flex-row space-x-2 space-y-1 text-sm hover:bg-accent item-center text-muted-foreground"
                >
                  <span className="w-full">{item.from}</span>
                  <MoveRight />
                  <span className="w-full">{item.to}</span>
                  {/* <button type="button">
                  <Edit2 className="w-4 h-4" />
                </button> */}
                  <button type="button" onClick={() => handleRemoveReplace(i)}>
                    <X className="w-5 h-5" />
                  </button>
                </li>
              ))}
            {showAddReplace ? (
              <div className="flex flex-row items-center w-full space-x-2 text-sm">
                <input
                  name="replace-input"
                  placeholder="Replace From"
                  className="w-full px-1 border bg-background text-foreground placeholder:text-muted-foreground border-accent focus:rounded-none"
                  value={newReplace.from}
                  onChange={(e) =>
                    setNewReplace({
                      ...newReplace,
                      from: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReplace();
                    }
                  }}
                />
                <MoveRight />
                <input
                  name="replace-input"
                  placeholder="Replace To"
                  className="w-full px-1 border bg-background text-foreground placeholder:text-muted-foreground border-accent focus:rounded-none"
                  value={newReplace.to}
                  onChange={(e) =>
                    setNewReplace({
                      ...newReplace,
                      to: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReplace();
                    }
                  }}
                />
                <button type="button" onClick={handleAddReplace}>
                  Ok
                </button>
                <button type="button" onClick={handleCancelAddReplace}>
                  Cancel
                </button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setShowAddReplace(true)}
                className="px-0 w-fit"
                variant="link"
              >
                Add Pattern
              </Button>
            )}
          </SettingsItemContent>
        </SettingsItem>
        <SettingsItem>
          <SettingsItemHeader>
            Copy: <b>Limit</b>
          </SettingsItemHeader>
          <SettingsItemDescription>
            By default, limit is set to 500,000 characters as to prevent the
            application from crashing when copying large amounts of text. It is
            also unlikely that you would need to copy more than this amount of
            text.
          </SettingsItemDescription>
          <Input
            type="number"
            value={copyLimit ?? ''}
            onChange={(e) => {
              dispatch(setCopyLimit(Number(e.target.value)));
            }}
            placeholder="500000"
          />
        </SettingsItem>
        <SettingsItem>
          <SettingsItemHeader>
            Chunk Size: <b>Limit</b>
          </SettingsItemHeader>
          <SettingsItemDescription>
            How many files to read at a time. Default is 1000.
          </SettingsItemDescription>
          <Input
            type="number"
            value={chunkSize ?? ''}
            onChange={(e) => dispatch(setChunkSize(Number(e.target.value)))}
            placeholder="1000"
          />
        </SettingsItem>
        <SettingsItem>
          <SettingsItemHeader>
            Max File Size: <b>Limit</b>
          </SettingsItemHeader>
          <SettingsItemDescription>
            Maximum file size to be read in megabytes. Default is 8MB.
          </SettingsItemDescription>
          <Input
            type="number"
            value={maxFileSize ?? ''}
            onChange={(e) => dispatch(setMaxFileSize(Number(e.target.value)))}
            placeholder="8"
          />
        </SettingsItem>
      </div>
    </div>
  );
}
