import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppState, UserProfile, Reminder, TrustedContact, HealthEntry, Message, Language } from '../types';
import { storage } from '../services/storage';

interface AppContextType extends AppState {
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Reminders
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt'>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  // Contacts
  addContact: (c: Omit<TrustedContact, 'id'>) => void;
  deleteContact: (id: string) => void;

  // Health
  addHealth: (h: Omit<HealthEntry, 'id'>) => void;
  deleteHealth: (id: string) => void;

  // Messages
  addMessage: (m: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Language
  activeLanguage: Language;
  setActiveLanguage: (l: Language) => void;

  // Mark task learned
  markTaskLearned: (id: string, title: string, stepCount: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => storage.loadAll());
  const [activeLanguage, setActiveLanguage] = useState<Language>(() => storage.getProfile().language);

  // Sync language with profile
  useEffect(() => {
    if (state.profile.language !== 'auto') {
      setActiveLanguage(state.profile.language);
    }
  }, [state.profile.language]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState(prev => {
      const newProfile = { ...prev.profile, ...updates };
      storage.saveProfile(newProfile);
      return { ...prev, profile: newProfile };
    });
  }, []);

  const addReminder = useCallback((r: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newR: Reminder = { ...r, id: uid(), createdAt: Date.now() };
    setState(prev => {
      const reminders = [...prev.reminders, newR];
      storage.saveReminders(reminders);
      return { ...prev, reminders };
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setState(prev => {
      const reminders = prev.reminders.filter(r => r.id !== id);
      storage.saveReminders(reminders);
      return { ...prev, reminders };
    });
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setState(prev => {
      const reminders = prev.reminders.map(r =>
        r.id === id ? { ...r, completed: !r.completed } : r
      );
      storage.saveReminders(reminders);
      return { ...prev, reminders };
    });
  }, []);

  const addContact = useCallback((c: Omit<TrustedContact, 'id'>) => {
    const newC: TrustedContact = { ...c, id: uid() };
    setState(prev => {
      const contacts = [...prev.contacts, newC];
      storage.saveContacts(contacts);
      return { ...prev, contacts };
    });
  }, []);

  const deleteContact = useCallback((id: string) => {
    setState(prev => {
      const contacts = prev.contacts.filter(c => c.id !== id);
      storage.saveContacts(contacts);
      return { ...prev, contacts };
    });
  }, []);

  const addHealth = useCallback((h: Omit<HealthEntry, 'id'>) => {
    const newH: HealthEntry = { ...h, id: uid() };
    setState(prev => {
      const health = [...prev.health, newH];
      storage.saveHealth(health);
      return { ...prev, health };
    });
  }, []);

  const deleteHealth = useCallback((id: string) => {
    setState(prev => {
      const health = prev.health.filter(h => h.id !== id);
      storage.saveHealth(health);
      return { ...prev, health };
    });
  }, []);

  const addMessage = useCallback((m: Omit<Message, 'id' | 'timestamp'>) => {
    const newM: Message = { ...m, id: uid(), timestamp: Date.now() };
    setState(prev => {
      const messages = [...prev.messages, newM].slice(-100);
      storage.saveMessages(messages);
      return { ...prev, messages };
    });
  }, []);

  const clearMessages = useCallback(() => {
    storage.clearMessages();
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  const markTaskLearned = useCallback((id: string, title: string, stepCount: number) => {
    const task = { id, title, completedAt: Date.now(), stepCount };
    storage.addLearnedTask(task);
    setState(prev => {
      const existing = prev.learnedTasks.findIndex(t => t.id === id);
      let learnedTasks;
      if (existing >= 0) {
        learnedTasks = [...prev.learnedTasks];
        learnedTasks[existing] = task;
      } else {
        learnedTasks = [...prev.learnedTasks, task];
      }
      return { ...prev, learnedTasks };
    });
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      updateProfile,
      addReminder,
      deleteReminder,
      toggleReminder,
      addContact,
      deleteContact,
      addHealth,
      deleteHealth,
      addMessage,
      clearMessages,
      activeLanguage,
      setActiveLanguage,
      markTaskLearned,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
