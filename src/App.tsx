import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { TalkPage } from './pages/TalkPage';
import { ShowPage } from './pages/ShowPage';
import { LearnPage } from './pages/LearnPage';
import { MyDayPage } from './pages/MyDayPage';
import { SafetyPage } from './pages/SafetyPage';
import { HelpPage } from './pages/HelpPage';
import { SettingsPage } from './pages/SettingsPage';
import { DostLogo } from './components/DostLogo';
import { EmergencyModal } from './components/EmergencyModal';
import { wakeWordService, type WakeRoute } from './services/wakeWord';
import { speechService } from './services/speech';
import type { AppMode, AppTab } from './types';

const PHONE_NAV_ITEMS: { id: AppTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'show', icon: '👁', label: 'Show' },
  { id: 'learn', icon: '📚', label: 'Learn' },
  { id: 'myday', icon: '📅', label: 'My Day' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const SIDEBAR_NAV_ITEMS: { id: AppTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'talk', icon: '💬', label: 'Talk to Dost' },
  { id: 'show', icon: '👁', label: 'Show (See & Guide)' },
  { id: 'learn', icon: '📚', label: 'Learn (Teach Me)' },
  { id: 'myday', icon: '📅', label: 'My Day' },
  { id: 'help', icon: '🚨', label: 'Help / SOS' },
  { id: 'safety', icon: '🛡️', label: 'Keep Me Safe' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

function AppInner() {
  const { profile, activeLanguage } = useApp();
  const [tab, setTab] = useState<AppTab>('home');
  const [appMode, setAppMode] = useState<AppMode>('web');
  const [globalEmergencyText, setGlobalEmergencyText] = useState<string | null>(null);
  const [_wakeWordActive, setWakeWordActive] = useState(false);

  // Setup Hey Dost Active-Page Wake-Word Activation
  useEffect(() => {
    if (!profile.onboardingComplete) return;

    wakeWordService.init({
      onWakeDetected: (_phrase) => {
        const ack =
          activeLanguage === 'hi'
            ? 'जी, मैं सुन रहा हूँ!'
            : activeLanguage === 'hinglish'
              ? 'Ji, main sun raha hoon! Boliye.'
              : "I'm listening!";
        speechService.speak(ack, activeLanguage, profile.voiceGender, profile.voiceSpeed);
      },
      onCommandCaptured: (_command, route: WakeRoute) => {
        setTab(route);
      },
      onStatusChange: (listening) => {
        setWakeWordActive(listening);
      },
    });

    if (profile.wakeWordEnabled) {
      wakeWordService.setEnabled(true);
    } else {
      wakeWordService.setEnabled(false);
    }

    return () => {
      wakeWordService.stop();
    };
  }, [profile.onboardingComplete, profile.wakeWordEnabled, activeLanguage]);

  if (!profile.onboardingComplete) {
    return <OnboardingPage />;
  }

  const renderPage = () => {
    switch (tab) {
      case 'home':
        return (
          <HomePage
            onNavigate={(t) => setTab(t)}
            onStartTalk={() => setTab('talk')}
            appMode={appMode}
            onToggleMode={setAppMode}
          />
        );
      case 'talk':
        return <TalkPage />;
      case 'show':
        return <ShowPage />;
      case 'learn':
        return <LearnPage />;
      case 'myday':
        return <MyDayPage />;
      case 'safety':
        return <SafetyPage />;
      case 'help':
        return <HelpPage onNavigateToSettings={() => setTab('settings')} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            onNavigate={(t) => setTab(t)}
            onStartTalk={() => setTab('talk')}
            appMode={appMode}
            onToggleMode={setAppMode}
          />
        );
    }
  };

  const fontSizeBase =
    profile.fontSize === 'extra-large' ? 20 : profile.fontSize === 'large' ? 17 : 15;
  const highContrast = profile.contrast === 'high';

  const appStyle: React.CSSProperties = {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    fontSize: fontSizeBase,
    background: highContrast ? '#000' : '#FAFAF8',
    color: highContrast ? '#fff' : '#111827',
    minHeight: '100vh',
    position: 'relative',
  };

  // Phone frame simulation wrapper for desktop evaluation matching user reference
  const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#E2E8F0',
      padding: '24px 16px',
    }}>
      {/* Top Floating Switch above phone frame */}
      <div style={{
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        padding: '6px 16px',
        borderRadius: 24,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}>
        <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 600 }}>Preview Layout:</span>
        <div style={{
          display: 'flex', background: '#F3F4F6', borderRadius: 16, padding: 2,
        }}>
          {(['web', 'phone'] as AppMode[]).map(m => (
            <button
              key={m}
              onClick={() => setAppMode(m)}
              style={{
                padding: '5px 14px', fontSize: 12, fontWeight: 700,
                background: appMode === m ? '#1B8A6B' : 'transparent',
                color: appMode === m ? '#fff' : '#6B7280',
                border: 'none', borderRadius: 14, cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {m === 'web' ? '💻 Web' : '📱 Phone'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        width: 390,
        height: 844,
        borderRadius: 48,
        background: '#09090B',
        padding: '12px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.15)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Dynamic Island / Notch */}
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 32, background: '#09090B', borderRadius: '0 0 18px 18px',
          zIndex: 40,
        }} />

        <div style={{
          width: '100%', height: '100%',
          borderRadius: 38,
          overflow: 'hidden',
          background: '#FAFAF8',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  const WebLayout = () => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', ...appStyle }}>
      {/* Top bar for Web Mode */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#fff',
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setTab('home')}
        >
          <DostLogo size="sm" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Wake Word indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 16,
            background: profile.wakeWordEnabled ? '#F0FDF4' : '#F3F4F6',
            fontSize: 12,
            fontWeight: 700,
            color: profile.wakeWordEnabled ? '#15803D' : '#6B7280',
          }}>
            <span>🎙️</span>
            <span>{profile.wakeWordEnabled ? '"Hey Dost" Active' : 'Wake Off'}</span>
          </div>

          {/* Quick SOS Header Pill */}
          <button
            onClick={() => setTab('help')}
            style={{
              padding: '6px 14px',
              borderRadius: 16,
              background: '#DC2626',
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>🚨</span>
            <span>SOS</span>
          </button>

          {/* Mode switch */}
          <div style={{
            display: 'flex', background: '#F3F4F6', borderRadius: 20, padding: 3, gap: 2,
          }}>
            {(['web', 'phone'] as AppMode[]).map(m => (
              <button
                key={m}
                onClick={() => setAppMode(m)}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 700,
                  background: appMode === m ? '#1B8A6B' : 'transparent',
                  color: appMode === m ? '#fff' : '#6B7280',
                  border: 'none', borderRadius: 16, cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                }}
              >
                {m === 'web' ? '💻 Web' : '📱 Phone'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {appMode === 'phone' ? (
        <PhoneFrame>
          <AppContent tab={tab} setTab={setTab} renderPage={renderPage} />
        </PhoneFrame>
      ) : (
        <div style={{
          flex: 1, display: 'flex', maxWidth: 1040, margin: '0 auto', width: '100%',
          padding: '0 0 40px',
        }}>
          {/* Sidebar nav for desktop */}
          <div style={{
            width: 230, flexShrink: 0, padding: '20px 16px',
            borderRight: '1px solid #F3F4F6',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SIDEBAR_NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14,
                    background: tab === item.id ? (item.id === 'help' ? '#FEF2F2' : '#F0FDF4') : 'transparent',
                    border: tab === item.id
                      ? `1.5px solid ${item.id === 'help' ? '#FCA5A5' : '#D1FAE5'}`
                      : '1.5px solid transparent',
                    color: tab === item.id
                      ? (item.id === 'help' ? '#DC2626' : '#1B8A6B')
                      : (item.id === 'help' ? '#DC2626' : '#374151'),
                    fontWeight: tab === item.id ? 800 : 600,
                    fontSize: 15, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAF8' }}>
            {renderPage()}
          </div>
        </div>
      )}

      {/* Global Emergency Modal */}
      {globalEmergencyText && (
        <EmergencyModal
          userStatement={globalEmergencyText}
          onClose={() => setGlobalEmergencyText(null)}
          onAddContact={() => setTab('settings')}
        />
      )}
    </div>
  );

  return <WebLayout />;
}

// Bottom nav + page for mobile / phone layout matching the visual reference
function AppContent({ tab, setTab, renderPage }: { tab: AppTab; setTab: (t: AppTab) => void; renderPage: () => React.ReactNode }) {
  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {renderPage()}
      </div>

      {/* Bottom Navigation matching reference: Home, Show, Learn, My Day, Settings */}
      <nav style={{
        display: 'flex',
        borderTop: '1px solid #E5E7EB',
        background: '#fff',
        flexShrink: 0,
        padding: '6px 0 10px',
      }}>
        {PHONE_NAV_ITEMS.map(item => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                flex: 1,
                padding: '6px 2px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#1B8A6B' : '#9CA3AF',
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>

              {/* Active Indicator Bar matching reference */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  width: 24,
                  height: 3,
                  background: '#1B8A6B',
                  borderRadius: 3,
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

// For actual mobile device browser: responsive full viewport shell
function MobileShell() {
  const { profile } = useApp();
  const [tab, setTab] = useState<AppTab>('home');
  const [globalEmergencyText, setGlobalEmergencyText] = useState<string | null>(null);

  if (!profile.onboardingComplete) return <OnboardingPage />;

  const renderPage = () => {
    switch (tab) {
      case 'home':
        return (
          <HomePage
            onNavigate={(t) => setTab(t)}
            onStartTalk={() => setTab('talk')}
          />
        );
      case 'talk':
        return <TalkPage />;
      case 'show':
        return <ShowPage />;
      case 'learn':
        return <LearnPage />;
      case 'myday':
        return <MyDayPage />;
      case 'safety':
        return <SafetyPage />;
      case 'help':
        return <HelpPage onNavigateToSettings={() => setTab('settings')} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            onNavigate={(t) => setTab(t)}
            onStartTalk={() => setTab('talk')}
          />
        );
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      background: '#FAFAF8',
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderPage()}
      </div>

      <nav style={{
        display: 'flex',
        borderTop: '1px solid #E5E7EB',
        background: '#fff',
        flexShrink: 0,
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        paddingTop: '6px',
      }}>
        {PHONE_NAV_ITEMS.map(item => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                flex: 1,
                padding: '6px 2px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#1B8A6B' : '#9CA3AF',
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>

              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  width: 24,
                  height: 3,
                  background: '#1B8A6B',
                  borderRadius: 3,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {globalEmergencyText && (
        <EmergencyModal
          userStatement={globalEmergencyText}
          onClose={() => setGlobalEmergencyText(null)}
          onAddContact={() => setTab('settings')}
        />
      )}
    </div>
  );
}

function ResponsiveApp() {
  const isMobileBrowser =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));

  if (isMobileBrowser) {
    return <MobileShell />;
  }
  return <AppInner />;
}

function App() {
  return (
    <AppProvider>
      <ResponsiveApp />
    </AppProvider>
  );
}

export default App;
