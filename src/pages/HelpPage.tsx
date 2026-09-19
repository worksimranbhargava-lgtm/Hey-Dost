import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';

interface Props {
  onNavigateToSettings: () => void;
}

export const HelpPage: React.FC<Props> = ({ onNavigateToSettings }) => {
  const { profile, contacts, activeLanguage } = useApp();
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number; mapsUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const emergencyContact = contacts.find(c => c.isEmergency) || contacts[0];

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setCoords({ lat, lng, mapsUrl });
        setLocationStatus('granted');

        const voiceMsg =
          activeLanguage === 'hi'
            ? 'आपकी वर्तमान location प्राप्त कर ली गई है।'
            : activeLanguage === 'hinglish'
              ? 'Aapki live location mil gayi hai.'
              : 'Your location has been retrieved.';
        speechService.speak(voiceMsg, activeLanguage, profile.voiceGender, profile.voiceSpeed);
      },
      _err => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const emergencySmsBody = emergencyContact
    ? encodeURIComponent(
        `EMERGENCY ALERT: ${profile.name || 'Your family member'} needs urgent help! ${
          coords ? `Location: ${coords.mapsUrl}` : ''
        }`
      )
    : '';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Top Banner */}
      <div style={{
        padding: '24px 20px 16px',
        background: '#FEF2F2',
        borderBottom: '2px solid #FCA5A5',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🚨</span>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#991B1B', margin: 0 }}>
              {activeLanguage === 'hi' ? 'आपातकालीन सहायता (HELP / SOS)' : activeLanguage === 'hinglish' ? 'Help / SOS Emergency' : 'HELP / SOS Emergency'}
            </h2>
            <p style={{ fontSize: 14, color: '#7F1D1D', margin: '4px 0 0' }}>
              One-touch emergency calling and verified location sharing
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Primary Emergency Contact Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1.5px solid #E5E7EB',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Emergency Contact
          </div>

          {emergencyContact ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                    {emergencyContact.name}
                  </div>
                  <div style={{ fontSize: 15, color: '#4B5563', marginTop: 4 }}>
                    {emergencyContact.relationship} • {emergencyContact.phone}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid #FECACA',
                }}>
                  PRIMARY SOS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href={`tel:${emergencyContact.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '18px',
                    fontSize: 18,
                    fontWeight: 800,
                    background: '#16A34A',
                    color: '#fff',
                    borderRadius: 16,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  <span style={{ fontSize: 24 }}>📞</span>
                  <span>Call {emergencyContact.name}</span>
                </a>

                <a
                  href={`sms:${emergencyContact.phone}?body=${emergencySmsBody}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 700,
                    background: '#2563EB',
                    color: '#fff',
                    borderRadius: 16,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: 20 }}>💬</span>
                  <span>Send SOS SMS</span>
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                No emergency contact added.
              </div>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 16px' }}>
                Add someone you trust so you can reach them in an emergency.
              </p>
              <button
                onClick={onNavigateToSettings}
                style={{
                  padding: '16px 24px',
                  fontSize: 16,
                  fontWeight: 700,
                  background: '#DC2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                }}
              >
                + ADD EMERGENCY CONTACT
              </button>
            </div>
          )}
        </div>

        {/* Real Location Sharing */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1.5px solid #E5E7EB',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Real-Time Location
          </div>

          {locationStatus === 'idle' && (
            <div>
              <p style={{ fontSize: 14, color: '#4B5563', margin: '0 0 14px' }}>
                Hey Dost will request your browser GPS location to share in an emergency. Never fabricated.
              </p>
              <button
                onClick={handleShareLocation}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: 16,
                  fontWeight: 700,
                  background: '#0284C7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                📍 <span>Get & Share My Current Location</span>
              </button>
            </div>
          )}

          {locationStatus === 'fetching' && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#0284C7', fontSize: 16, fontWeight: 600 }}>
              ⏳ Requesting GPS coordinates from device...
            </div>
          )}

          {locationStatus === 'granted' && coords && (
            <div>
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 14,
                padding: '14px 16px',
                marginBottom: 14,
              }}>
                <div style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>VERIFIED GPS COORDINATES</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 4 }}>
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
                <a
                  href={coords.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 14, color: '#0284C7', textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}
                >
                  View on Google Maps ↗
                </a>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(coords.mapsUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 600,
                    background: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copied Link' : '📋 Copy Location Link'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`My location: ${coords.mapsUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: '#25D366',
                    color: '#fff',
                    borderRadius: 12,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}

          {locationStatus === 'denied' && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              padding: '14px',
              fontSize: 14,
              color: '#991B1B',
            }}>
              ⚠️ Location permission was denied or is unavailable on this device. Hey Dost will never fabricate fake coordinates.
            </div>
          )}
        </div>

        {/* Local Emergency Services in India / General */}
        <div style={{
          background: '#FFF7ED',
          border: '1.5px solid #FED7AA',
          borderRadius: 20,
          padding: '20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            National Emergency Services
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <a
              href="tel:112"
              style={{
                padding: '16px',
                background: '#DC2626',
                color: '#fff',
                borderRadius: 14,
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              🚨 112 <br />
              <span style={{ fontSize: 13, fontWeight: 500 }}>All Emergency</span>
            </a>

            <a
              href="tel:108"
              style={{
                padding: '16px',
                background: '#EA580C',
                color: '#fff',
                borderRadius: 14,
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              🚑 108 <br />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Ambulance</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
