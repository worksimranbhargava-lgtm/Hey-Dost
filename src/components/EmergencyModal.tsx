import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { buildEmergencyAlertMessage } from '../services/emergency';

interface Props {
  userStatement: string;
  onClose: () => void;
  onAddContact: () => void;
}

export const EmergencyModal: React.FC<Props> = ({ userStatement, onClose, onAddContact }) => {
  const { profile, contacts, activeLanguage } = useApp();
  const [confirmedNeedHelp, setConfirmedNeedHelp] = useState<boolean | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'fetching' | 'granted' | 'denied'>('prompt');
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; url: string } | null>(null);

  const emergencyContact = contacts.find(c => c.isEmergency) || contacts[0];

  useEffect(() => {
    // Speak calm confirmation prompt
    const promptText =
      activeLanguage === 'hi'
        ? 'क्या आप ठीक हैं? क्या आपको अभी मदद चाहिए?'
        : activeLanguage === 'hinglish'
          ? 'Kya aap theek hain? Kya aapko abhi madad chahiye?'
          : 'Are you okay? Do you need help right now?';

    speechService.speak(promptText, activeLanguage, profile.voiceGender, profile.voiceSpeed);
  }, []);

  const requestRealLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const url = `https://maps.google.com/?q=${lat},${lng}`;
        setLocationData({ lat, lng, url });
        setLocationStatus('granted');
      },
      _err => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleYesNeedHelp = () => {
    setConfirmedNeedHelp(true);
    requestRealLocation();
    const alertSpeech =
      activeLanguage === 'hi'
        ? 'आपको तुरंत चिकित्सा सहायता की आवश्यकता हो सकती है। हम आपके आपातकालीन संपर्क से जुड़ रहे हैं।'
        : activeLanguage === 'hinglish'
          ? 'Aapko urgent medical help ki zaroorat ho sakti hai. Hum emergency contact ko contact karne mein madad kar rahe hain.'
          : 'You may need urgent medical help. Let us reach your emergency contact immediately.';

    speechService.speak(alertSpeech, activeLanguage, profile.voiceGender, profile.voiceSpeed);
  };

  const handleNoOkay = () => {
    const calmMsg =
      activeLanguage === 'hi'
        ? 'यह जानकर राहत मिली कि आप ठीक हैं। मैं हमेशा आपके साथ हूँ।'
        : activeLanguage === 'hinglish'
          ? 'Shukar hai aap theek hain. Main yahin aapke saath hoon.'
          : "I am glad to know you are okay. I'm right here with you.";
    speechService.speak(calmMsg, activeLanguage, profile.voiceGender, profile.voiceSpeed);
    onClose();
  };

  const emergencyMessage = emergencyContact
    ? buildEmergencyAlertMessage(
        profile.name,
        userStatement,
        locationData ? locationData.url : undefined
      )
    : '';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(127, 29, 29, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '28px 24px',
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '3px solid #DC2626',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🚨</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#991B1B', margin: '0 0 8px' }}>
          {activeLanguage === 'hi' ? 'आपातकालीन सहायता' : activeLanguage === 'hinglish' ? 'Emergency Help' : 'Emergency Check'}
        </h2>

        <p style={{ fontSize: 16, color: '#4B5563', margin: '0 0 20px', lineHeight: 1.5 }}>
          You said: <em>"{userStatement}"</em>
        </p>

        {confirmedNeedHelp === null ? (
          <div>
            <div style={{
              background: '#FEF2F2',
              borderRadius: 16,
              padding: '20px',
              border: '2px solid #FCA5A5',
              marginBottom: 24,
            }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#991B1B', margin: 0, lineHeight: 1.4 }}>
                {activeLanguage === 'hi'
                  ? 'क्या आप ठीक हैं? क्या आपको अभी मदद चाहिए?'
                  : activeLanguage === 'hinglish'
                    ? 'Kya aap theek hain? Kya aapko abhi madad chahiye?'
                    : 'Are you okay? Do you need help right now?'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button
                onClick={handleYesNeedHelp}
                style={{
                  padding: '20px',
                  fontSize: 18,
                  fontWeight: 800,
                  background: '#DC2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                }}
              >
                🚨 {activeLanguage === 'hi' ? 'हाँ, मुझे अभी मदद चाहिए' : activeLanguage === 'hinglish' ? 'Haan, Mujhe Madad Chahiye' : 'YES, I NEED HELP'}
              </button>

              <button
                onClick={handleNoOkay}
                style={{
                  padding: '18px',
                  fontSize: 17,
                  fontWeight: 700,
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: 16,
                  cursor: 'pointer',
                }}
              >
                ✓ {activeLanguage === 'hi' ? 'नहीं, मैं ठीक हूँ' : activeLanguage === 'hinglish' ? 'Nahi, Main Theek Hoon' : 'NO, I AM OKAY'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              background: '#FEF2F2',
              borderRadius: 16,
              padding: '16px',
              marginBottom: 20,
              fontSize: 15,
              color: '#991B1B',
              lineHeight: 1.5,
              textAlign: 'left',
            }}>
              <strong>⚠️ Caution:</strong> You may need urgent medical help. Please connect with your emergency contact or emergency services.
            </div>

            {/* Real Location status */}
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 13,
              color: '#4B5563',
              marginBottom: 16,
              textAlign: 'left',
            }}>
              📍 <strong>Location:</strong>{' '}
              {locationStatus === 'fetching' ? 'Requesting GPS coordinates...' :
               locationStatus === 'granted' && locationData ? `${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)} (Attached)` :
               locationStatus === 'denied' ? 'Permission denied (no location added)' :
               'Not shared'}
            </div>

            {emergencyContact ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{
                  padding: '14px',
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: 14,
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>EMERGENCY CONTACT</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{emergencyContact.name}</div>
                  <div style={{ fontSize: 14, color: '#4B5563' }}>{emergencyContact.relationship} • {emergencyContact.phone}</div>
                </div>

                <a
                  href={`tel:${emergencyContact.phone}`}
                  style={{
                    display: 'block',
                    padding: '18px',
                    fontSize: 18,
                    fontWeight: 800,
                    background: '#16A34A',
                    color: '#fff',
                    borderRadius: 14,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  📞 Call {emergencyContact.name}
                </a>

                <a
                  href={`sms:${emergencyContact.phone}?body=${encodeURIComponent(emergencyMessage)}`}
                  style={{
                    display: 'block',
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 700,
                    background: '#2563EB',
                    color: '#fff',
                    borderRadius: 14,
                    textDecoration: 'none',
                  }}
                >
                  💬 Send SOS SMS
                </a>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 12 }}>
                  No emergency contact added yet.
                </p>
                <button
                  onClick={() => { onClose(); onAddContact(); }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: 16,
                    fontWeight: 700,
                    background: '#1B8A6B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    marginBottom: 10,
                  }}
                >
                  + Add Emergency Contact
                </button>
              </div>
            )}

            {/* Direct 112 Dial */}
            <a
              href="tel:112"
              style={{
                display: 'block',
                padding: '14px',
                fontSize: 16,
                fontWeight: 700,
                background: '#DC2626',
                color: '#fff',
                borderRadius: 14,
                textDecoration: 'none',
                marginBottom: 14,
              }}
            >
              🚨 Call Emergency Services (112)
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 15,
                color: '#6B7280',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '8px',
              }}
            >
              Close this window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
