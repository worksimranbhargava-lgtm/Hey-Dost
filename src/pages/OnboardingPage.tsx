import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DostLogo } from '../components/DostLogo';
import { DostOrb } from '../components/DostOrb';
import type { Language, VoiceGender, VoiceSpeed, AssistancePreference } from '../types';

export const OnboardingPage: React.FC = () => {
  const { updateProfile, addContact } = useApp();
  const [step, setStep] = useState<number>(1);

  // Form states
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>('auto');
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [voiceSpeed, setVoiceSpeed] = useState<VoiceSpeed>('slow');
  const [assistance, setAssistance] = useState<AssistancePreference>('guided');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');

  const handleFinish = () => {
    // Save emergency contact if provided
    if (emergencyName.trim() && emergencyPhone.trim()) {
      addContact({
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencyRel.trim() || 'Family',
        isEmergency: true,
      });
    }

    updateProfile({
      name: name.trim() || 'Friend',
      language,
      voiceGender,
      voiceSpeed,
      assistancePreference: assistance,
      wakeWordEnabled: true,
      onboardingComplete: true,
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px 20px',
      textAlign: 'center',
    }}>
      <DostLogo size="lg" showTagline={true} />

      <div style={{ marginTop: 24, marginBottom: 28 }}>
        <DostOrb state="idle" size={90} />
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 24, padding: '28px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1.5px solid #E5E7EB' }}>
        {/* Progress step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i === step ? '#1B8A6B' : i < step ? '#86EFAC' : '#E5E7EB',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* STEP 1: NAME */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              What should I call you?
            </h3>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 20px' }}>
              Tell me your name or how your family calls you.
            </p>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh ji, Dad, Sharma ji"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
              style={{
                width: '100%',
                fontSize: 18,
                padding: '16px',
                borderRadius: 14,
                border: '2px solid #D1FAE5',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 20,
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 17,
                fontWeight: 700,
                background: name.trim() ? '#1B8A6B' : '#D1D5DB',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2: LANGUAGE */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Which language is best?
            </h3>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 20px' }}>
              Hello, {name}! In which language would you like to speak?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: '✨ Auto-Detect (English, Hindi, Hinglish)', val: 'auto' as Language },
                { label: '🇮🇳 Hinglish (Natural Mix)', val: 'hinglish' as Language },
                { label: 'हिन्दी (Hindi)', val: 'hi' as Language },
                { label: '🇬🇧 English', val: 'en' as Language },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setLanguage(opt.val)}
                  style={{
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 600,
                    background: language === opt.val ? '#F0FDF4' : '#F9FAFB',
                    color: language === opt.val ? '#1B8A6B' : '#374151',
                    border: `2px solid ${language === opt.val ? '#1B8A6B' : '#E5E7EB'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              style={{
                width: '100%', padding: '16px', fontSize: 17, fontWeight: 700,
                background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 3: VOICE & SPEED */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Voice Preferences
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 16px' }}>
              We speak slowly and clearly by default.
            </p>

            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>Voice Type:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '👩 Female', val: 'female' as VoiceGender },
                  { label: '👨 Male', val: 'male' as VoiceGender },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setVoiceGender(opt.val)}
                    style={{
                      padding: '12px', fontSize: 14, fontWeight: 600,
                      background: voiceGender === opt.val ? '#1B8A6B' : '#F3F4F6',
                      color: voiceGender === opt.val ? '#fff' : '#374151',
                      border: 'none', borderRadius: 10, cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>Speaking Speed:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '🐢 Slow (Clear)', val: 'slow' as VoiceSpeed },
                  { label: '🚴 Normal', val: 'normal' as VoiceSpeed },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setVoiceSpeed(opt.val)}
                    style={{
                      padding: '12px', fontSize: 14, fontWeight: 600,
                      background: voiceSpeed === opt.val ? '#1B8A6B' : '#F3F4F6',
                      color: voiceSpeed === opt.val ? '#fff' : '#374151',
                      border: 'none', borderRadius: 10, cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              style={{
                width: '100%', padding: '16px', fontSize: 17, fontWeight: 700,
                background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 4: ASSISTANCE PREFERENCE */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              How should I assist you?
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px' }}>
              Select the pace that feels most comfortable.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { title: '“I can do things myself.”', desc: 'Brief answers, minimal prompts', val: 'independent' as AssistancePreference },
                { title: '“Guide me when I need help.”', desc: 'Helpful hints and proactive guidance', val: 'guided' as AssistancePreference },
                { title: '“Help me step by step.”', desc: 'Slow, patient, one action at a time', val: 'step-by-step' as AssistancePreference },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setAssistance(opt.val)}
                  style={{
                    padding: '14px',
                    borderRadius: 14,
                    background: assistance === opt.val ? '#F0FDF4' : '#F9FAFB',
                    border: `2px solid ${assistance === opt.val ? '#1B8A6B' : '#E5E7EB'}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(5)}
              style={{
                width: '100%', padding: '16px', fontSize: 17, fontWeight: 700,
                background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 5: EMERGENCY CONTACT (OPTIONAL WITH SKIP) */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Emergency Contact
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 16px' }}>
              Add a trusted family member or friend for one-touch SOS help. (Optional)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <input
                placeholder="Full Name (e.g. Rahul Sharma)"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB' }}
              />
              <input
                placeholder="Phone Number (e.g. +91 98765 43210)"
                type="tel"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB' }}
              />
              <input
                placeholder="Relationship (e.g. Son, Daughter)"
                value={emergencyRel}
                onChange={e => setEmergencyRel(e.target.value)}
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB' }}
              />
            </div>

            <button
              onClick={handleFinish}
              style={{
                width: '100%', padding: '16px', fontSize: 17, fontWeight: 800,
                background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              Start using Hey Dost 🤝
            </button>

            <button
              onClick={handleFinish}
              style={{
                background: 'none', border: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer', padding: '8px',
              }}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
