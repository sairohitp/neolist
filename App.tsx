import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, signInWithGoogle, isFirebaseConfigured } from './services/firebase';
import { TodoType, ChecklistItemType } from './types';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { Login } from './components/Login';
import { FirebaseConfigError } from './components/FirebaseConfigError';
import { todoApi, geminiApi } from './services/api';
import { Icon } from './components/icons';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('body')?.classList.toggle('bg-slate-50', theme === 'light');
    document.querySelector('body')?.classList.toggle('bg-slate-900', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
        setAuthLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !isFirebaseConfigured) {
      setTodos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = todoApi.subscribeToTodos(currentUser.uid, (fetchedTodos) => {
      setTodos(fetchedTodos);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addTodo = useCallback(async (title: string) => {
    if (!currentUser) return;
    await todoApi.addTodo(currentUser.uid, title);
  }, [currentUser]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!currentUser) return;
    await todoApi.deleteTodo(currentUser.uid, id);
  }, [currentUser]);

  const updateTodoTitle = useCallback(async (id: string, title: string) => {
    if (!currentUser) return;
    await todoApi.updateTodo(currentUser.uid, id, { title });
  }, [currentUser]);

  const updateTodoNotes = useCallback(async (id: string, notes: string) => {
    if (!currentUser) return;
    await todoApi.updateTodo(currentUser.uid, id, { notes });
  }, [currentUser]);

  const updateChecklist = useCallback(async (todoId: string, newChecklist: ChecklistItemType[]) => {
      if (!currentUser) return;
      await todoApi.updateTodo(currentUser.uid, todoId, { checklist: newChecklist });
  }, [currentUser]);

  const addChecklistItem = useCallback(async (todoId: string, text: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const newItem: ChecklistItemType = { id: `${Date.now()}-${Math.random()}`, text, completed: false };
    await updateChecklist(todoId, [...todo.checklist, newItem]);
  }, [todos, updateChecklist]);

  const updateChecklistItem = useCallback(async (todoId: string, itemId: string, newText: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const newChecklist = todo.checklist.map(item =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    await updateChecklist(todoId, newChecklist);
  }, [todos, updateChecklist]);

  const toggleChecklistItem = useCallback(async (todoId: string, itemId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const newChecklist = todo.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateChecklist(todoId, newChecklist);
  }, [todos, updateChecklist]);

  const deleteChecklistItem = useCallback(async (todoId: string, itemId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const newChecklist = todo.checklist.filter(item => item.id !== itemId);
    await updateChecklist(todoId, newChecklist);
  }, [todos, updateChecklist]);

  const suggestSubtasks = useCallback(async (todoId: string, title: string) => {
    if (!currentUser) return;
    const suggestions = await geminiApi.suggestSubtasks(title);
    if (suggestions.length > 0) {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        const newItems: ChecklistItemType[] = suggestions.map(text => ({
            id: `${Date.now()}-${Math.random()}`,
            text,
            completed: false
        }));
        await updateChecklist(todoId, [...todo.checklist, ...newItems]);
    }
  }, [currentUser, todos, updateChecklist]);

  const signOut = () => {
    if (auth) {
        firebaseSignOut(auth);
    }
  };

  if (!isFirebaseConfigured) {
    return <FirebaseConfigError />;
  }

  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Icon name="spinner" className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
    );
  }

  if (!currentUser) {
    return <Login onSignIn={signInWithGoogle} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-20 dark:bg-slate-800/80 dark:shadow-slate-700/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">neolist</h1>
                  <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-right">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{currentUser.displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                      </div>
                      <button onClick={toggleTheme} className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200" aria-label="Toggle theme">
                          <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-5 h-5" />
                      </button>
                      <button onClick={signOut} className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200" aria-label="Sign out">
                          <Icon name="log-out" className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex-grow">
        <div className="max-w-3xl mx-auto">
            <TodoForm addTodo={addTodo} />
            {isLoading ? (
            <div className="flex items-center justify-center mt-16">
                <Icon name="spinner" className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
            ) : todos.length > 0 ? (
            <div className="space-y-6">
                {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    updateTodoTitle={updateTodoTitle}
                    updateTodoNotes={updateTodoNotes}
                    deleteTodo={deleteTodo}
                    addChecklistItem={addChecklistItem}
                    updateChecklistItem={updateChecklistItem}
                    toggleChecklistItem={toggleChecklistItem}
                    deleteChecklistItem={deleteChecklistItem}
                    suggestSubtasks={suggestSubtasks}
                />
                ))}
            </div>
            ) : (
            <div className="text-center bg-white rounded-lg p-12 mt-8 shadow-sm dark:bg-slate-800">
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100">All tasks completed!</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Add a new task above to get started.</p>
            </div>
            )}
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
          <p>All your data is securely stored and synced in the cloud.</p>
      </footer>
    </div>
  );
}

export default App;
