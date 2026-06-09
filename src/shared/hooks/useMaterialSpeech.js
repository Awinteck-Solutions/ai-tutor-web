import { useCallback, useEffect, useRef, useState } from 'react';

export const useMaterialSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback((text, { rate = 1, pitch = 1 } = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return false;
    }
    const content = text?.trim();
    if (!content) return false;

    stop();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = () => {
      utteranceRef.current = null;
      setSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setSpeaking(false);
    };

    utteranceRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
    return true;
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported: typeof window !== 'undefined' && !!window.speechSynthesis };
};

export default useMaterialSpeech;
