import type { Language } from '../types';

/**
 * Detects the language/style of the user's input.
 * Returns: 'en' | 'hi' | 'hinglish'
 */
export function detectLanguage(text: string): Language {
  const t = text.trim();

  // Check for Devanagari script → Hindi
  if (/[\u0900-\u097F]/.test(t)) return 'hi';

  // Hinglish patterns: Roman-script Indian words common in conversational Hindi
  const hinglishWords = [
    'mujhe', 'mera', 'mere', 'meri', 'main', 'hoon', 'hai', 'hain',
    'karo', 'karna', 'kaise', 'kya', 'kyun', 'kaun', 'kab', 'kahan',
    'nahi', 'nahin', 'aur', 'par', 'lekin', 'bhi', 'bahut', 'thoda',
    'dost', 'bhai', 'yaar', 'ji', 'achha', 'theek', 'bilkul',
    'pehle', 'phir', 'abhi', 'sikhao', 'batao', 'dikao', 'lagao',
    'bhejna', 'bhejo', 'lena', 'dena', 'kal', 'aaj', 'subah',
    'baje', 'yaad', 'reminder', 'remind', 'apna', 'apni', 'apne',
    'unka', 'unki', 'unke', 'iski', 'iska', 'iske',
    'whatsapp', 'beta', 'beti', 'beta', 'doctor', 'paas',
  ];

  const lower = t.toLowerCase();
  const words = lower.split(/\s+/);
  const hinglishMatches = words.filter(w => hinglishWords.includes(w)).length;
  const hinglishRatio = hinglishMatches / Math.max(words.length, 1);

  if (hinglishRatio >= 0.15 || hinglishMatches >= 2) return 'hinglish';

  return 'en';
}

export function getLanguageLabel(lang: Language): string {
  const labels: Record<Language, string> = {
    auto: 'Auto Detect',
    en: 'English',
    hi: 'Hindi',
    hinglish: 'Hinglish',
    pa: 'Punjabi',
    bn: 'Bengali',
    mr: 'Marathi',
    gu: 'Gujarati',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    or: 'Odia',
    as: 'Assamese',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ar: 'Arabic',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    pl: 'Polish',
  };
  return labels[lang] || lang;
}

export function getBrowserSpeechLang(lang: Language): string {
  const map: Record<Language, string> = {
    auto: 'en-US',
    en: 'en-US',
    hi: 'hi-IN',
    hinglish: 'hi-IN',
    pa: 'pa-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    or: 'or-IN',
    as: 'as-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    ar: 'ar-SA',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
    pl: 'pl-PL',
  };
  return map[lang] || 'en-US';
}
