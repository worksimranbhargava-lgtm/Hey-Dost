// Web-compatible Hey Dost Active-Page Wake-Word Service

export type WakeRoute = 'talk' | 'show' | 'learn' | 'myday' | 'help' | 'safety';

export interface WakeWordHandler {
  onWakeDetected: (matchedPhrase: string) => void;
  onCommandCaptured: (command: string, targetRoute: WakeRoute) => void;
  onStatusChange?: (isListening: boolean) => void;
}

export function classifyIntent(text: string): WakeRoute {
  const t = text.toLowerCase();

  // Emergency / SOS
  if (
    t.includes('help') ||
    t.includes('emergency') ||
    t.includes('madad') ||
    t.includes('bachao') ||
    t.includes('gir gaya') ||
    t.includes('heart attack') ||
    t.includes('saans') ||
    t.includes('hospital') ||
    t.includes('chakkar')
  ) {
    return 'help';
  }

  // Show / Camera
  if (
    t.includes('dekho') ||
    t.includes('photo dekho') ||
    t.includes('yeh kya hai') ||
    t.includes('camera') ||
    t.includes('show') ||
    t.includes('look') ||
    t.includes('read this') ||
    t.includes('dikhao')
  ) {
    return 'show';
  }

  // Learn / Teach
  if (
    t.includes('sikhao') ||
    t.includes('seekhna') ||
    t.includes('teach') ||
    t.includes('how to') ||
    t.includes('kaise karein') ||
    t.includes('kaise karte') ||
    t.includes('guide me')
  ) {
    return 'learn';
  }

  // Do / Reminders / Day
  if (
    t.includes('remind') ||
    t.includes('reminder') ||
    t.includes('yaad dilana') ||
    t.includes('alarm') ||
    t.includes('schedule') ||
    t.includes('calendar')
  ) {
    return 'myday';
  }

  // Safety / Scams
  if (
    t.includes('scam') ||
    t.includes('fraud') ||
    t.includes('suspicious') ||
    t.includes('otp') ||
    t.includes('safe') ||
    t.includes('dhokha')
  ) {
    return 'safety';
  }

  // Default to talk
  return 'talk';
}

class WakeWordService {
  private recognition: any = null;
  private isRunning = false;
  private isPausedForSpeech = false;
  private handler: WakeWordHandler | null = null;
  private enabled = false;

  public init(handler: WakeWordHandler) {
    this.handler = handler;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public pauseForSpeaking() {
    this.isPausedForSpeech = true;
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.abort();
      } catch {}
    }
  }

  public resumeAfterSpeaking() {
    this.isPausedForSpeech = false;
    if (this.enabled) {
      setTimeout(() => this.start(), 350);
    }
  }

  public start() {
    if (!this.enabled || this.isPausedForSpeech) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (this.isRunning) {
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      // Accept Hinglish/Hindi or English
      this.recognition.lang = 'hi-IN';

      this.recognition.onstart = () => {
        this.isRunning = true;
        this.handler?.onStatusChange?.(true);
      };

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript?.trim() || '';
          const lower = transcript.toLowerCase();

          // Check wake phrases
          const wakePatterns = [
            'hey dost',
            'हे दोस्त',
            'hey dosth',
            'ay dost',
            'ai dost',
            'dost',
            'दोस्त',
          ];

          const matched = wakePatterns.find(p => lower.includes(p));

          if (matched) {
            this.handler?.onWakeDetected(matched);

            // Extract the remainder of the command after the wake phrase
            let command = lower.substring(lower.indexOf(matched) + matched.length).trim();
            // Clean up leading commas or filler
            command = command.replace(/^[,.\s]+/, '');

            if (command.length > 2) {
              const route = classifyIntent(command);
              this.handler?.onCommandCaptured(command, route);
            }
            break;
          }
        }
      };

      this.recognition.onerror = (e: any) => {
        // Expected aborts or no-speech are ignored
        if (e.error === 'not-allowed') {
          this.enabled = false;
          this.isRunning = false;
          this.handler?.onStatusChange?.(false);
        }
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        this.handler?.onStatusChange?.(false);
        // Automatically restart listening if still enabled and page is active
        if (this.enabled && !this.isPausedForSpeech && document.visibilityState === 'visible') {
          setTimeout(() => this.start(), 500);
        }
      };

      this.recognition.start();
    } catch (e) {
      this.isRunning = false;
      this.handler?.onStatusChange?.(false);
    }
  }

  public stop() {
    this.enabled = false;
    this.isRunning = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.handler?.onStatusChange?.(false);
  }
}

export const wakeWordService = new WakeWordService();
