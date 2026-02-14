import React, { useState } from 'react';
import { Icon } from './icons';

interface TodoFormProps {
  addTodo: (title: string) => Promise<void>;
}

export const TodoForm: React.FC<TodoFormProps> = ({ addTodo }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await addTodo(title.trim());
        setTitle('');
      } catch (error) {
        console.error("Failed to add todo:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 mb-8">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new master task..."
        className="flex-grow bg-white border border-slate-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 transition text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:disabled:bg-slate-700"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all w-12 h-12 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        disabled={!title.trim() || isSubmitting}
        aria-label="Add Task"
      >
        {isSubmitting ? <Icon name="spinner" className="h-6 w-6 animate-spin" /> : <Icon name="plus" className="h-6 w-6" />}
      </button>
    </form>
  );
};
