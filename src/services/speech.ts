import type { Language, VoiceGender, VoiceSpeed } from '../types';
import { getBrowserSpeechLang } from './language';

export interface SpeechService {
  speak(text: string, lang: Language, gender: VoiceGender, speed: VoiceSpeed): void;
  stop(): void;
  isSpeaking(): boolean;
}

function getRateForSpeed(speed: VoiceSpeed): number {
  switch (speed) {
    case 'extra-slow': return 0.6;
    case 'slow': return 0.8;
    case 'normal': return 1.0;
    default: return 0.8;
  }
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: Language, gender: VoiceGender): SpeechSynthesisVoice | null {
  const langCode = getBrowserSpeechLang(lang);
  const langBase = langCode.split('-')[0];

  // Priority: exact lang match + gender hint, then lang match, then gender match, then any
  const matches = voices.filter(v => v.lang.startsWith(langBase));

  if (matches.length === 0) return voices[0] ?? null;

  // Try to find gender-appropriate voice
  const genderKeywords = gender === 'female'
    ? ['female', 'woman', 'girl', 'zira', 'heera', 'priya', 'samantha', 'victoria', 'google uk english female']
    : ['male', 'man', 'guy', 'david', 'mark', 'alex', 'google uk english male'];

  const genderMatch = matches.find(v =>
    genderKeywords.some(k => v.name.toLowerCase().includes(k))
  );

  return genderMatch ?? matches[0];
}

class BrowserSpeechService implements SpeechService {
  private _speaking = false;

  speak(text: string, lang: Language, gender: VoiceGender, speed: VoiceSpeed): void {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    this._speaking = false;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = getRateForSpeed(speed);
    utter.pitch = gender === 'female' ? 1.1 : 0.9;
    utter.lang = getBrowserSpeechLang(lang);

    const voices = window.speechSynthesis.getVoices();
    const voice = pickVoice(voices, lang, gender);
    if (voice) utter.voice = voice;

    utter.onstart = () => { this._speaking = true; };
    utter.onend = () => { this._speaking = false; };
    utter.onerror = () => { this._speaking = false; };

    this._speaking = true;
    window.speechSynthesis.speak(utter);
  }

  stop(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this._speaking = false;
    }
  }

  isSpeaking(): boolean {
    return this._speaking;
  }
}

export const speechService: SpeechService = new BrowserSpeechService();

// Speech Recognition
export interface RecognitionResult {
  text: string;
  lang: string;
}

export function startListening(
  lang: string,
  onResult: (result: RecognitionResult) => void,
  onError: (err: string) => void,
  onEnd: () => void
): (() => void) | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not available in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript ?? '';
    onResult({ text: transcript, lang });
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Recognition error');
  };

  recognition.onend = onEnd;

  recognition.start();

  return () => {
    try { recognition.stop(); } catch {}
  };
}
