import { useState, useEffect, useRef, useCallback } from 'react';
import { RecordingState } from '../types';

export const useSpeechRecognition = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    transcript: '',
    interimTranscript: '',
    isSupported: false,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: `Error: ${event.error}. Please try again.`,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isRecording: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition is not available.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isRecording: true,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: 'Failed to start recording. Please try again.',
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState(prev => ({ ...prev, isRecording: false, interimTranscript: '' }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetTranscript,
  };
};
