// Core Types for Hey Dost

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'uncertain' | 'error';

export type AppMode = 'web' | 'phone';

export type VoiceGender = 'female' | 'male';
export type VoiceSpeed = 'extra-slow' | 'slow' | 'normal';
export type FontSize = 'normal' | 'large' | 'extra-large';
export type ContrastMode = 'normal' | 'high';
export type AnimationMode = 'normal' | 'reduced';
export type AssistancePreference = 'independent' | 'guided' | 'step-by-step';

export type Language =
  | 'auto'
  | 'en'
  | 'hi'
  | 'hinglish'
  | 'pa'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'or'
  | 'as'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ar'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'pl';

export interface UserProfile {
  name: string;
  preferredInteraction: 'voice' | 'tap';
  language: Language;
  autoDetectLanguage?: boolean;
  voiceGender: VoiceGender;
  voiceSpeed: VoiceSpeed;
  fontSize: FontSize;
  contrast: ContrastMode;
  animation: AnimationMode;
  wakeWordEnabled?: boolean;
  assistancePreference?: AssistancePreference;
  onboardingComplete: boolean;
}

export interface Reminder {
  id: string;
  text: string;
  time?: string; // "HH:MM"
  date?: string; // "YYYY-MM-DD"
  repeat?: 'none' | 'daily' | 'weekly';
  createdAt: number;
  completed: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergency?: boolean;
}

export interface HealthEntry {
  id: string;
  type: 'medicine' | 'allergy' | 'doctor' | 'hospital' | 'emergency';
  name: string;
  details: string;
  reminderTime?: string;
}

export interface LearnedTask {
  id: string;
  title: string;
  completedAt: number;
  stepCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'dost';
  text: string;
  imageUrl?: string;
  timestamp: number;
  language?: string;
}

export interface TeachStep {
  id: number;
  instruction: string;
  instructionHi?: string;
  instructionHinglish?: string;
  target?: string; // description of what to highlight/press
  actionHint?: string; // Where to tap or look
  navigationTip?: string; // E.g., "Screen par Back button dabaiye"
  completed: boolean;
}

export interface TeachFlow {
  id: string;
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  steps: TeachStep[];
}

export interface AppState {
  profile: UserProfile;
  reminders: Reminder[];
  contacts: TrustedContact[];
  health: HealthEntry[];
  learnedTasks: LearnedTask[];
  messages: Message[];
}

export type AppTab = 'home' | 'talk' | 'show' | 'learn' | 'myday' | 'settings' | 'safety' | 'help';
