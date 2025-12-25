import { create } from 'zustand';
import { SongData, musicDB } from '../utils/db';

interface PlayerState {
  playlist: SongData[];
  currentSongIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  showPlaylist: boolean;
  
  // Actions
  loadPlaylist: () => Promise<void>;
  playSong: (index: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlaylist: () => void;
  addSongToPlaylist: (song: SongData) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playlist: [],
  currentSongIndex: -1,
  isPlaying: false,
  isLoading: false,
  showPlaylist: false,

  loadPlaylist: async () => {
    set({ isLoading: true });
    try {
      const songs = await musicDB.getAllSongs();
      set({ playlist: songs, isLoading: false });
    } catch (error) {
      console.error('Failed to load playlist:', error);
      set({ isLoading: false });
    }
  },

  playSong: (index) => {
    const { playlist } = get();
    if (index >= 0 && index < playlist.length) {
      set({ currentSongIndex: index, isPlaying: true });
    }
  },

  togglePlayPause: () => {
    const { isPlaying, currentSongIndex, playlist } = get();
    if (currentSongIndex === -1 && playlist.length > 0) {
      // If no song is playing but playlist has songs, start the first one
      set({ currentSongIndex: 0, isPlaying: true });
    } else if (currentSongIndex !== -1) {
      set({ isPlaying: !isPlaying });
    }
  },

  playNext: () => {
    const { currentSongIndex, playlist } = get();
    if (playlist.length === 0) return;
    
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    set({ currentSongIndex: nextIndex, isPlaying: true });
  },

  playPrevious: () => {
    const { currentSongIndex, playlist } = get();
    if (playlist.length === 0) return;

    const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    set({ currentSongIndex: prevIndex, isPlaying: true });
  },

  addSongToPlaylist: (song) => {
    set((state) => ({ playlist: [...state.playlist, song] }));
  },

  togglePlaylist: () => {
    set((state) => ({ showPlaylist: !state.showPlaylist }));
  },
}));
