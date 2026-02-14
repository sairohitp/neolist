import { TodoType } from '../types';
import { db } from './firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getDb = () => {
    if (!db) throw new Error("Firebase is not configured. Please check services/firebase.ts");
    return db;
}

// Firestore API for Todos
const todoApi = {
  subscribeToTodos: (userId: string, onUpdate: (todos: TodoType[]) => void): Unsubscribe => {
    const firestore = getDb();
    const q = query(collection(firestore, 'users', userId, 'todos'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TodoType));
      onUpdate(todos);
    });
    
    return unsubscribe;
  },

  addTodo: async (userId: string, title: string): Promise<TodoType> => {
    const firestore = getDb();
    const now = Date.now();
    const docRef = await addDoc(collection(firestore, 'users', userId, 'todos'), {
      title,
      notes: '',
      checklist: [],
      createdAt: now,
      updatedAt: now,
    });
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as TodoType;
  },

  deleteTodo: async (userId: string, id: string): Promise<{ id: string }> => {
    const firestore = getDb();
    await deleteDoc(doc(firestore, 'users', userId, 'todos', id));
    return { id };
  },
  
  updateTodo: async (userId: string, id: string, updates: Partial<Omit<TodoType, 'id'>>): Promise<TodoType> => {
    const firestore = getDb();
    const todoRef = doc(firestore, 'users', userId, 'todos', id);
    const updatePayload = { ...updates, updatedAt: Date.now() };
    await updateDoc(todoRef, updatePayload);
    const updatedDoc = await getDoc(todoRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as TodoType;
  }
};

// Gemini API for AI features
const geminiApi = {
    suggestSubtasks: async (title: string): Promise<string[]> => {
        if (typeof process === 'undefined' || !process.env.API_KEY) {
            console.error("API_KEY environment variable not set. AI features will be disabled.");
            return [];
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Based on the to-do list item "${title}", generate a checklist of actionable sub-tasks. Return a JSON object with a single key "tasks" which is an array of strings.`;

        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tasks: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["tasks"]
                    },
                },
            });
            
            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);
            return result.tasks || [];

        } catch (error) {
            console.error("Error generating subtasks with Gemini:", error);
            throw new Error("Failed to generate suggestions.");
        }
    }
}

export { todoApi, geminiApi };