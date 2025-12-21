import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Music } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicDB, SongData } from '../utils/db';

export default function Playlist() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playlist, currentSongIndex, playSong, addSongToPlaylist, loadPlaylist } = usePlayerStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    
    // Basic metadata extraction (could be improved with libraries)
    const name = file.name.replace(/\.[^/.]+$/, ""); // remove extension
    
    // Get duration
    const audio = new Audio(URL.createObjectURL(file));
    
    audio.onloadedmetadata = async () => {
      const duration = audio.duration;
      
      const newSong: Omit<SongData, 'id'> = {
        name: name,
        artist: 'Unknown Artist', // Default for now
        file: file,
        duration: duration,
        addedAt: Date.now(),
      };

      try {
        const id = await musicDB.addSong(newSong);
        addSongToPlaylist({ ...newSong, id });
      } catch (error) {
        console.error('Failed to add song:', error);
        alert('Failed to add song to library');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    audio.onerror = () => {
      console.error('Error loading audio file');
      setIsUploading(false);
      alert('Invalid audio file');
    };
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this song?')) {
      await musicDB.deleteSong(id);
      loadPlaylist(); // Reload to refresh list
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Playlist</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {playlist.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No songs yet. Tap + to add music.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {playlist.map((song, index) => (
                <li 
                  key={song.id}
                  onClick={() => {
                    playSong(index);
                    navigate('/');
                  }}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    index === currentSongIndex ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === currentSongIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h3 className={`font-medium truncate ${
                        index === currentSongIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {song.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm text-gray-400">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={(e) => song.id && handleDelete(e, song.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
