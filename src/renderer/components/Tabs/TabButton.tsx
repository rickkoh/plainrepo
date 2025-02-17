import React, { useState } from 'react';
import { File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabData } from '@/src/types/TabData';

type TabButtonProps = {
  tab: TabData;
  index: number;
  isActive: boolean;
  setActiveTab: (index: number) => void;
  closeTab: (index: number) => void;
  setTabTitle: (index: number, title: string) => void;
};

export default function TabButton({
  tab,
  index,
  isActive,
  setActiveTab,
  closeTab,
  setTabTitle,
}: TabButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Local state to hold the temporary title while editing.
  const [tempTitle, setTempTitle] = useState(tab.title);

  // Activate edit mode on double-click.
  const handleDoubleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' || tempTitle.trim() === '') {
      // Revert to the original title.
      setTempTitle(tab.title);
      setIsEditing(false);
      return;
    }
    if (e.key === 'Enter') {
      // Save the new title.
      setTabTitle(index, tempTitle);
      setIsEditing(false);
    }
  };

  return (
    <button
      key={tab.id}
      type="button"
      className={cn(
        'flex flex-row items-center border-b border-background px-4 py-1 space-x-2',
        isActive && 'border-foreground',
      )}
      onClick={(e) => {
        e.preventDefault();
        setActiveTab(index);
      }}
    >
      <span>
        <File className="w-4 h-4" />
      </span>
      {isEditing ? (
        <input
          type="text"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className="px-1 bg-background w-min focus:outline-muted-foreground"
        />
      ) : (
        <p onDoubleClick={handleDoubleClick}>{tab.title}</p>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          closeTab(index);
        }}
      >
        <X />
      </button>
    </button>
  );
}
