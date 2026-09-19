import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';
import { detectLanguage } from '../services/language';
import { speechService } from '../services/speech';

export const SafetyPage: React.FC = () => {
  const { profile, activeLanguage } = useApp();
  const [inputText, setInputText] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<'input' | 'result'>('input');

  const analyze = async () => {
    if (!inputText.trim() && !capturedImage) return;
    setIsAnalyzing(true);

    const detected = activeLanguage === 'auto' ? detectLanguage(inputText) : activeLanguage;

    let analysisResult = '';

    if (capturedImage && aiService.isConfigured()) {
      const base64 = capturedImage.split(',')[1];
      const q = detected === 'hi'
        ? 'क्या यह message safe है? Warning signs क्या हैं?'
        : detected === 'hinglish'
          ? 'Kya ye message safe hai? Koi warning signs hain?'
          : 'Is this message safe? What warning signs do you see?';
      const { text } = await aiService.analyzeImage(base64, 'image/jpeg', q, profile.name, detected as any);
      analysisResult = text;
    } else if (inputText.trim()) {
      analysisResult = aiService.analyzeSafetyText(inputText, detected as any);
    }

    setResult(analysisResult);
    speechService.speak(analysisResult, detected as any, profile.voiceGender, profile.voiceSpeed);
    setMode('result');
    setIsAnalyzing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCapturedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setInputText('');
    setCapturedImage(null);
    setResult('');
    setMode('input');
  };

  const L = activeLanguage;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{
        padding: '20px 20px 12px',
        background: '#FAFAF8', borderBottom: '1px solid #F3F4F6', flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
          🛡 {L === 'hi' ? 'मुझे सुरक्षित रखो' : L === 'hinglish' ? 'Mujhe Safe Rakho' : 'Keep Me Safe'}
        </h2>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '4px 0 0' }}>
          {L === 'hi' ? 'संदिग्ध message check करें'
           : L === 'hinglish' ? 'Suspicious message check karo'
           : 'Check suspicious messages or images'}
        </p>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'input' && (
          <>
            <div style={{
              background: '#FFF7ED', border: '1.5px solid #FED7AA',
              borderRadius: 16, padding: '16px 20px',
              fontSize: 15, color: '#92400E', lineHeight: 1.6,
            }}>
              <strong>⚠️ How to use:</strong> Paste a suspicious message below, or upload a screenshot. I'll check it for warning signs.
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                {L === 'hi' ? 'संदिग्ध message यहाँ paste करें:' : L === 'hinglish' ? 'Suspicious message paste karo:' : 'Paste the suspicious message here:'}
              </label>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={
                  L === 'hi' ? 'Message यहाँ paste करें...' :
                  L === 'hinglish' ? 'Message yahan paste karo...' :
                  'Paste message here...'
                }
                rows={5}
                style={{
                  width: '100%', fontSize: 16,
                  padding: '14px 16px',
                  borderRadius: 14, border: '1.5px solid #E5E7EB',
                  outline: 'none', background: '#fff', color: '#111827',
                  fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
              />
            </div>

            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
              — {L === 'hinglish' ? 'ya phir' : L === 'hi' ? 'या फिर' : 'or'} —
            </div>

            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '18px', background: '#FFFBEB', border: '2px dashed #F59E2B',
              borderRadius: 16, cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#92400E',
            }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              🖼 {L === 'hinglish' ? 'Screenshot Upload Karo' : L === 'hi' ? 'Screenshot Upload करें' : 'Upload Screenshot'}
            </label>

            {capturedImage && (
              <img src={capturedImage} alt="screenshot" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 200 }} />
            )}

            <button
              onClick={analyze}
              disabled={(!inputText.trim() && !capturedImage) || isAnalyzing}
              style={{
                width: '100%', padding: '18px',
                fontSize: 17, fontWeight: 700,
                background: (inputText.trim() || capturedImage) && !isAnalyzing ? '#1B8A6B' : '#D1D5DB',
                color: '#fff', border: 'none', borderRadius: 14,
                cursor: (inputText.trim() || capturedImage) && !isAnalyzing ? 'pointer' : 'not-allowed',
              }}
            >
              {isAnalyzing
                ? '🔍 Checking...'
                : L === 'hinglish' ? '🛡 Check Karo' : L === 'hi' ? '🛡 जांचें' : '🛡 Check This'}
            </button>
          </>
        )}

        {mode === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {capturedImage && (
              <img src={capturedImage} alt="Checked" style={{ width: '100%', borderRadius: 12, maxHeight: 180, objectFit: 'cover' }} />
            )}
            {inputText && (
              <div style={{
                background: '#F9FAFB', borderRadius: 12, padding: '14px',
                fontSize: 14, color: '#374151', borderLeft: '4px solid #E5E7EB',
                fontStyle: 'italic',
              }}>
                "{inputText}"
              </div>
            )}

            <div style={{
              background: result.includes('⚠️') ? '#FFF7ED' : '#F0FDF4',
              border: `2px solid ${result.includes('⚠️') ? '#FDBA74' : '#86EFAC'}`,
              borderRadius: 18, padding: '20px',
              fontSize: 16, lineHeight: 1.8, color: '#111827',
              whiteSpace: 'pre-wrap',
            }}>
              {result}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.includes('⚠️') && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginTop: 4 }}>
                    {L === 'hinglish' ? 'Aap kya karna chahte ho?' : L === 'hi' ? 'आप क्या करना चाहते हैं?' : 'What would you like to do?'}
                  </div>
                  <button style={{
                    padding: '14px', fontSize: 15, fontWeight: 600,
                    background: '#FEF2F2', color: '#991B1B',
                    border: '1.5px solid #FECACA', borderRadius: 14, cursor: 'pointer',
                  }}>
                    🚫 {L === 'hinglish' ? "Click Mat Karo" : L === 'hi' ? 'Click मत करें' : "Don't Click This"}
                  </button>
                  <button style={{
                    padding: '14px', fontSize: 15, fontWeight: 600,
                    background: '#EFF6FF', color: '#1D4ED8',
                    border: '1.5px solid #BFDBFE', borderRadius: 14, cursor: 'pointer',
                  }}>
                    👨‍👩‍👧 {L === 'hinglish' ? 'Trusted insaan ko dikhao' : L === 'hi' ? 'किसी trusted को दिखाएं' : 'Show to someone I trust'}
                  </button>
                </>
              )}
              <button
                onClick={reset}
                style={{
                  padding: '14px', fontSize: 15, fontWeight: 600,
                  background: '#1B8A6B', color: '#fff',
                  border: 'none', borderRadius: 14, cursor: 'pointer',
                }}
              >
                {L === 'hinglish' ? '← Wapas Jao' : L === 'hi' ? '← वापस जाएं' : '← Check Another'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
