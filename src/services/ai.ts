import type { Language } from '../types';
import { detectLanguage } from './language';

// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI Service
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_KEY = '';

export function getApiKey(): string {
  try {
    const fromStorage = localStorage.getItem('dost_gemini_api_key');
    if (fromStorage && fromStorage.trim().length > 10) return fromStorage.trim();
  } catch {}

  const fromEnv = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (fromEnv && fromEnv.trim().length > 10) return fromEnv.trim();

  return DEFAULT_KEY;
}

export function saveApiKey(key: string): void {
  try {
    localStorage.setItem('dost_gemini_api_key', key.trim());
  } catch {}
}

export type MessageRole = 'user' | 'model';

export interface AIMessage {
  role: MessageRole;
  parts: { text: string }[];
}

function buildSystemInstruction(detectedLang: Language, userName: string): string {
  return `You are Hey Dost, a warm, patient, and friendly AI companion designed specifically for senior citizens in India and around the world.

PERSONA:
- You are a trusted friend, not a formal assistant
- You are calm, gentle, encouraging, and never condescending
- You celebrate small achievements warmly
- You never blame the user for mistakes
- You keep responses SHORT and conversational — one step at a time

LANGUAGE RULES:
- Detected language: ${detectedLang}
- If the user writes in Hindi (Devanagari script), respond in Hindi
- If the user writes in Hinglish (Roman script Indian words), respond in Hinglish
- If the user writes in English, respond in English
- NEVER switch languages unless the user switches first
- In Hinglish: write in Roman script, use natural conversational Indian Hindi-English mix
- NEVER translate Hinglish to formal Hindi

USER NAME: ${userName || 'the user'}

CORE BEHAVIOR:
- Break instructions into very small, simple steps
- After each step, wait for confirmation before proceeding
- Use simple, everyday words — no technical jargon
- Speak short sentences, not long paragraphs
- When guiding, say one step at a time with brief pauses
- Celebrate progress: "Bahut acha!", "Great job!", "Shabash!"

SAFETY:
- If someone seems distressed or in danger, gently ask if they need help contacting someone
- Never provide medical advice — always say "Please check with your doctor"
- Warn clearly about suspicious messages/links

HONESTY:
- Never pretend to do something you cannot do as a web app
- If you can't directly control an app, explain honestly and offer to guide them
- Never invent facts or data

EMOTIONAL SUPPORT:
- If someone says they feel lonely or sad, respond with warmth and companionship
- Offer to chat, tell a story, or suggest calling a loved one

Example Hinglish responses:
- "Bilkul! Main aapko step by step sikhaata hoon."
- "Pehle WhatsApp kholo. Jab khul jaaye, mujhe batao."
- "Bahut acha kiya! Agle step pe chalte hain."`;
}

// Active supported models with fallback cascade
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-pro-latest',
  'gemini-2.5-flash',
];

async function callGeminiAPI(
  history: AIMessage[],
  newMessage: string,
  detectedLang: Language,
  userName: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);

  let lastError: any = null;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemInstruction(detectedLang, userName),
      });

      const chat = model.startChat({
        history: history.map(m => ({
          role: m.role,
          parts: m.parts,
        })),
      });

      const result = await chat.sendMessage(newMessage);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} call failed, trying fallback...`, err?.message || err);
    }
  }
  throw lastError;
}

async function callGeminiVisionAPI(
  imageBase64: string,
  mimeType: string,
  question: string,
  detectedLang: Language,
  userName: string,
  history?: { role: 'user' | 'model'; text: string }[]
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);

  // Build prompt including previous visual discussion history if any
  let promptText = question || 'What is this? Please explain in simple terms for a senior citizen.';
  if (history && history.length > 0) {
    const contextSnippet = history
      .map(h => `${h.role === 'user' ? 'User asked' : 'Dost answered'}: "${h.text}"`)
      .join('\n');
    promptText = `Context from our conversation about this image so far:\n${contextSnippet}\n\nUser's next question about the image: ${promptText}`;
  }

  let lastError: any = null;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemInstruction(detectedLang, userName) + `
VISUAL CONTEXT RULE:
You are analyzing an image shown by the user. Maintain visual context across questions.
If the user asks "How do I use it?" or "What does this button do?", refer back to the item/controls visible in the image.
Keep answers very simple, encouraging, and clear for a senior citizen.`,
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType,
          },
        },
        promptText,
      ]);

      return result.response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`Vision model ${modelName} failed, trying fallback...`, err?.message || err);
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart Fallback (when all else fails or offline)
// ─────────────────────────────────────────────────────────────────────────────

function smartFallback(userText: string, detectedLang: Language, userName: string): string {
  const t = userText.toLowerCase().trim();
  const name = userName || 'ji';

  // Safety check
  if (t.includes('otp') || t.includes('safe') || t.includes('suspicious') || t.includes('fraud') || t.includes('scam')) {
    if (detectedLang === 'hi') {
      return `${name}, यह संदेश देखकर सावधान रहें। OTP किसी के साथ share मत करें। अगर कोई urgency दिखाए या पैसे मांगे, तो यह fraud हो सकता है। किसी trusted व्यक्ति को दिखाएं।`;
    }
    if (detectedLang === 'hinglish') {
      return `${name} ji, is message mein warning signs hain. OTP kabhi share mat kijiye. Agar koi urgent payment ya account details maange, toh ye fraud ho sakta hai. Kisi trusted insaan ko dikhao pehle.`;
    }
    return `${name}, please be careful. Never share your OTP with anyone. If someone is asking urgently for money or account details, this could be a scam. Please show this to someone you trust before doing anything.`;
  }

  // Loneliness / emotional
  if (t.includes('lonely') || t.includes('akela') || t.includes('sad') || t.includes('udaas') || t.includes('bura lag')) {
    if (detectedLang === 'hi') {
      return `मैं यहाँ हूँ, ${name}। आप अकेले नहीं हैं। क्या आप किसी से बात करना चाहेंगे? मैं यहाँ आपके साथ हूँ।`;
    }
    if (detectedLang === 'hinglish') {
      return `Main yahin hoon, ${name} ji. Aap akele nahi hain. Kya kisi se baat karni hai? Ya main aapke saath hoon — batao kya mann mein hai.`;
    }
    return `I'm here with you, ${name}. You're not alone. Would you like to call someone, or just talk with me? I'm listening.`;
  }

  // WhatsApp photo
  if ((t.includes('whatsapp') || t.includes('photo')) && (t.includes('send') || t.includes('bhej') || t.includes('sikhao') || t.includes('teach'))) {
    if (detectedLang === 'hi') {
      return `बिल्कुल! मैं आपको step by step सिखाऊँगा। "Teach Me" button दबाएं और हम शुरू करते हैं।`;
    }
    if (detectedLang === 'hinglish') {
      return `Bilkul ${name} ji! Main aapko step by step sikhata hoon. "Teach Me" button dabao aur hum shuru karte hain.`;
    }
    return `Of course, ${name}! I'll teach you step by step. Press "Teach Me" and we'll get started right away.`;
  }

  // Reminder
  if (t.includes('remind') || t.includes('reminder') || t.includes('yaad') || t.includes('alarm')) {
    if (detectedLang === 'hi') {
      return `ज़रूर! आप "My Day" section में reminder add कर सकते हैं, या मुझे बताएं — किस चीज़ का reminder चाहिए?`;
    }
    if (detectedLang === 'hinglish') {
      return `Zaroor! "My Day" mein jaake reminder add kar sakte ho. Ya mujhe batao — kis cheez ka reminder chahiye aur kitne baje?`;
    }
    return `Sure! You can add a reminder in "My Day". Or tell me — what would you like to be reminded about, and at what time?`;
  }

  // Help
  if (t.includes('help') || t.includes('madad') || t.includes('sahayata')) {
    if (detectedLang === 'hi') {
      return `मैं यहाँ हूँ, ${name}। बताइए क्या चाहिए — मैं हर कदम पर आपकी मदद करूँगा।`;
    }
    if (detectedLang === 'hinglish') {
      return `Main yahin hoon ${name} ji. Batao kya chahiye — main har ek step mein aapki madad karunga.`;
    }
    return `I'm right here, ${name}. Tell me what you need — I'll help you every step of the way.`;
  }

  // Default conversational response
  if (detectedLang === 'hi') {
    return `नमस्ते ${name}! मैं दोस्त हूँ। बताइए आज मैं आपकी क्या मदद कर सकता हूँ?`;
  }
  if (detectedLang === 'hinglish') {
    return `Namaste ${name} ji! Main Dost hoon. Boliye aaj main aapki kya madad kar sakta hoon?`;
  }
  return `Hello ${name}! I am Dost. How can I help you today?`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const aiService = {
  isConfigured(): boolean {
    return getApiKey().length > 10;
  },

  async chat(
    history: AIMessage[],
    userText: string,
    userName: string,
    userLanguage: Language = 'auto'
  ): Promise<{ text: string; detectedLang: Language }> {
    const detectedLang = userLanguage === 'auto'
      ? detectLanguage(userText)
      : userLanguage;

    if (!this.isConfigured()) {
      return {
        text: smartFallback(userText, detectedLang, userName),
        detectedLang,
      };
    }

    try {
      const text = await callGeminiAPI(history, userText, detectedLang, userName);
      return { text, detectedLang };
    } catch (err: any) {
      console.error('Gemini API error:', err);
      return {
        text: smartFallback(userText, detectedLang, userName),
        detectedLang,
      };
    }
  },

  async analyzeImage(
    imageBase64: string,
    mimeType: string,
    question: string,
    userName: string,
    userLanguage: Language = 'auto',
    history?: { role: 'user' | 'model'; text: string }[]
  ): Promise<{ text: string; detectedLang: Language; isError?: boolean }> {
    const detectedLang = userLanguage === 'auto'
      ? detectLanguage(question)
      : userLanguage;

    if (!this.isConfigured()) {
      const msg = detectedLang === 'hi'
        ? 'AI कनेक्शन configure नहीं है। image analysis के लिए API key set करें।'
        : detectedLang === 'hinglish'
          ? 'AI connection configure nahi hai. Image analysis ke liye API key set karein.'
          : 'AI connection isn\'t configured. Set API key to analyze images.';
      return { text: msg, detectedLang, isError: true };
    }

    try {
      const text = await callGeminiVisionAPI(imageBase64, mimeType, question, detectedLang, userName, history);
      return { text, detectedLang };
    } catch (err: any) {
      console.error('Gemini Vision error:', err);
      const friendlyErr = detectedLang === 'hi'
        ? 'दोस्त इस वक्त AI से connect नहीं हो पा रहा। थोड़ी देर बाद दोबारा try करें।'
        : detectedLang === 'hinglish'
          ? 'Dost is waqt AI se connect nahi ho pa raha. Thodi der baad dobara try karein.'
          : 'Dost is unable to connect to AI right now. Please try again in a moment.';
      return {
        text: friendlyErr,
        detectedLang,
        isError: true,
      };
    }
  },

  analyzeSafetyText(
    suspiciousText: string,
    detectedLang: Language
  ): string {
    const warnings: string[] = [];
    const t = suspiciousText.toLowerCase();

    if (/otp|one.?time.?password/.test(t)) warnings.push('Asks for OTP or one-time password');
    if (/urgent|immediately|asap|तुरंत|jaldi/.test(t)) warnings.push('Creates urgency/panic');
    if (/click|link|http|bit\.ly|tinyurl/.test(t)) warnings.push('Contains suspicious link');
    if (/account|bank|credit|debit|password|pin/.test(t)) warnings.push('Asks for financial/account details');
    if (/prize|won|winner|congratulations|lottery/.test(t)) warnings.push('Claims prize/lottery winning');
    if (/verify|kyc|update your|confirm your/.test(t)) warnings.push('Asks to verify/update sensitive info');
    if (/transfer|send money|pay|payment/.test(t)) warnings.push('Requests money transfer or payment');

    if (warnings.length === 0) {
      if (detectedLang === 'hi') return 'इस message में कोई obvious warning नहीं दिखी। फिर भी सावधान रहें और अनजान links पर click न करें।';
      if (detectedLang === 'hinglish') return 'Is message mein koi obvious warning nahi dikh rahi. Phir bhi savdhan rahein aur anjaan links pe click mat karein.';
      return 'No obvious red flags found, but always be cautious. Never share personal information with strangers.';
    }

    const header = detectedLang === 'hi'
      ? `⚠️ सावधान! इस message में ${warnings.length} warning sign${warnings.length > 1 ? 's' : ''} हैं:\n\n`
      : detectedLang === 'hinglish'
        ? `⚠️ Savdhan! Is message mein ${warnings.length} warning sign${warnings.length > 1 ? 's' : ''} hain:\n\n`
        : `⚠️ Warning! This message has ${warnings.length} red flag${warnings.length > 1 ? 's' : ''}:\n\n`;

    const bullets = warnings.map(w => `• ${w}`).join('\n');

    const footer = detectedLang === 'hi'
      ? '\n\nकृपया इस message का जवाब मत दें। किसी trusted व्यक्ति को दिखाएं।'
      : detectedLang === 'hinglish'
        ? '\n\nKripaya is message ka jawab mat dijiye. Kisi trusted insaan ko dikhao.'
        : '\n\nDo NOT respond to this message. Show it to someone you trust.';

    return header + bullets + footer;
  },
};
