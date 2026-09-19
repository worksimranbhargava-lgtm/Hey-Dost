import type { AppState, UserProfile, Reminder, TrustedContact, HealthEntry, LearnedTask, Message } from '../types';

const KEYS = {
  profile: 'dost_profile',
  reminders: 'dost_reminders',
  contacts: 'dost_contacts',
  health: 'dost_health',
  learnedTasks: 'dost_learned',
  messages: 'dost_messages',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  preferredInteraction: 'voice',
  language: 'auto',
  voiceGender: 'female',
  voiceSpeed: 'slow',
  fontSize: 'large',
  contrast: 'normal',
  animation: 'normal',
  wakeWordEnabled: true,
  autoDetectLanguage: true,
  assistancePreference: 'guided',
  onboardingComplete: false,
};

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  getProfile(): UserProfile {
    return load(KEYS.profile, DEFAULT_PROFILE);
  },
  saveProfile(p: UserProfile): void {
    save(KEYS.profile, p);
  },

  getReminders(): Reminder[] {
    return load(KEYS.reminders, []);
  },
  saveReminders(r: Reminder[]): void {
    save(KEYS.reminders, r);
  },
  addReminder(r: Reminder): void {
    const list = storage.getReminders();
    list.push(r);
    storage.saveReminders(list);
  },
  deleteReminder(id: string): void {
    const list = storage.getReminders().filter(r => r.id !== id);
    storage.saveReminders(list);
  },
  toggleReminder(id: string): void {
    const list = storage.getReminders().map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    storage.saveReminders(list);
  },

  getContacts(): TrustedContact[] {
    return load(KEYS.contacts, []);
  },
  saveContacts(c: TrustedContact[]): void {
    save(KEYS.contacts, c);
  },
  addContact(c: TrustedContact): void {
    const list = storage.getContacts();
    list.push(c);
    storage.saveContacts(list);
  },
  deleteContact(id: string): void {
    const list = storage.getContacts().filter(c => c.id !== id);
    storage.saveContacts(list);
  },

  getHealth(): HealthEntry[] {
    return load(KEYS.health, []);
  },
  saveHealth(h: HealthEntry[]): void {
    save(KEYS.health, h);
  },
  addHealth(h: HealthEntry): void {
    const list = storage.getHealth();
    list.push(h);
    storage.saveHealth(list);
  },
  deleteHealth(id: string): void {
    const list = storage.getHealth().filter(h => h.id !== id);
    storage.saveHealth(list);
  },

  getLearnedTasks(): LearnedTask[] {
    return load(KEYS.learnedTasks, []);
  },
  addLearnedTask(t: LearnedTask): void {
    const list = storage.getLearnedTasks();
    const existing = list.findIndex(x => x.id === t.id);
    if (existing >= 0) {
      list[existing] = t;
    } else {
      list.push(t);
    }
    save(KEYS.learnedTasks, list);
  },

  getMessages(): Message[] {
    return load(KEYS.messages, []);
  },
  saveMessages(m: Message[]): void {
    // Keep last 100 messages
    save(KEYS.messages, m.slice(-100));
  },
  addMessage(m: Message): void {
    const list = storage.getMessages();
    list.push(m);
    storage.saveMessages(list);
  },
  clearMessages(): void {
    save(KEYS.messages, []);
  },

  clearAll(): void {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },

  loadAll(): AppState {
    return {
      profile: storage.getProfile(),
      reminders: storage.getReminders(),
      contacts: storage.getContacts(),
      health: storage.getHealth(),
      learnedTasks: storage.getLearnedTasks(),
      messages: storage.getMessages(),
    };
  },
};
