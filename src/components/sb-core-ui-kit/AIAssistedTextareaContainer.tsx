import React, { useState, useRef, useCallback } from 'react';
import { AIAssistedTextarea } from './AIAssistedTextarea';
import { getCompletion } from '../../services/api/assistantService';
import { transcribeAudio } from '../../services/api/voiceService';

interface AIAssistedTextareaContainerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  label: string;
  systemPrompt: string;
  language?: string;
}

const AIAssistedTextareaContainer: React.FC<AIAssistedTextareaContainerProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  error,
  label,
  systemPrompt,
  language = 'en',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleAIAssist = async (aiPrompt: string) => {
    setIsLoading(true);
    try {
      const completionRequest = {
        systemPrompt,
        userInput: aiPrompt,
      };
      const completionContent = await getCompletion(completionRequest);
      onChange(value + ' ' + completionContent); // Append completion to existing text
      setAiPrompt(''); // Clear the AI prompt after processing
    } catch (error) {
      console.error('Error getting completion:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);

    // Wait for the mediaRecorder to finish processing the audio
    await new Promise(resolve => setTimeout(resolve, 100));

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    try {
      setIsLoading(true);      
      const transcription = await transcribeAudio(audioBlob, language);
      setAiPrompt(transcription); // Set the transcribed text as the AI prompt
    } catch (error) {
      console.error('Error processing audio:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <AIAssistedTextarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      error={error}
      label={label}
      onAIAssist={handleAIAssist}
      onRecording={handleRecording}
      isLoading={isLoading}
      isRecording={isRecording}
      aiPrompt={aiPrompt}
      onAIPromptChange={setAiPrompt}
    />
  );
};

export { AIAssistedTextareaContainer };