import React, { useState, useMemo, useEffect } from 'react';
import { TodoType } from '../types';
import { Icon } from './icons';
import { ChecklistItem } from './ChecklistItem';

interface TodoItemProps {
  todo: TodoType;
  updateTodoTitle: (id: string, title:string) => Promise<void>;
  updateTodoNotes: (id: string, notes: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  addChecklistItem: (todoId: string, text: string) => Promise<void>;
  updateChecklistItem: (todoId: string, itemId: string, newText: string) => Promise<void>;
  toggleChecklistItem: (todoId: string, itemId: string) => Promise<void>;
  deleteChecklistItem: (todoId: string, itemId: string) => Promise<void>;
  suggestSubtasks: (todoId: string, title: string) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
    todo, 
    updateTodoTitle,
    updateTodoNotes,
    deleteTodo,
    addChecklistItem,
    updateChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    suggestSubtasks
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(todo.notes || '');
  
  useEffect(() => {
    setNewTitle(todo.title);
    setCurrentNotes(todo.notes || '');
  }, [todo]);


  const runAsync = async (fn: () => Promise<any>) => {
    setIsUpdating(true);
    try {
      await fn();
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  const handleTitleUpdate = () => {
    if (newTitle.trim() && newTitle.trim() !== todo.title) {
      runAsync(() => updateTodoTitle(todo.id, newTitle.trim()));
    } else {
      setNewTitle(todo.title);
    }
    setIsEditingTitle(false);
  };
  
  const handleNotesUpdate = () => {
    runAsync(async () => {
      await updateTodoNotes(todo.id, currentNotes);
      setIsEditingNotes(false);
    });
  }

  const handleDelete = () => runAsync(() => deleteTodo(todo.id));

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistItemText.trim()) {
      runAsync(async () => {
        await addChecklistItem(todo.id, newChecklistItemText.trim());
        setNewChecklistItemText('');
      });
    }
  };
  
  const handleSuggestSubtasks = async () => {
    setIsSuggesting(true);
    try {
        await suggestSubtasks(todo.id, todo.title);
    } catch(e) {
        console.error("Failed to suggest subtasks", e);
    } finally {
        setIsSuggesting(false);
    }
  }

  const completedCount = useMemo(() => todo.checklist.filter(item => item.completed).length, [todo.checklist]);
  const progress = todo.checklist.length > 0 ? (completedCount / todo.checklist.length) * 100 : 0;
  
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="relative bg-white shadow-md rounded-xl p-5 sm:p-6 flex flex-col gap-4 transition-shadow hover:shadow-lg dark:bg-slate-800">
      <div className="flex justify-between items-start gap-4">
        {isEditingTitle ? (
            <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleTitleUpdate}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
                className="text-xl font-semibold bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full text-slate-800 dark:text-slate-100"
                autoFocus
                disabled={isUpdating}
            />
        ) : (
            <h2 onDoubleClick={() => !isUpdating && setIsEditingTitle(true)} className="text-xl font-semibold cursor-pointer text-slate-800 dark:text-slate-100">{todo.title}</h2>
        )}
        <div className="flex gap-1 items-center flex-shrink-0">
          <button onClick={() => !isUpdating && setIsEditingTitle(!isEditingTitle)} disabled={isUpdating} className="text-slate-400 hover:text-indigo-600 p-1 rounded-full transition-colors disabled:opacity-50 dark:text-slate-500 dark:hover:text-indigo-400" aria-label={isEditingTitle ? 'Save title' : 'Edit title'}>
              <Icon name={isEditingTitle ? 'save' : 'edit'} className="w-5 h-5"/>
          </button>
          <button onClick={handleDelete} disabled={isUpdating} className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors disabled:opacity-50 dark:text-slate-500 dark:hover:text-red-500" aria-label="Delete task">
            <Icon name="trash" className="w-5 h-5"/>
          </button>
        </div>
      </div>
      
      <div className="text-xs text-slate-500 dark:text-slate-400">
          <span>Updated: {formatDate(todo.updatedAt)}</span>
      </div>

      {todo.checklist.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">Progress</span>
                <span className="text-slate-500 dark:text-slate-400">{completedCount} / {todo.checklist.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
      )}
      
      {/* Notes Section */}
      <div className="border-t border-slate-200 pt-4 mt-2 dark:border-slate-700">
        <h3 className="font-semibold text-base text-slate-700 dark:text-slate-200 mb-2">Notes</h3>
        {isEditingNotes ? (
            <div className="flex flex-col">
                <textarea 
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder="Add details to your task..."
                    className="w-full h-28 bg-slate-100 border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                    disabled={isUpdating}
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                    <button onClick={() => {setIsEditingNotes(false); setCurrentNotes(todo.notes || '');}} disabled={isUpdating} className="px-3 py-1 text-sm rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleNotesUpdate} disabled={isUpdating} className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-1">
                        {isUpdating && <Icon name="spinner" className="w-4 h-4 animate-spin"/>}
                        Save
                    </button>
                </div>
            </div>
        ) : (
            <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap min-h-[2.5rem]">
                    {todo.notes ? todo.notes : <span className="italic text-slate-400 dark:text-slate-500">No notes yet.</span>}
                </p>
                <button onClick={() => setIsEditingNotes(true)} className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    {todo.notes ? 'Edit Notes' : 'Add Notes'}
                </button>
            </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-4 mt-2 dark:border-slate-700">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-base text-slate-700 dark:text-slate-200">Checklist</h3>
            <button 
              onClick={handleSuggestSubtasks}
              disabled={isSuggesting || isUpdating}
              className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-semibold transition-all hover:bg-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
            >
              {isSuggesting ? <Icon name="spinner" className="w-4 h-4 animate-spin"/> : <Icon name="sparkles" className="w-4 h-4"/> }
              Suggest
            </button>
        </div>

        {todo.checklist.length === 0 && (
            <p className="text-sm text-slate-500 italic my-3 text-center dark:text-slate-400">No sub-tasks yet. Add one below!</p>
        )}

        {todo.checklist.map(item => (
          <ChecklistItem 
            key={item.id}
            item={item}
            disabled={isUpdating || isSuggesting}
            toggleChecklistItem={() => runAsync(() => toggleChecklistItem(todo.id, item.id))}
            deleteChecklistItem={() => runAsync(() => deleteChecklistItem(todo.id, item.id))}
            updateChecklistItemText={(newText) => runAsync(() => updateChecklistItem(todo.id, item.id, newText))}
          />
        ))}
        
        <form onSubmit={handleAddChecklistItem} className="flex gap-2 mt-4">
            <input
                type="text"
                value={newChecklistItemText}
                onChange={(e) => setNewChecklistItemText(e.target.value)}
                placeholder="Add a sub-task..."
                className="flex-grow bg-slate-100 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                disabled={isUpdating || isSuggesting}
            />
            <button type="submit" className="flex items-center justify-center bg-slate-200 text-slate-600 rounded-md p-1.5 aspect-square transition-all hover:bg-slate-300 active:scale-90 disabled:opacity-50 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500" disabled={!newChecklistItemText.trim() || isUpdating || isSuggesting}>
                <Icon name="plus" className="w-4 h-4" />
                <span className="sr-only">Add Sub-task</span>
            </button>
        </form>
      </div>
    </div>
  );
};
