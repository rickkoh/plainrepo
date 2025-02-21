import { Edit2, X } from 'lucide-react';
import {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  InputHTMLAttributes,
} from 'react';

interface EditableListItemProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onUpdate?: (updatedValue: string) => void;
  onDelete?: () => void;
}

const EditableListItem = forwardRef<HTMLInputElement, EditableListItemProps>(
  ({ onUpdate, onDelete, value, ...props }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    // Sync state with external value changes
    useEffect(() => {
      setCurrentValue(value);
    }, [value]);

    const handleConfirmEdit = useCallback(() => {
      if (onUpdate) {
        onUpdate(currentValue);
      }
      setIsEditing(false);
    }, [currentValue, onUpdate]);

    const handleCancelEdit = useCallback(() => {
      setIsEditing(false);
      setCurrentValue(value);
    }, [value]);

    const handleDelete = useCallback(() => {
      if (onDelete) {
        onDelete();
      }
    }, [onDelete]);

    if (isEditing) {
      return (
        <li className="flex flex-row space-x-2 text-sm items-center text-muted-foreground">
          <input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            type="text"
            value={currentValue}
            ref={ref}
            className="w-full focus:outline-border"
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmEdit();
              }
            }}
          />
          <button
            type="button"
            onClick={handleConfirmEdit}
            className="bg-accent text-accent-foreground px-2 py-0 hover:bg-muted hover:text-muted-foreground"
          >
            Ok
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-accent text-accent-foreground px-2 py-0 hover:bg-muted hover:text-muted-foreground"
          >
            Cancel
          </button>
        </li>
      );
    }

    return (
      <li className="flex flex-row space-x-2 text-sm hover:bg-accent items-center text-muted-foreground">
        <span className="w-full">{value}</span>
        <button type="button" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={handleDelete}>
          <X className="w-5 h-5" />
        </button>
      </li>
    );
  },
);

EditableListItem.defaultProps = {
  onUpdate: () => {},
  onDelete: () => {},
};

export default EditableListItem;
