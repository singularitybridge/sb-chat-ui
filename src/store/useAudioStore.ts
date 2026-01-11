import { create } from 'zustand';
import { AudioState } from '../types/chat';
import { textToSpeech, TTSVoice } from '../services/api/voiceService';
import { logger } from '../services/LoggingService';

interface AudioStoreState {
  audioState: AudioState;
  audioRef: React.RefObject<HTMLAudioElement | null> | null;

  setAudioRef: (ref: React.RefObject<HTMLAudioElement | null>) => void;
  toggleAudio: () => void;
  playText: (text: string, voice: TTSVoice) => Promise<void>;
  stopAudio: () => void;
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  audioState: 'disabled',
  audioRef: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  toggleAudio: () => {
    const { audioState, audioRef } = get();
    if (audioState === 'disabled') {
      set({ audioState: 'enabled' });
    } else if (audioState === 'enabled') {
      set({ audioState: 'disabled' });
    } else if (audioState === 'playing') {
      if (audioRef?.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      set({ audioState: 'enabled' });
    }
  },

  playText: async (text: string, voice: TTSVoice) => {
    const { audioState, audioRef } = get();
    
    if (audioState !== 'enabled' || !text.trim() || !audioRef?.current) {
      return;
    }

    try {
      const audioUrl = await textToSpeech(text, voice);
      const audioElement = audioRef.current;
      
      audioElement.src = audioUrl;
      await audioElement.play();
      set({ audioState: 'playing' });
      
      // Set up event listener for when audio ends
      const handleEnded = () => {
        set({ audioState: 'enabled' });
        audioElement.removeEventListener('ended', handleEnded);
      };
      
      audioElement.addEventListener('ended', handleEnded);
    } catch (error: any) {
      logger.error('Failed to play audio', error);
    }
  },

  stopAudio: () => {
    const { audioRef } = get();
    if (audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    set({ audioState: 'enabled' });
  },
}));