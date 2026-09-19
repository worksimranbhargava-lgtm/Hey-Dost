import React, { useState } from 'react';
import type { Language, VoiceGender, VoiceSpeed, FontSize, ContrastMode, AnimationMode, TrustedContact } from '../types';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { getLanguageLabel } from '../services/language';
import { storage } from '../services/storage';
import { wakeWordService } from '../services/wakeWord';
import { getApiKey, saveApiKey, aiService } from '../services/ai';

const ALL_LANGUAGES: Language[] = [
  'auto', 'en', 'hi', 'hinglish', 'pa', 'bn', 'mr', 'gu',
  'ta', 'te', 'kn', 'ml', 'or', 'as',
  'es', 'fr', 'de', 'it', 'pt', 'ar', 'ja', 'ko', 'zh', 'pl',
];

export const SettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    contacts,
    addContact,
    deleteContact,
    health,
    addHealth,
    deleteHealth,
    setActiveLanguage,
  } = useApp();

  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '', isEmergency: false });
  const [newHealth, setNewHealth] = useState({ type: 'medicine' as const, name: '', details: '', reminderTime: '' });
  const [testVoiceText, setTestVoiceText] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(() => getApiKey());
  const [apiTestStatus, setApiTestStatus] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const SectionCard = ({ icon, title, subtitle, children }: { icon: string; title: string; subtitle?: string; children: React.ReactNode }) => (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '24px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      border: '1.5px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: '#111827', margin: 0 }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );

  const handleLanguageChange = (lang: Language) => {
    updateProfile({ language: lang });
    setActiveLanguage(lang);
  };

  const toggleWakeWord = () => {
    const nextState = !profile.wakeWordEnabled;
    updateProfile({ wakeWordEnabled: nextState });
    wakeWordService.setEnabled(nextState);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Top Banner */}
      <div style={{
        padding: '24px 20px 16px',
        background: '#FAFAF8',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
          ⚙️ Settings & Preferences
        </h2>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '4px 0 0' }}>
          Personalize Hey Dost for your comfort and safety
        </p>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 1. HEY DOST WAKE WORD ACTIVATION */}
        <SectionCard
          icon="🎙️"
          title="Hey Dost Activation"
          subtitle="Wake up Dost with your voice while page is active"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: profile.wakeWordEnabled ? '#F0FDF4' : '#F9FAFB',
            border: `1.5px solid ${profile.wakeWordEnabled ? '#BBF7D0' : '#E5E7EB'}`,
            borderRadius: 16,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                Wake Word: "Hey Dost" / "हे दोस्त"
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {profile.wakeWordEnabled
                  ? '🟢 Listening actively for "Hey Dost" on this page'
                  : '⚪ Turned Off'}
              </div>
            </div>

            <button
              onClick={toggleWakeWord}
              style={{
                padding: '12px 20px',
                fontSize: 15,
                fontWeight: 800,
                background: profile.wakeWordEnabled ? '#1B8A6B' : '#9CA3AF',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {profile.wakeWordEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '8px 0 0', lineHeight: 1.4 }}>
            ℹ️ Web browsers only allow listening when this page is open in your browser. A future native mobile application will extend this to locked/background activation.
          </p>
        </SectionCard>

        {/* 2. LANGUAGE SETTINGS */}
        <SectionCard
          icon="🌐"
          title="Language Settings"
          subtitle="Choose how Hey Dost speaks and understands you"
        >
          {/* Auto Detect Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: '#F9FAFB',
            borderRadius: 14,
            border: '1.5px solid #E5E7EB',
            marginBottom: 16,
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                Auto-Detect Language
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                Automatically understands English, Hindi, or natural Hinglish
              </div>
            </div>
            <button
              onClick={() => {
                const nextVal = !profile.autoDetectLanguage;
                updateProfile({ autoDetectLanguage: nextVal });
                if (nextVal) handleLanguageChange('auto');
              }}
              style={{
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 700,
                background: profile.autoDetectLanguage ? '#1B8A6B' : '#D1D5DB',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              {profile.autoDetectLanguage ? 'ON' : 'OFF'}
            </button>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Preferred / Manual Language:
            </label>
            <select
              value={profile.language}
              onChange={e => handleLanguageChange(e.target.value as Language)}
              style={{
                width: '100%',
                fontSize: 16,
                padding: '14px 16px',
                borderRadius: 14,
                border: '1.5px solid #E5E7EB',
                outline: 'none',
                background: '#fff',
                color: '#111827',
                fontFamily: 'inherit',
              }}
            >
              {ALL_LANGUAGES.map(l => (
                <option key={l} value={l}>
                  {getLanguageLabel(l)}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        {/* 3. VOICE & SPEECH */}
        <SectionCard
          icon="🗣️"
          title="Voice & Speech"
          subtitle="Customize the voice and speed of Hey Dost"
        >
          {/* Gender */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Voice Gender:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '👩 Female Voice', value: 'female' as VoiceGender },
                { label: '👨 Male Voice', value: 'male' as VoiceGender },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateProfile({ voiceGender: opt.value })}
                  style={{
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: profile.voiceGender === opt.value ? '#1B8A6B' : '#F3F4F6',
                    color: profile.voiceGender === opt.value ? '#fff' : '#374151',
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Speaking Speed (Default is Slow for clear hearing):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: '🐢 Extra Slow', value: 'extra-slow' as VoiceSpeed },
                { label: '🚶 Slow', value: 'slow' as VoiceSpeed },
                { label: '🚴 Normal', value: 'normal' as VoiceSpeed },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateProfile({ voiceSpeed: opt.value })}
                  style={{
                    padding: '12px 6px',
                    fontSize: 13,
                    fontWeight: 700,
                    background: profile.voiceSpeed === opt.value ? '#1B8A6B' : '#F3F4F6',
                    color: profile.voiceSpeed === opt.value ? '#fff' : '#374151',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test Voice */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Test Voice Output:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={testVoiceText}
                onChange={e => setTestVoiceText(e.target.value)}
                placeholder="Type test text..."
                style={{
                  flex: 1,
                  fontSize: 15,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #E5E7EB',
                  outline: 'none',
                  background: '#F9FAFB',
                }}
              />
              <button
                onClick={() => {
                  const msg = testVoiceText.trim() || 'Namaste! Main Dost hoon. Main aapke saath hoon.';
                  speechService.speak(
                    msg,
                    profile.language === 'auto' ? 'hinglish' : profile.language,
                    profile.voiceGender,
                    profile.voiceSpeed
                  );
                }}
                style={{
                  padding: '12px 18px',
                  fontSize: 15,
                  fontWeight: 700,
                  background: '#1B8A6B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                🔊 Play
              </button>
            </div>
          </div>
        </SectionCard>

        {/* 4. ACCESSIBILITY */}
        <SectionCard
          icon="♿"
          title="Accessibility & Comfort"
          subtitle="Large fonts and high-contrast modes for seniors"
        >
          {/* Font Size */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Text Size:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'Normal', value: 'normal' as FontSize },
                { label: 'Large', value: 'large' as FontSize },
                { label: 'Extra Large', value: 'extra-large' as FontSize },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateProfile({ fontSize: opt.value })}
                  style={{
                    padding: '14px',
                    fontSize: 14,
                    fontWeight: 700,
                    background: profile.fontSize === opt.value ? '#1B8A6B' : '#F3F4F6',
                    color: profile.fontSize === opt.value ? '#fff' : '#374151',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Mode */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Contrast Mode:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '☀️ Normal Warm', value: 'normal' as ContrastMode },
                { label: '🌙 High Contrast', value: 'high' as ContrastMode },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateProfile({ contrast: opt.value })}
                  style={{
                    padding: '14px',
                    fontSize: 14,
                    fontWeight: 700,
                    background: profile.contrast === opt.value ? '#1B8A6B' : '#F3F4F6',
                    color: profile.contrast === opt.value ? '#fff' : '#374151',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Name */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Your Name:
            </label>
            <input
              value={profile.name}
              onChange={e => updateProfile({ name: e.target.value })}
              placeholder="Your name..."
              style={{
                width: '100%',
                fontSize: 16,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1.5px solid #E5E7EB',
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </SectionCard>

        {/* 5. TRUSTED CONTACTS & EMERGENCY */}
        <SectionCard
          icon="👥"
          title="Trusted Contacts & SOS"
          subtitle="Manage emergency and family contacts for one-touch reach"
        >
          {contacts.length === 0 && !showAddContact && (
            <div style={{
              padding: '16px',
              background: '#F9FAFB',
              borderRadius: 14,
              textAlign: 'center',
              color: '#6B7280',
              fontSize: 15,
            }}>
              No contacts added yet. Add a family member or trusted friend.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {contacts.map(c => (
              <div
                key={c.id}
                style={{
                  background: c.isEmergency ? '#FEF2F2' : '#F9FAFB',
                  border: `1.5px solid ${c.isEmergency ? '#FCA5A5' : '#E5E7EB'}`,
                  borderRadius: 16,
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{c.name}</span>
                    {c.isEmergency && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#DC2626',
                        color: '#fff',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        PRIMARY SOS
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#4B5563', marginTop: 3 }}>
                    {c.relationship} • {c.phone}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a
                    href={`tel:${c.phone}`}
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: '#16A34A', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none', fontSize: 18,
                    }}
                  >
                    📞
                  </a>
                  <button
                    onClick={() => deleteContact(c.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 18, color: '#9CA3AF',
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAddContact ? (
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: 16,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <input
                placeholder="Full Name (e.g. Rahul Sharma)"
                value={newContact.name}
                onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))}
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, border: '1px solid #BBF7D0' }}
              />
              <input
                placeholder="Phone Number (e.g. +91 98765 43210)"
                type="tel"
                value={newContact.phone}
                onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))}
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, border: '1px solid #BBF7D0' }}
              />
              <input
                placeholder="Relationship (e.g. Son, Daughter, Doctor)"
                value={newContact.relationship}
                onChange={e => setNewContact(p => ({ ...p, relationship: e.target.value }))}
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, border: '1px solid #BBF7D0' }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#15803D', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={newContact.isEmergency}
                  onChange={e => setNewContact(p => ({ ...p, isEmergency: e.target.checked }))}
                />
                Set as Primary Emergency SOS Contact
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    if (!newContact.name || !newContact.phone) return;
                    addContact(newContact);
                    setNewContact({ name: '', phone: '', relationship: '', isEmergency: false });
                    setShowAddContact(false);
                  }}
                  style={{
                    flex: 2, padding: '12px', fontSize: 15, fontWeight: 700,
                    background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                  }}
                >
                  Save Contact
                </button>
                <button
                  onClick={() => setShowAddContact(false)}
                  style={{
                    flex: 1, padding: '12px', fontSize: 15,
                    background: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: 10, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddContact(true)}
              style={{
                width: '100%', padding: '14px', fontSize: 15, fontWeight: 700,
                background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              }}
            >
              + Add New Contact
            </button>
          )}
        </SectionCard>

        {/* 6. HEALTH INFORMATION */}
        <SectionCard
          icon="💊"
          title="Health & Medical Records"
          subtitle="Personal health details saved securely on your device only"
        >
          <div style={{
            background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12,
            padding: '12px 14px', fontSize: 13, color: '#92400E',
          }}>
            ⚕️ Hey Dost does not give medical diagnoses. Always consult your doctor for medical advice.
          </div>

          {health.length === 0 && !showAddHealth && (
            <div style={{ padding: '12px 0', color: '#6B7280', fontSize: 14 }}>
              No medical notes added yet.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {health.map(h => (
              <div key={h.id} style={{
                background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 14,
                padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{h.name}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    {h.type} {h.reminderTime ? `• ⏰ ${h.reminderTime}` : ''}
                  </div>
                  {h.details && <div style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>{h.details}</div>}
                </div>
                <button
                  onClick={() => deleteHealth(h.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16 }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

          {showAddHealth ? (
            <div style={{
              background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 16,
              padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12,
            }}>
              <select
                value={newHealth.type}
                onChange={e => setNewHealth(p => ({ ...p, type: e.target.value as any }))}
                style={{ fontSize: 14, padding: '10px', borderRadius: 8, border: '1px solid #BBF7D0' }}
              >
                <option value="medicine">Medicine</option>
                <option value="allergy">Allergy</option>
                <option value="doctor">Doctor</option>
                <option value="hospital">Hospital</option>
                <option value="emergency">Emergency Info</option>
              </select>
              <input
                placeholder="Name (e.g. Metformin 500mg, Dr. Sharma)"
                value={newHealth.name}
                onChange={e => setNewHealth(p => ({ ...p, name: e.target.value }))}
                style={{ fontSize: 14, padding: '10px', borderRadius: 8, border: '1px solid #BBF7D0' }}
              />
              <input
                placeholder="Details (e.g. Take once after dinner)"
                value={newHealth.details}
                onChange={e => setNewHealth(p => ({ ...p, details: e.target.value }))}
                style={{ fontSize: 14, padding: '10px', borderRadius: 8, border: '1px solid #BBF7D0' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    if (!newHealth.name) return;
                    addHealth(newHealth);
                    setNewHealth({ type: 'medicine', name: '', details: '', reminderTime: '' });
                    setShowAddHealth(false);
                  }}
                  style={{
                    flex: 2, padding: '10px', fontSize: 14, fontWeight: 700,
                    background: '#1B8A6B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddHealth(false)}
                  style={{
                    flex: 1, padding: '10px', fontSize: 14,
                    background: '#fff', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddHealth(true)}
              style={{
                marginTop: 12, width: '100%', padding: '12px', fontSize: 14, fontWeight: 700,
                background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 12, cursor: 'pointer',
              }}
            >
              + Add Health Item
            </button>
          )}
        </SectionCard>

        {/* 7. PRIVACY & PERMISSIONS */}
        <SectionCard
          icon="🔒"
          title="Privacy & Permissions"
          subtitle="Honest explanation of how device features are used"
        >
          {[
            { icon: '🎤', name: 'Microphone', desc: 'Used only when you tap to speak or have Hey Dost activation enabled.' },
            { icon: '📷', name: 'Camera', desc: 'Used in the SHOW tab to see what you point at. Frames are never stored permanently.' },
            { icon: '📍', name: 'Location', desc: 'Requested only during an emergency SOS event to share with family or services.' },
            { icon: '💾', name: 'Local Memory', desc: 'All your contacts, reminders, and preferences remain on your device only.' },
          ].map(p => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 0', borderBottom: '1px solid #F3F4F6',
            }}>
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* 8. GOOGLE GEMINI AI CONFIGURATION */}
        <SectionCard
          icon="✨"
          title="Google Gemini AI Connection"
          subtitle="Configure or verify your Gemini AI API Key"
        >
          <div style={{
            background: aiService.isConfigured() ? '#F0FDF4' : '#FFFBEB',
            border: `1.5px solid ${aiService.isConfigured() ? '#BBF7D0' : '#FDE68A'}`,
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{aiService.isConfigured() ? '🟢' : '🟡'}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                {aiService.isConfigured() ? 'Gemini AI Configured & Ready' : 'API Key Missing'}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                Model: Gemini 3.6 Flash with automatic multi-model fallback
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              API Key:
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="Paste your Gemini API Key..."
              style={{
                width: '100%',
                fontSize: 15,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid #E5E7EB',
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                saveApiKey(apiKeyInput);
                setApiTestStatus('✓ API key saved successfully in local storage!');
                setTimeout(() => setApiTestStatus(null), 3000);
              }}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: 14,
                fontWeight: 700,
                background: '#1B8A6B',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              Save Key
            </button>

            <button
              disabled={isTestingApi}
              onClick={async () => {
                setIsTestingApi(true);
                setApiTestStatus('Testing connection with Gemini AI...');
                try {
                  saveApiKey(apiKeyInput);
                  const res = await aiService.chat([], 'Hello! Just testing the connection.', profile.name, 'en');
                  setApiTestStatus(`✓ Connected! AI replied: "${res.text.slice(0, 60)}..."`);
                } catch (err: any) {
                  setApiTestStatus(`⚠️ Connection failed: ${err.message || 'Check key'}`);
                } finally {
                  setIsTestingApi(false);
                }
              }}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: 14,
                fontWeight: 700,
                background: '#0284C7',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                cursor: isTestingApi ? 'not-allowed' : 'pointer',
              }}
            >
              {isTestingApi ? 'Testing...' : 'Test Connection ⚡'}
            </button>
          </div>

          {apiTestStatus && (
            <div style={{
              marginTop: 12,
              background: apiTestStatus.startsWith('✓') ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${apiTestStatus.startsWith('✓') ? '#BBF7D0' : '#FECACA'}`,
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 13,
              color: apiTestStatus.startsWith('✓') ? '#15803D' : '#991B1B',
            }}>
              {apiTestStatus}
            </div>
          )}
        </SectionCard>

        {/* 9. RESET DATA */}
        <div style={{ paddingTop: 8, paddingBottom: 24 }}>
          <button
            onClick={() => {
              if (window.confirm('This will clear all your data, contacts, and reminders. Are you sure?')) {
                storage.clearAll();
                window.location.reload();
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1.5px solid #FECACA',
              borderRadius: 16,
              cursor: 'pointer',
            }}
          >
            🗑 Clear All Data & Reset App
          </button>
        </div>
      </div>
    </div>
  );
};
