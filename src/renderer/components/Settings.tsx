/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button } from '@/components/ui/button';
import { Edit2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

import { useAppContext } from '../contexts/AppContext';

export default function Settings() {
  // Load up, and then use app context to get/set settings

  const { exclude, setExclude } = useAppContext();

  const [newExcludeText, setNewExcludeText] = useState('');

  const [showAdd, setShowAdd] = useState(false);

  function handleRemove(index: number) {
    const setSet = [...exclude];
    setSet.splice(index, 1);
    setExclude(setSet);
  }

  function handleAdd() {
    setExclude([...exclude, newExcludeText]);
    setNewExcludeText('');
  }

  const handleCancel = useCallback(() => {
    setShowAdd(false);
    setNewExcludeText('');
  }, []);

  return (
    <div className="flex flex-col w-full h-full px-4 pt-4 space-y-4">
      <p className="text-sm">Settings</p>
      <div className="flex flex-col space-y-2 px-2 border-l-2 border-transparent hover:border-accent">
        <p className="text-sm">
          Explorer: <b>Exclude</b>
        </p>
        <p className="text-sm">
          Configure glob patterns for excluding files and folders.
        </p>
        <ul className="flex flex-col space-y-2">
          {exclude.map((item, i) => (
            <li
              // eslint-disable-next-line react/no-array-index-key
              key={item + i}
              className="flex flex-row space-x-2 text-sm hover:bg-accent item-center text-muted-foreground"
            >
              <span className="w-full">{item}</span>
              <button type="button" onClick={() => handleRemove(i)}>
                <Edit2 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => handleRemove(i)}>
                <X className="w-5 h-5" />
              </button>
            </li>
          ))}
          {showAdd ? (
            <div className="space-x-2 text-sm flex flex-row items-center w-full">
              <input
                name="exclude-input"
                placeholder="Exclude Pattern"
                className="w-full px-1 border bg-background text-foreground placeholder:text-muted-foreground border-accent focus:rounded-none"
                value={newExcludeText}
                onChange={(e) => setNewExcludeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <button type="button" onClick={handleAdd}>
                Ok
              </button>
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => setShowAdd(true)}
              className="px-0 w-fit"
              variant="link"
            >
              Add Pattern
            </Button>
          )}
        </ul>
      </div>
      <p className="text-sm">
        Explorer: <b>Include gitignore</b>
      </p>
      <div className="flex items-center space-x-2">
        <Checkbox id="includeGitIgnore" />
        <label
          htmlFor="includeGitIgnore"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include .gitignore when considering excludes
        </label>
      </div>
    </div>
  );
}
