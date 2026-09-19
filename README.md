# Hey Dost 🤝

**Your friend for the digital world.**

A Generative AI-powered adaptive digital companion for senior citizens.

---

## Quick Start

```bash
cd hey-dost
npm install
npm run dev
```

Open: **http://localhost:5173**

Phone testing: **http://169.254.220.188:5173** (or your LAN IP)

---

## Enable Full AI (Gemini)

1. Get a free API key at https://aistudio.google.com/apikey
2. Create a `.env` file in the `hey-dost/` folder:

```
VITE_GEMINI_API_KEY=your_key_here
```

3. Restart the dev server.

Without the key, Hey Dost still works with smart intent-based fallbacks for common flows.

---

## Core Flows to Demo

### 1. Onboarding
- Fresh open → Name entry → Voice/Tap preference
- Data persists on refresh

### 2. Talk (TALK TO DOST)
- Type or speak in English / Hindi / Hinglish
- Language auto-detected
- Voice responses via SpeechSynthesis
- Try: *"Mujhe WhatsApp pe photo bhejna sikhao"*

### 3. Teach Me Once
- Triggered automatically when user asks to learn something
- Step-by-step guided flow with voice
- "I don't understand" recovery
- Progress tracked in localStorage

### 4. Show Me (SHOW)
- Open camera or upload photo
- Ask: "What is this?" / "Yeh kya hai?"
- AI analyzes image (requires Gemini API key)
- Maintains conversational context

### 5. My Day
- Add, complete, delete reminders
- Voice + text + buttons
- Date/time support
- Refreshing browser preserves all data

### 6. Safety
- Paste suspicious message for analysis
- Upload screenshot
- Rule-based + AI-powered warning detection

### 7. Settings
- Voice type (Female/Male) + Speed
- Language selection (Auto/English/Hindi/Hinglish/+20 more)
- Font size + contrast + animations
- Trusted contacts with tel: deep links
- Health information storage
- Privacy controls

### 8. Web / Phone Mode
- Toggle in top bar: 💻 Web | 📱 Phone
- Phone mode shows 390×844 frame
- Same state, same AI, same data

---

## Architecture

```
src/
├── types/           Core TypeScript types
├── services/
│   ├── ai.ts        Gemini API + smart fallbacks
│   ├── speech.ts    SpeechRecognition + SpeechSynthesis
│   ├── language.ts  Language detection (English/Hindi/Hinglish)
│   ├── storage.ts   localStorage persistence
│   └── teachFlows.ts Step-by-step guided flows
├── context/
│   └── AppContext.tsx Central state management
├── components/
│   ├── DostOrb.tsx  Animated companion orb
│   └── DostLogo.tsx Hey Dost logotype
└── pages/
    ├── OnboardingPage.tsx
    ├── HomePage.tsx
    ├── TalkPage.tsx
    ├── TeachMeModal.tsx
    ├── ShowPage.tsx
    ├── MyDayPage.tsx
    ├── SafetyPage.tsx
    └── SettingsPage.tsx
```

---

## Design Principles

- **Intent, not interface** — AI hides complexity
- **Senior-first** — Large text, generous spacing, 44px+ touch targets
- **Real data only** — No fake data, no fake buttons
- **Graceful fallbacks** — Every failure has a useful next step
- **Multilingual** — Auto-detects English, Hindi, Hinglish natively

---

*PromptWars Final Submission — HEY DOST MVP*
