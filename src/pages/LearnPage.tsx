import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService, startListening } from '../services/speech';
import { getBrowserSpeechLang } from '../services/language';
import { getFlowForQuery, TEACH_FLOWS } from '../services/teachFlows';
import { TeachMeModal } from './TeachMeModal';
import type { TeachFlow } from '../types';

export const LearnPage: React.FC = () => {
  const { profile, activeLanguage, learnedTasks } = useApp();
  const [query, setQuery] = useState('');
  const [activeFlow, setActiveFlow] = useState<TeachFlow | null>(null);
  const [isListening, setIsListening] = useState(false);

  const greeting =
    activeLanguage === 'hi'
      ? 'आज आप क्या सीखना चाहते हैं?'
      : activeLanguage === 'hinglish'
        ? 'Aaj aap kya seekhna chahte hain?'
        : 'What would you like to learn today?';

  const subGreeting =
    activeLanguage === 'hi'
      ? 'मुझसे पूछें, मैं आपको एक-एक step करके सिखाऊँगा।'
      : activeLanguage === 'hinglish'
        ? 'Mujhse puchiye, main aapko step by step aaram se sikhaunga.'
        : 'Tell me what you want to do. I will guide you step by step.';

  const handleStartLearn = (text: string) => {
    if (!text.trim()) return;
    const flow = getFlowForQuery(text);
    if (flow) {
      setActiveFlow(flow);
    } else {
      // Fallback guided flow
      const fallbackFlow: TeachFlow = {
        id: 'custom_learn',
        title: text,
        titleHinglish: text,
        steps: [
          {
            id: 1,
            instruction: `First, return to your Home screen by pressing the Home button at the bottom of your phone.`,
            instructionHinglish: `Pehle apne phone ke Home screen par aa jaiye.`,
            target: 'Home Screen',
            actionHint: 'Bottom center home circle',
            navigationTip: 'Make sure your phone screen is unlocked and clear.',
            completed: false,
          },
          {
            id: 2,
            instruction: `Look for the app you need to use and tap it gently once.`,
            instructionHinglish: `Ab jo app kholni hai, uska icon dhoondh kar dheere se tap kijiye.`,
            target: 'Target app icon',
            actionHint: 'Tap once gently',
            navigationTip: 'If the wrong app opens, press the Back button.',
            completed: false,
          },
          {
            id: 3,
            instruction: `Now tap the primary action button to complete your task.`,
            instructionHinglish: `Ab samne screen par diye gaye instruction ko padhein aur button dabayein.`,
            target: 'Action button',
            actionHint: 'Follow on-screen button',
            navigationTip: 'Dost is with you every step.',
            completed: false,
          },
        ],
      };
      setActiveFlow(fallbackFlow);
    }
  };

  const handleVoiceListen = () => {
    if (isListening) return;
    setIsListening(true);
    speechService.stop();
    const langCode = getBrowserSpeechLang(activeLanguage === 'auto' ? 'en' : activeLanguage);

    startListening(
      langCode,
      ({ text }) => {
        setIsListening(false);
        if (text.trim()) {
          setQuery(text);
          handleStartLearn(text);
        }
      },
      _err => setIsListening(false),
      () => setIsListening(false)
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Top Banner */}
      <div style={{
        padding: '24px 20px 18px',
        background: '#EFF6FF',
        borderBottom: '1.5px solid #BFDBFE',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 13, color: '#1D4ED8', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          📚 TEACH ME ONCE
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1E3A8A', margin: '4px 0 6px' }}>
          {greeting}
        </h2>
        <p style={{ fontSize: 15, color: '#3B82F6', margin: 0, lineHeight: 1.5 }}>
          {subGreeting}
        </p>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Search & Voice Input */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1.5px solid #E5E7EB',
        }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartLearn(query)}
              placeholder={
                activeLanguage === 'hi'
                  ? 'जैसे: WhatsApp पर फोटो भेजना सिखाओ...'
                  : activeLanguage === 'hinglish'
                    ? 'Jaise: WhatsApp pe photo bhejna sikhao...'
                    : 'e.g. Teach me how to send a photo on WhatsApp...'
              }
              style={{
                flex: 1,
                fontSize: 16,
                padding: '14px 18px',
                borderRadius: 16,
                border: '1.5px solid #E5E7EB',
                outline: 'none',
                background: '#F9FAFB',
                fontFamily: 'inherit',
              }}
            />

            <button
              onClick={handleVoiceListen}
              style={{
                width: 54, height: 54,
                borderRadius: 16,
                background: isListening ? '#EF4444' : '#1B8A6B',
                color: '#fff',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
              }}
              title="Speak what you want to learn"
            >
              {isListening ? '⏹' : '🎤'}
            </button>
          </div>

          <button
            onClick={() => handleStartLearn(query)}
            disabled={!query.trim()}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 16,
              fontWeight: 700,
              background: query.trim() ? '#1D4ED8' : '#E5E7EB',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              cursor: query.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Start Interactive Lesson →
          </button>
        </div>

        {/* Popular Guided Lessons */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
            {activeLanguage === 'hi' ? 'लोकप्रिय पाठ' : activeLanguage === 'hinglish' ? 'Popular Lessons' : 'Popular Guided Lessons'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                flow: TEACH_FLOWS.whatsapp_photo,
                icon: '📸',
                titleEn: 'Send a Photo on WhatsApp',
                titleHi: 'WhatsApp पर फोटो भेजना सीखें',
                titleHinglish: 'WhatsApp pe Photo Bhejna Sikhao',
                desc: 'Pick a photo from your gallery and send it to your family.',
              },
              {
                flow: TEACH_FLOWS.video_call,
                icon: '📹',
                titleEn: 'Make a Video Call on WhatsApp',
                titleHi: 'WhatsApp Video Call करना सीखें',
                titleHinglish: 'WhatsApp Video Call Karna Sikhao',
                desc: 'See and talk to your loved ones face-to-face.',
              },
              {
                flow: TEACH_FLOWS.make_call,
                icon: '📞',
                titleEn: 'Make a Phone Call',
                titleHi: 'Phone Call लगाना सीखें',
                titleHinglish: 'Phone Call Lagana Sikhao',
                desc: 'Find a contact and dial without confusion.',
              },
              {
                flow: TEACH_FLOWS.google_maps,
                icon: '🗺',
                titleEn: 'Find Directions on Google Maps',
                titleHi: 'Google Maps पर रास्ता खोजना सीखें',
                titleHinglish: 'Google Maps Par Rasta Dhoondhna Sikhao',
                desc: 'Search hospitals, shops, or stations and follow directions.',
              },
            ].map(item => (
              <button
                key={item.flow.id}
                onClick={() => setActiveFlow(item.flow)}
                style={{
                  background: '#fff',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 18,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 32 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                    {activeLanguage === 'hi'
                      ? item.titleHi
                      : activeLanguage === 'hinglish'
                        ? item.titleHinglish
                        : item.titleEn}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
                    {item.desc}
                  </div>
                </div>
                <span style={{ fontSize: 20, color: '#1D4ED8', fontWeight: 800 }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* What You Have Learned (Saved in localStorage) */}
        {learnedTasks.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
              {activeLanguage === 'hi' ? 'आपने जो सीखा है' : activeLanguage === 'hinglish' ? 'Aapne Jo Seekha Hai' : 'What You Have Learned'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {learnedTasks.map(t => (
                <div
                  key={t.id}
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 20,
                    padding: '8px 16px',
                    fontSize: 14,
                    color: '#15803D',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>✓</span>
                  <span>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Interactive Teach Modal */}
      {activeFlow && (
        <TeachMeModal
          flow={activeFlow}
          language={activeLanguage}
          onClose={() => setActiveFlow(null)}
        />
      )}
    </div>
  );
};
