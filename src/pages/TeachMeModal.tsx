import React, { useState, useEffect } from 'react';
import type { TeachFlow, Language } from '../types';
import { useApp } from '../context/AppContext';
import { speechService, startListening } from '../services/speech';
import { getBrowserSpeechLang } from '../services/language';

interface Props {
  flow: TeachFlow;
  language: Language;
  onClose: () => void;
}

export const TeachMeModal: React.FC<Props> = ({ flow, language, onClose }) => {
  const { profile, markTaskLearned } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showHelpMessage, setShowHelpMessage] = useState<string | null>(null);
  const [showVisualHighlight, setShowVisualHighlight] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const currentStepData = flow.steps[currentStep];

  const getInstruction = (step: TeachFlow['steps'][number]): string => {
    if (language === 'hi' && step.instructionHi) return step.instructionHi;
    if (language === 'hinglish' && step.instructionHinglish) return step.instructionHinglish;
    return step.instruction;
  };

  const getTitle = (): string => {
    if (language === 'hi' && flow.titleHi) return flow.titleHi;
    if (language === 'hinglish' && flow.titleHinglish) return flow.titleHinglish;
    return flow.title;
  };

  // Speak step whenever step changes
  useEffect(() => {
    if (!currentStepData || finished) return;
    const instruction = getInstruction(currentStepData);
    const pacingQuestion =
      language === 'hi'
        ? `${instruction} ... हो गया? अगला step करें?`
        : language === 'hinglish'
          ? `${instruction} ... Ho gaya? Agla step karein?`
          : `${instruction} ... All done? Ready for the next step?`;

    speechService.speak(pacingQuestion, language, profile.voiceGender, profile.voiceSpeed);
  }, [currentStep, finished]);

  // Next step
  const handleNextStep = () => {
    setShowHelpMessage(null);
    setShowVisualHighlight(false);
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);

    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setFinished(true);
      markTaskLearned(flow.id, getTitle(), flow.steps.length);
      const doneMsg =
        language === 'hi'
          ? 'शाबाश! आपने यह काम सीख लिया! अगली बार आप खुद कर सकते हैं।'
          : language === 'hinglish'
            ? 'Shabash! Aapne ye task seekh liya! Agli baar aap khud try kar sakte ho.'
            : 'Congratulations! You learned this step by step. Next time you can do it yourself.';
      speechService.speak(doneMsg, language, profile.voiceGender, profile.voiceSpeed);
    }
  };

  // Go Back
  const handleGoBack = () => {
    if (currentStep > 0) {
      setShowHelpMessage(null);
      setShowVisualHighlight(false);
      setCurrentStep(prev => prev - 1);
    }
  };

  // Repeat
  const handleRepeat = () => {
    if (!currentStepData) return;
    const text = getInstruction(currentStepData);
    speechService.speak(text, language, profile.voiceGender, profile.voiceSpeed);
  };

  // Show Again
  const handleShowAgain = () => {
    setShowVisualHighlight(true);
    const explainMsg =
      language === 'hi'
        ? `ध्यान से देखें: ${currentStepData.actionHint || currentStepData.target || 'स्क्रीन पर निर्देश'}`
        : language === 'hinglish'
          ? `Dhyan se dekhiye: ${currentStepData.actionHint || currentStepData.target || 'screen par instructions'}`
          : `Look closely here: ${currentStepData.actionHint || currentStepData.target || 'on your screen'}`;
    speechService.speak(explainMsg, language, profile.voiceGender, profile.voiceSpeed);
  };

  // Help / Mistake Recovery
  const handleHelpRecovery = (customMsg?: string) => {
    const recoveryNotice =
      language === 'hi'
        ? 'कोई बात नहीं। हम दोबारा करते हैं। बिल्कुल चिंता मत कीजिए।'
        : language === 'hinglish'
          ? 'Koi baat nahi. Hum dobara karte hain. Bilkul fikar mat kijiye.'
          : "That's completely okay. Let's do it together again. No worries.";

    setShowHelpMessage(customMsg || recoveryNotice);
    speechService.speak(recoveryNotice, language, profile.voiceGender, profile.voiceSpeed);

    // After 2 seconds, repeat the current step simply
    setTimeout(() => {
      if (currentStepData) {
        speechService.speak(getInstruction(currentStepData), language, profile.voiceGender, profile.voiceSpeed);
      }
    }, 2400);
  };

  // Voice listener for verbal recovery ("galat ho gaya", "nahi ho raha")
  const handleVoiceHelp = () => {
    if (isListening) return;
    setIsListening(true);
    const speechLang = getBrowserSpeechLang(language === 'auto' ? 'en' : language);
    startListening(
      speechLang,
      ({ text }) => {
        setIsListening(false);
        const t = text.toLowerCase();
        if (
          t.includes('nahi ho raha') ||
          t.includes('galat') ||
          t.includes('button nahi mil raha') ||
          t.includes('stuck') ||
          t.includes('help') ||
          t.includes('madad')
        ) {
          handleHelpRecovery();
        } else if (t.includes('agla') || t.includes('next') || t.includes('ho gaya') || t.includes('done')) {
          handleNextStep();
        } else if (t.includes('phir se') || t.includes('repeat') || t.includes('dobara')) {
          handleRepeat();
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };

  const progressPercent = Math.round(((completedSteps.size) / flow.steps.length) * 100);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '24px 22px 36px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#1B8A6B', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              📚 TEACH ME ONCE — STEP BY STEP
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginTop: 2 }}>
              {getTitle()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F3F4F6', border: 'none', borderRadius: '50%',
              width: 38, height: 38, cursor: 'pointer', fontSize: 20, color: '#6B7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ background: '#F3F4F6', borderRadius: 8, height: 8, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            background: '#1B8A6B',
            height: '100%',
            borderRadius: 8,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {!finished ? (
          <>
            {/* Step Counter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {flow.steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: completedSteps.has(i) ? '#1B8A6B' : i === currentStep ? '#F59E2B' : '#F3F4F6',
                    color: completedSteps.has(i) || i === currentStep ? '#fff' : '#9CA3AF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    boxShadow: i === currentStep ? '0 0 0 3px rgba(245, 158, 43, 0.25)' : 'none',
                  }}
                >
                  {completedSteps.has(i) ? '✓' : i + 1}
                </div>
              ))}
              <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 'auto', fontWeight: 600 }}>
                Step {currentStep + 1} of {flow.steps.length}
              </span>
            </div>

            {/* Instruction Card */}
            <div style={{
              background: '#F0FDF4',
              border: `2px solid ${showVisualHighlight ? '#1B8A6B' : '#BBF7D0'}`,
              borderRadius: 20,
              padding: '22px',
              marginBottom: 16,
              boxShadow: showVisualHighlight ? '0 0 16px rgba(27,138,107,0.3)' : 'none',
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: 13, color: '#1B8A6B', fontWeight: 700, marginBottom: 6 }}>
                STEP {currentStep + 1}
              </div>
              <div style={{ fontSize: 19, color: '#111827', lineHeight: 1.6, fontWeight: 600 }}>
                {getInstruction(currentStepData)}
              </div>

              {/* Action Hint / Target */}
              {currentStepData.target && (
                <div style={{
                  marginTop: 14,
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 14,
                  padding: '12px 14px',
                  fontSize: 14,
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <span style={{ fontSize: 22 }}>👆</span>
                  <div>
                    <strong>Where to look/tap:</strong> {currentStepData.actionHint || currentStepData.target}
                  </div>
                </div>
              )}

              {/* Navigation Tip */}
              {currentStepData.navigationTip && (
                <div style={{
                  marginTop: 8,
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 14,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#1E40AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span>🧭</span>
                  <span><strong>Tip:</strong> {currentStepData.navigationTip}</span>
                </div>
              )}

              {/* Pacing Prompt */}
              <div style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px dashed #D1FAE5',
                fontSize: 15,
                color: '#15803D',
                fontWeight: 600,
                fontStyle: 'italic',
              }}>
                {language === 'hi'
                  ? '“हो गया? अगला step करें?”'
                  : language === 'hinglish'
                    ? '“Ho gaya? Agla step karein?”'
                    : '“Done? Ready for the next step?”'}
              </div>
            </div>

            {/* Wrong Action Recovery Message Banner */}
            {showHelpMessage && (
              <div style={{
                background: '#FEF3C7',
                border: '1.5px solid #FCD34D',
                borderRadius: 16,
                padding: '14px 18px',
                fontSize: 15,
                color: '#92400E',
                marginBottom: 16,
                lineHeight: 1.5,
              }}>
                ❤️ <strong>Dost:</strong> {showHelpMessage}
              </div>
            )}

            {/* Control Buttons Grid — All 5 Required Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {/* Primary Next Action */}
              <button
                onClick={handleNextStep}
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: 18,
                  fontWeight: 800,
                  background: '#1B8A6B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(27, 138, 107, 0.3)',
                }}
              >
                {currentStep === flow.steps.length - 1
                  ? (language === 'hinglish' ? 'Ho Gaya! ✓ (Done)' : language === 'hi' ? 'हो गया! ✓' : 'Done! ✓')
                  : (language === 'hinglish' ? 'AGLA STEP →' : language === 'hi' ? 'अगला STEP →' : 'NEXT STEP →')}
              </button>

              {/* Secondary Actions: Repeat & Show Again */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={handleRepeat}
                  style={{
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: '#F9FAFB',
                    color: '#374151',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  🔁 {language === 'hinglish' ? 'REPEAT' : language === 'hi' ? 'REPEAT' : 'REPEAT'}
                </button>

                <button
                  onClick={handleShowAgain}
                  style={{
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  👁 {language === 'hinglish' ? 'SHOW AGAIN' : language === 'hi' ? 'SHOW AGAIN' : 'SHOW AGAIN'}
                </button>
              </div>

              {/* Tertiary Actions: Help & Go Back */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => handleHelpRecovery()}
                  style={{
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '1.5px solid #FED7AA',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  ❓ {language === 'hinglish' ? 'HELP' : language === 'hi' ? 'HELP' : 'HELP'}
                </button>

                <button
                  onClick={handleGoBack}
                  disabled={currentStep === 0}
                  style={{
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: '#F3F4F6',
                    color: currentStep === 0 ? '#9CA3AF' : '#4B5563',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: 14,
                    cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ⬅ {language === 'hinglish' ? 'GO BACK' : language === 'hi' ? 'GO BACK' : 'GO BACK'}
                </button>
              </div>

              {/* Voice Help button */}
              <button
                onClick={handleVoiceHelp}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: isListening ? '#EF4444' : '#F0FDF4',
                  color: isListening ? '#fff' : '#1B8A6B',
                  border: '1px solid #BBF7D0',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>{isListening ? 'Listening...' : '🎤 Speak: "Mujhse nahi ho raha" or "Next"'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Completion Screen */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
              {language === 'hinglish' ? 'Shabash! Aapne Seekh Liya!' : language === 'hi' ? 'शाबाश! आपने सीख लिया!' : 'You Did It!'}
            </h3>
            <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.6, margin: '0 0 24px' }}>
              {language === 'hinglish'
                ? `Aapne "${getTitle()}" ke saare steps safaltapoorvak poore kar liye hain. Agli baar aap khud bina dar ke kar sakte hain!`
                : `You successfully completed all steps for "${getTitle()}". Your progress has been saved in your learned tasks!`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setCompletedSteps(new Set());
                  setFinished(false);
                }}
                style={{
                  padding: '16px',
                  fontSize: 16,
                  fontWeight: 700,
                  background: '#F0FDF4',
                  color: '#1B8A6B',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: 14,
                  cursor: 'pointer',
                }}
              >
                🔁 {language === 'hinglish' ? 'Dobara Practice Karein' : 'Practice Again'}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '16px',
                  fontSize: 16,
                  fontWeight: 800,
                  background: '#1B8A6B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                }}
              >
                ✓ {language === 'hinglish' ? 'Done / Wapas Jao' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
