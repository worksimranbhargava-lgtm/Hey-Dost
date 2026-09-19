import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { OrbState, Language } from '../types';
import { useApp } from '../context/AppContext';
import { DostOrb } from '../components/DostOrb';
import { aiService, type AIMessage } from '../services/ai';
import { speechService, startListening } from '../services/speech';
import { detectLanguage, getBrowserSpeechLang } from '../services/language';
import { getFlowForQuery } from '../services/teachFlows';
import { TeachMeModal } from './TeachMeModal';
import { isEmergencyDistress } from '../services/emergency';
import { EmergencyModal } from '../components/EmergencyModal';

export const TalkPage: React.FC = () => {
  const { profile, addMessage, messages, activeLanguage, setActiveLanguage } = useApp();
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable] = useState(() =>
    !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  );
  const [speechError, setSpeechError] = useState('');
  const [showTeach, setShowTeach] = useState(false);
  const [teachFlow, setTeachFlow] = useState<ReturnType<typeof getFlowForQuery>>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emergencyDistressText, setEmergencyDistressText] = useState<string | null>(null);

  const stopListeningRef = useRef<(() => void) | null>(null);
  const historyRef = useRef<AIMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep history in sync with messages
  useEffect(() => {
    historyRef.current = messages.slice(-20).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectLang = useCallback((text: string): Language => {
    if (profile.language !== 'auto') return profile.language;
    return detectLanguage(text);
  }, [profile.language]);

  const processUserInput = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const detected = detectLang(text);
    if (profile.language === 'auto') setActiveLanguage(detected);

    addMessage({ role: 'user', text: text.trim(), language: detected });
    setIsProcessing(true);
    setOrbState('thinking');

    // Check for proactive emergency distress
    if (isEmergencyDistress(text)) {
      setEmergencyDistressText(text);
      addMessage({ role: 'user', text: text.trim(), language: detected });
      setIsProcessing(false);
      setOrbState('idle');
      return;
    }

    // Check if this should trigger Teach Me Once
    const flow = getFlowForQuery(text);

    const { text: responseText, detectedLang } = await aiService.chat(
      historyRef.current,
      text.trim(),
      profile.name,
      detected
    );

    addMessage({ role: 'dost', text: responseText, language: detectedLang });
    setOrbState('speaking');

    speechService.speak(responseText, detectedLang, profile.voiceGender, profile.voiceSpeed);

    // If there's a teach flow, offer it
    if (flow) {
      setTeachFlow(flow);
      setTimeout(() => setShowTeach(true), 1500);
    }

    setTimeout(() => setOrbState('idle'), 3000);
    setIsProcessing(false);
  }, [isProcessing, detectLang, profile, addMessage, setActiveLanguage]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    processUserInput(text);
  }, [input, processUserInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = useCallback(() => {
    if (isListening) {
      stopListeningRef.current?.();
      stopListeningRef.current = null;
      setIsListening(false);
      setOrbState('idle');
      return;
    }

    speechService.stop();
    setSpeechError('');
    setIsListening(true);
    setOrbState('listening');

    const lang = getBrowserSpeechLang(activeLanguage === 'auto' ? 'en' : activeLanguage);

    const stop = startListening(
      lang,
      ({ text }) => {
        setIsListening(false);
        setOrbState('idle');
        stopListeningRef.current = null;
        if (text.trim()) {
          processUserInput(text);
        } else {
          setOrbState('uncertain');
          setTimeout(() => setOrbState('idle'), 2000);
        }
      },
      (err) => {
        setIsListening(false);
        setOrbState('idle');
        setSpeechError(err === 'not-allowed' ? 'Microphone access denied. Please allow microphone.' : err);
        stopListeningRef.current = null;
      },
      () => {
        setIsListening(false);
        if (orbState === 'listening') setOrbState('idle');
      }
    );
    stopListeningRef.current = stop;
  }, [isListening, activeLanguage, processUserInput, orbState]);

  const handleOrbClick = () => {
    if (!isListening && !isProcessing) handleVoice();
  };

  const recentMessages = messages.slice(-30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Orb area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0 12px',
        background: '#FAFAF8',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <DostOrb
          state={orbState}
          size={100}
          onClick={handleOrbClick}
          reduced={profile.animation === 'reduced'}
        />
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 36, marginBottom: 0, textAlign: 'center' }}>
          {isListening ? '🎤 Listening... tap orb to stop' :
           isProcessing ? '⏳ Thinking...' :
           voiceAvailable ? 'Tap orb or type below' : 'Type below to talk'}
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {recentMessages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: 16,
            marginTop: 40,
            lineHeight: 1.8,
          }}>
            <p>👋 Hello, {profile.name || 'friend'}!</p>
            <p style={{ fontSize: 14 }}>Ask me anything. I'm here to help.</p>
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[
                'How do I send a photo?',
                'Mujhe WhatsApp sikhao',
                'I feel lonely today',
                'Set a reminder for 7 PM',
              ].map(hint => (
                <button
                  key={hint}
                  onClick={() => processUserInput(hint)}
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 20,
                    padding: '8px 16px',
                    fontSize: 14,
                    color: '#1B8A6B',
                    cursor: 'pointer',
                  }}
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {recentMessages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'dost' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1B8A6B,#F59E2B)',
                flexShrink: 0, marginRight: 8, marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#fff', fontWeight: 700,
              }}>D</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user' ? '#1B8A6B' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#111827',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
              padding: '14px 18px',
              fontSize: 16,
              lineHeight: 1.6,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 40 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#1B8A6B',
                  animation: `bounce ${0.8 + i * 0.15}s infinite alternate`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Dost is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech error */}
      {speechError && (
        <div style={{
          background: '#FEF3C7', border: '1px solid #FCD34D', padding: '12px 16px',
          fontSize: 14, color: '#92400E', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexShrink: 0,
        }}>
          <span>{speechError}</span>
          <button onClick={() => setSpeechError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '12px 16px 16px',
        background: '#fff',
        borderTop: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={voiceAvailable ? 'Type or tap mic to speak...' : 'Type your question...'}
          style={{
            flex: 1,
            fontSize: 16,
            padding: '14px 18px',
            borderRadius: 24,
            border: '1.5px solid #E5E7EB',
            outline: 'none',
            background: '#F9FAFB',
            color: '#111827',
            fontFamily: 'inherit',
          }}
        />
        {voiceAvailable && (
          <button
            onClick={handleVoice}
            disabled={isProcessing}
            style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: isListening ? '#EF4444' : '#1B8A6B',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: 22,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? '⏹' : '🎤'}
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: input.trim() && !isProcessing ? '#F59E2B' : '#E5E7EB',
            border: 'none',
            cursor: input.trim() && !isProcessing ? 'pointer' : 'not-allowed',
            fontSize: 20,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
          aria-label="Send"
        >
          ➤
        </button>
      </div>

      {/* Teach Me Once Modal */}
      {showTeach && teachFlow && (
        <TeachMeModal
          flow={teachFlow}
          language={activeLanguage}
          onClose={() => { setShowTeach(false); setTeachFlow(null); }}
        />
      )}

      {/* Proactive Emergency Distress Modal */}
      {emergencyDistressText && (
        <EmergencyModal
          userStatement={emergencyDistressText}
          onClose={() => setEmergencyDistressText(null)}
          onAddContact={() => {}}
        />
      )}

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.6; }
          to { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
