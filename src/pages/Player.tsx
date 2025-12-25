import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { ControlButtons } from '../components/ControlButtons';
import { Music, Disc } from 'lucide-react';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { playlist, currentSongIndex, isPlaying, playNext, playPrevious, togglePlayPause, togglePlaylist } = usePlayerStore();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
      const url = URL.createObjectURL(currentSong.file);
      audio.src = url;
      // When song changes, if it was playing or should play, play it
      if (isPlaying) {
        audio.play().catch(e => console.error("Play failed", e));
      }
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      audio.src = '';
    }
  }, [currentSongIndex, playlist]); // Re-run when song changes

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => console.error("Play failed", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-visible p-8">
        {/* Cover Art Placeholder */}
        <div className="aspect-square rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group">
          <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 ${isPlaying ? 'animate-pulse' : ''}`} />
          {currentSong ? (
             <div className={`transition-transform duration-[3s] ease-linear ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
               <Disc className="w-32 h-32 text-indigo-500 opacity-80" />
             </div>
          ) : (
            <Music className="w-24 h-24 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        {/* Song Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 truncate px-4">
            {currentSong ? currentSong.name : '暂无播放'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {currentSong ? currentSong.artist : '请在歌单中选择一首歌曲'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <ControlButtons 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onPrevious={playPrevious}
          onNext={playNext}
          onTogglePlaylist={togglePlaylist}
        />

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>
    </div>
  );
}
