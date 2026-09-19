import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Language } from '../types';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';
import { detectLanguage, getBrowserSpeechLang } from '../services/language';
import { speechService, startListening } from '../services/speech';
import { isEmergencyDistress } from '../services/emergency';
import { EmergencyModal } from '../components/EmergencyModal';

export const ShowPage: React.FC = () => {
  const { profile, activeLanguage } = useApp();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastError, setLastError] = useState(false);
  const [emergencyText, setEmergencyText] = useState<string | null>(null);

  // Multi-turn visual context history
  const [visualHistory, setVisualHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);

  // Request camera on mount
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. You can still upload a photo below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload a photo.');
      } else {
        setCameraError('Unable to open camera. Please use the upload option below.');
      }
    }
  }, [cameraStream]);

  // Attempt auto-start on first load
  useEffect(() => {
    startCamera();
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      stopListeningRef.current?.();
    };
  }, []);

  // Update video element when stream is ready
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, cameraActive]);

  // Capture frame from active video feed
  const grabFrameFromVideo = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (v.videoWidth === 0 || v.videoHeight === 0) return null;

    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    setImageMime('image/jpeg');
    return dataUrl;
  };

  const handleManualCapture = () => {
    const frame = grabFrameFromVideo();
    if (frame) {
      const hint =
        activeLanguage === 'hi'
          ? 'फोटो ले ली गई है। अब पूछें — यह क्या है या इसका क्या काम है?'
          : activeLanguage === 'hinglish'
            ? 'Photo le li hai. Ab mic dabakar boliye — yeh kya hai?'
            : 'Photo captured. Now tap the mic and ask what you would like to know.';
      speechService.speak(hint, activeLanguage, profile.voiceGender, profile.voiceSpeed);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setCapturedImage(result);
      setImageMime(file.type || 'image/jpeg');
      setVisualHistory([]);
      setLastError(false);

      const promptMsg =
        activeLanguage === 'hi'
          ? 'फोटो लोड हो गई है। बताइए मैं आपकी क्या मदद करूँ?'
          : activeLanguage === 'hinglish'
            ? 'Photo load ho gayi. Boliye, iske baare mein kya janna chahte hain?'
            : 'Photo loaded. Ask me anything about what you see.';
      speechService.speak(promptMsg, activeLanguage, profile.voiceGender, profile.voiceSpeed);
    };
    reader.readAsDataURL(file);
  };

  // Process a question with the image
  const processImageQuestion = async (userQuery: string) => {
    let q = userQuery.trim();
    if (!q) {
      q =
        activeLanguage === 'hi'
          ? 'यह क्या है? मुझे सरल भाषा में समझाएं।'
          : activeLanguage === 'hinglish'
            ? 'Dost, yeh kya hai? Simple shabdon mein samjhao.'
            : 'What is this? Please explain clearly in simple terms.';
    }

    // Emergency check
    if (isEmergencyDistress(q)) {
      setEmergencyText(q);
      return;
    }

    // If no captured image yet, grab current frame from live video!
    let imgToAnalyze = capturedImage;
    if (!imgToAnalyze && cameraActive && videoRef.current) {
      imgToAnalyze = grabFrameFromVideo();
    }

    if (!imgToAnalyze) {
      const noImgMsg =
        activeLanguage === 'hi'
          ? 'कृपया पहले कैमरा चालू करें या फोटो upload करें।'
          : activeLanguage === 'hinglish'
            ? 'Pehle camera open karein ya photo upload karein.'
            : 'Please open the camera or upload a photo first.';
      speechService.speak(noImgMsg, activeLanguage, profile.voiceGender, profile.voiceSpeed);
      return;
    }

    setIsAnalyzing(true);
    setLastError(false);

    const detected = activeLanguage === 'auto' ? detectLanguage(q) : activeLanguage;
    const base64 = imgToAnalyze.split(',')[1];

    // Append to visual history
    const currentHist = [...visualHistory, { role: 'user' as const, text: q }];

    const { text, detectedLang, isError } = await aiService.analyzeImage(
      base64,
      imageMime,
      q,
      profile.name,
      detected,
      visualHistory
    );

    setIsAnalyzing(false);
    if (isError) {
      setLastError(true);
    } else {
      setVisualHistory([...currentHist, { role: 'model', text }]);
    }

    speechService.speak(text, detectedLang, profile.voiceGender, profile.voiceSpeed);
    setQuestion('');
  };

  // Voice handler for SHOW
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListeningRef.current?.();
      stopListeningRef.current = null;
      setIsListening(false);
      return;
    }

    speechService.stop();
    setIsListening(true);
    const speechLang = getBrowserSpeechLang(activeLanguage === 'auto' ? 'en' : activeLanguage);

    const stop = startListening(
      speechLang,
      ({ text }) => {
        setIsListening(false);
        stopListeningRef.current = null;
        if (text.trim()) {
          setQuestion(text);
          processImageQuestion(text);
        }
      },
      _err => {
        setIsListening(false);
        stopListeningRef.current = null;
      },
      () => {
        setIsListening(false);
      }
    );
    stopListeningRef.current = stop;
  };

  const handleResetSession = () => {
    setCapturedImage(null);
    setVisualHistory([]);
    setQuestion('');
    setLastError(false);
    startCamera();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Top Header */}
      <div style={{
        padding: '18px 20px 14px',
        background: '#fff',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
            👁 SHOW — See & Guide
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '2px 0 0' }}>
            Point camera and talk — Hey Dost sees and explains
          </p>
        </div>

        {(capturedImage || visualHistory.length > 0) && (
          <button
            onClick={handleResetSession}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              background: '#F3F4F6',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            🔄 New Photo
          </button>
        )}
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Camera Feed or Captured Image */}
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          aspectRatio: '4/3',
          maxHeight: 360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Visual context"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
              <p style={{ fontSize: 16, color: '#E5E7EB', margin: '0 0 16px' }}>
                {cameraError || 'Camera preview will appear here.'}
              </p>
              <button
                onClick={startCamera}
                style={{
                  padding: '12px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  background: '#1B8A6B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                Allow Camera
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Badge indicator */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(0,0,0,0.65)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}>
            {capturedImage ? '📸 Frozen Frame' : cameraActive ? '🔴 Live Camera' : 'Camera Off'}
          </div>

          {/* Quick upload overlay button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(255,255,255,0.9)',
              color: '#374151',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📁 Upload
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Primary Action Controls: Capture + Large Mic */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Capture button */}
          <button
            onClick={handleManualCapture}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              background: '#F3F4F6',
              color: '#111827',
              border: '1.5px solid #D1D5DB',
              borderRadius: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            📸 <span>Take Photo</span>
          </button>

          {/* Real Large Microphone Button */}
          <button
            onClick={handleVoiceToggle}
            disabled={isAnalyzing}
            style={{
              flex: 2,
              padding: '16px',
              fontSize: 18,
              fontWeight: 800,
              background: isListening ? '#EF4444' : '#1B8A6B',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.5)' : '0 4px 14px rgba(27, 138, 107, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 22 }}>{isListening ? '⏹' : '🎤'}</span>
            <span>{isListening ? 'Listening...' : 'Speak to Camera'}</span>
          </button>
        </div>

        {/* Suggested Quick Questions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            'Dost, yeh kya hai?',
            'How do I use this?',
            'Is button ka kya kaam hai?',
            'Read this for me',
          ].map(qText => (
            <button
              key={qText}
              onClick={() => processImageQuestion(qText)}
              disabled={isAnalyzing}
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 16,
                padding: '8px 14px',
                fontSize: 14,
                color: '#1B8A6B',
                fontWeight: 600,
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              }}
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Text Input Fallback */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && processImageQuestion(question)}
            placeholder="Or type a question about what you see..."
            style={{
              flex: 1,
              fontSize: 15,
              padding: '12px 16px',
              borderRadius: 14,
              border: '1.5px solid #E5E7EB',
              outline: 'none',
              background: '#fff',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => processImageQuestion(question)}
            disabled={isAnalyzing}
            style={{
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: 700,
              background: '#1B8A6B',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            }}
          >
            Ask
          </button>
        </div>

        {/* Analyzing indicator */}
        {isAnalyzing && (
          <div style={{
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            borderRadius: 16,
            padding: '16px',
            textAlign: 'center',
            color: '#1B8A6B',
            fontWeight: 600,
            fontSize: 16,
          }}>
            🔍 Dost is examining what you showed...
          </div>
        )}

        {/* Visual Conversation History (Multi-turn context) */}
        {visualHistory.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Visual Q&A Discussion
            </div>
            {visualHistory.map((turn, idx) => (
              <div
                key={idx}
                style={{
                  background: turn.role === 'user' ? '#F3F4F6' : '#F0FDF4',
                  border: `1.5px solid ${turn.role === 'user' ? '#E5E7EB' : '#BBF7D0'}`,
                  borderRadius: 16,
                  padding: '14px 18px',
                  alignSelf: turn.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: turn.role === 'user' ? '#4B5563' : '#15803D', marginBottom: 4 }}>
                  {turn.role === 'user' ? 'YOU ASKED' : 'DOST EXPLAINS'}
                </div>
                <div style={{ fontSize: 16, color: '#111827', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {turn.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / Try Again Banner */}
        {lastError && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: 16,
            padding: '16px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#991B1B', fontSize: 15, margin: '0 0 12px' }}>
              Dost is unable to connect to AI right now.
            </p>
            <button
              onClick={() => processImageQuestion(question)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 700,
                background: '#DC2626',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Proactive Emergency Trigger */}
      {emergencyText && (
        <EmergencyModal
          userStatement={emergencyText}
          onClose={() => setEmergencyText(null)}
          onAddContact={() => {}}
        />
      )}
    </div>
  );
};
