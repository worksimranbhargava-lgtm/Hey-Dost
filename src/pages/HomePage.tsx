import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DostLogo } from '../components/DostLogo';
import type { AppTab, Language } from '../types';
import { getLanguageLabel } from '../services/language';

interface Props {
  onNavigate: (tab: AppTab) => void;
  onStartTalk: () => void;
  appMode?: 'web' | 'phone';
  onToggleMode?: (mode: 'web' | 'phone') => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate, onStartTalk, appMode = 'web', onToggleMode }) => {
  const { profile, updateProfile, reminders, learnedTasks, activeLanguage, setActiveLanguage } = useApp();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    activeLanguage === 'hi'
      ? (hour < 12 ? 'शुभ प्रभात' : hour < 17 ? 'शुभ दोपहर' : 'शुभ संध्या')
      : activeLanguage === 'hinglish'
        ? (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')
        : (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');

  const subMsg =
    activeLanguage === 'hi' ? 'मैं यहाँ हूँ आपकी मदद के लिए।' :
    activeLanguage === 'hinglish' ? 'Main yahin hoon, aapki madad ke liye.' :
    "I'm here to help.";

  const todayReminders = reminders.filter(r => {
    if (r.completed) return false;
    const today = new Date().toISOString().slice(0, 10);
    return !r.date || r.date === today;
  });

  const handleLanguageSelect = (lang: Language) => {
    updateProfile({ language: lang });
    setActiveLanguage(lang);
    setShowLangMenu(false);
  };

  const primaryActions = [
    {
      id: 'show' as AppTab,
      icon: '👁',
      title: activeLanguage === 'hi' ? 'दिखाओ' : activeLanguage === 'hinglish' ? 'Dikhao' : 'Show',
      sub: activeLanguage === 'hi' ? 'मुझे दिखाएं' : activeLanguage === 'hinglish' ? 'Mujhe dikhao' : 'Show me',
      bg: '#F0FDF4',
      border: '#DCFCE7',
      iconBg: '#DCFCE7',
      color: '#15803D',
    },
    {
      id: 'learn' as AppTab,
      icon: '📚',
      title: activeLanguage === 'hi' ? 'सिखाओ' : activeLanguage === 'hinglish' ? 'Sikhao' : 'Learn',
      sub: activeLanguage === 'hi' ? 'मुझे सिखाओ' : activeLanguage === 'hinglish' ? 'Sikhao' : 'Teach me',
      bg: '#EFF6FF',
      border: '#DBEAFE',
      iconBg: '#DBEAFE',
      color: '#1D4ED8',
    },
    {
      id: 'myday' as AppTab,
      icon: '📅',
      title: activeLanguage === 'hi' ? 'मेरा दिन' : activeLanguage === 'hinglish' ? 'Mera Din' : 'My Day',
      sub: activeLanguage === 'hi' ? 'Reminders और काम' : activeLanguage === 'hinglish' ? 'Reminders & tasks' : 'Reminders & tasks',
      bg: '#FFFBEB',
      border: '#FEF3C7',
      iconBg: '#FEF3C7',
      color: '#B45309',
    },
    {
      id: 'help' as AppTab,
      icon: '📞',
      title: 'Help / SOS',
      sub: activeLanguage === 'hi' ? 'मुझे मदद चाहिए' : activeLanguage === 'hinglish' ? 'I need assistance' : 'I need assistance',
      bg: '#FEF2F2',
      border: '#FEE2E2',
      iconBg: '#FEE2E2',
      color: '#DC2626',
    },
  ];

  return (
    <div style={{
      minHeight: '100%',
      background: '#FAFAF8',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '32px',
    }}>
      {/* Top Header Bar: Language Pill + Web/Phone Toggle (No duplicate logo) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 8px',
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Language Selector Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <span>🌐</span>
            <span>{getLanguageLabel(profile.language)}</span>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>▼</span>
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              borderRadius: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 160,
              zIndex: 30,
            }}>
              {[
                { label: 'Auto Detect', val: 'auto' as Language },
                { label: 'English', val: 'en' as Language },
                { label: 'Hinglish', val: 'hinglish' as Language },
                { label: 'हिन्दी (Hindi)', val: 'hi' as Language },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => handleLanguageSelect(opt.val)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: profile.language === opt.val ? '#F0FDF4' : 'transparent',
                    color: profile.language === opt.val ? '#15803D' : '#374151',
                    fontWeight: profile.language === opt.val ? 700 : 500,
                    fontSize: 13,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Web / Phone Switch */}
        {onToggleMode && (
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: 20,
            padding: 2,
            border: '1px solid #E5E7EB',
          }}>
            {(['web', 'phone'] as const).map(m => (
              <button
                key={m}
                onClick={() => onToggleMode(m)}
                style={{
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  background: appMode === m ? (m === 'phone' ? '#1B8A6B' : '#fff') : 'transparent',
                  color: appMode === m ? (m === 'phone' ? '#fff' : '#111827') : '#6B7280',
                  border: 'none',
                  borderRadius: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  textTransform: 'uppercase',
                }}
              >
                <span>{m === 'web' ? '💻' : '📱'}</span>
                <span>{m}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. EXACT HEY DOST LOGO — PROMINENT AND CENTERED */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 20px 4px',
      }}>
        <DostLogo size="prominent" />
      </div>

      {/* 2. GREETING */}
      <div style={{ textAlign: 'center', padding: '0 20px 18px' }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#111827',
          margin: '0 0 4px',
          letterSpacing: '-0.02em',
        }}>
          {greeting}, {profile.name || 'Friend'} 👋
        </h1>
        <p style={{
          fontSize: 16,
          color: '#6B7280',
          margin: 0,
          fontWeight: 500,
        }}>
          {subMsg}
        </p>
      </div>

      {/* 3. TALK TO DOST PRIMARY BUTTON */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0 20px 24px',
      }}>
        <button
          onClick={onStartTalk}
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '16px 24px',
            borderRadius: 32,
            background: '#1B8A6B',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            boxShadow: '0 6px 20px rgba(27, 138, 107, 0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          {/* Microphone Icon in Circle */}
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}>
            🎤
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {activeLanguage === 'hi' ? 'Dost से बात करें' : activeLanguage === 'hinglish' ? 'Talk to Dost' : 'Talk to Dost'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2, fontWeight: 500 }}>
              {activeLanguage === 'hi' ? 'बोलें या type करें' : activeLanguage === 'hinglish' ? 'Tap to speak or type' : 'Tap to speak or type'}
            </div>
          </div>
        </button>
      </div>

      {/* 4. QUICK ACTIONS SECTION */}
      <div style={{ padding: '0 20px', maxWidth: 440, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#9CA3AF',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          Quick Actions
        </div>

        {/* 2x2 Grid: Show, Learn, My Day, Help/SOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 12,
        }}>
          {primaryActions.map(a => (
            <button
              key={a.id}
              onClick={() => onNavigate(a.id)}
              style={{
                background: a.bg,
                border: `1.5px solid ${a.border}`,
                borderRadius: 20,
                padding: '16px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 104,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <span style={{ fontSize: 26 }}>{a.icon}</span>
                <span style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 600 }}>›</span>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, fontWeight: 500 }}>
                  {a.sub}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Full-Width Card: Keep Me Safe */}
        <button
          onClick={() => onNavigate('safety')}
          style={{
            width: '100%',
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: 20,
            padding: '16px 18px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: 20,
          }}
        >
          {/* Shield Badge */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}>
            🛡️
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
              {activeLanguage === 'hi' ? 'संदेश सुरक्षा (Keep Me Safe)' : 'Keep Me Safe'}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: 500 }}>
              {activeLanguage === 'hi' ? 'संदिग्ध message, links और scam जांचें' : 'Check suspicious messages, links & scams'}
            </div>
          </div>

          <span style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 600 }}>›</span>
        </button>

        {/* Real Data: Today's Reminders (Empty state: "Your day is clear.") */}
        {todayReminders.length > 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 18,
            padding: '16px 18px',
            border: '1.5px solid #E5E7EB',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Today's Scheduled Reminders
            </div>
            {todayReminders.slice(0, 2).map(r => (
              <div
                key={r.id}
                onClick={() => onNavigate('myday')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 16 }}>⏰</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{r.text}</div>
                  {r.time && <div style={{ fontSize: 12, color: '#6B7280' }}>{r.time}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Real Data: What You Have Learned */}
        {learnedTasks.length > 0 && (
          <div style={{
            background: '#F0FDF4',
            borderRadius: 18,
            padding: '14px 18px',
            border: '1.5px solid #DCFCE7',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Tasks You've Learned
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {learnedTasks.slice(0, 3).map(t => (
                <span
                  key={t.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #BBF7D0',
                    borderRadius: 14,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#15803D',
                  }}
                >
                  ✓ {t.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
