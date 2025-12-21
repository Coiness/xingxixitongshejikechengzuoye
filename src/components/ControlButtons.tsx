import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ControlButtonsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-8 mt-8">
      <button
        onClick={onPrevious}
        className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous"
      >
        <SkipBack className="w-6 h-6 text-gray-800 dark:text-white" />
      </button>

      <button
        onClick={onPlayPause}
        className="p-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 fill-current" />
        ) : (
          <Play className="w-8 h-8 fill-current ml-1" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        aria-label="Next"
      >
        <SkipForward className="w-6 h-6 text-gray-800 dark:text-white" />
      </button>

      <div className="absolute top-4 right-4">
        <button
          onClick={() => navigate('/playlist')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Playlist"
        >
          <ListMusic className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};
