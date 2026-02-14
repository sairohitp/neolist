import React, { useState, useEffect } from 'react';
import { ChecklistItemType } from '../types';
import { Icon } from './icons';

interface ChecklistItemProps {
  item: ChecklistItemType;
  toggleChecklistItem: () => void;
  deleteChecklistItem: () => void;
  updateChecklistItemText: (newText: string) => void;
  disabled?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, toggleChecklistItem, deleteChecklistItem, updateChecklistItemText, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);

  useEffect(() => {
    setText(item.text);
  }, [item.text]);

  const handleUpdate = () => {
    if (disabled) return;
    if (text.trim() && text.trim() !== item.text) {
      updateChecklistItemText(text.trim());
    } else if (!text.trim()) {
      deleteChecklistItem();
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setText(item.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 group">
      <button
        onClick={!disabled ? toggleChecklistItem : undefined}
        disabled={disabled}
        className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
          item.completed
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white border-slate-400 group-hover:border-indigo-600 dark:bg-slate-700 dark:border-slate-500 dark:group-hover:border-indigo-500'
        }`}
        aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
        aria-checked={item.completed}
      >
        {item.completed && <Icon name="check" className="w-3.5 h-3.5 text-white" />}
      </button>

      {isEditing ? (
         <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={disabled}
          className="flex-grow bg-transparent focus:outline-none p-0 m-0 border-b-2 border-indigo-500 text-slate-800 dark:text-slate-100"
        />
      ) : (
        <span
          className={`flex-grow cursor-pointer ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}
          onDoubleClick={() => !disabled && setIsEditing(true)}
        >
          {item.text}
        </span>
      )}
      
      <button 
        onClick={!disabled ? deleteChecklistItem : undefined}
        disabled={disabled}
        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto disabled:opacity-25 dark:text-slate-500 dark:hover:text-red-500" aria-label="Delete sub-task">
        <Icon name="trash" className="w-4 h-4" />
      </button>
    </div>
  );
};
