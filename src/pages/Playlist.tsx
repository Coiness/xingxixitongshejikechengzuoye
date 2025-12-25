import React, { useRef, useState, useEffect } from 'react';
import { Plus, Trash2, Music } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicDB, SongData } from '../utils/db';

export default function Playlist() {
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
        artist: '未知艺术家', // Default for now
        file: file,
        duration: duration,
        addedAt: Date.now(),
      };

      try {
        const id = await musicDB.addSong(newSong);
        addSongToPlaylist({ ...newSong, id });
      } catch (error) {
        console.error('Failed to add song:', error);
        alert('添加歌曲失败');
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
      alert('无效的音频文件');
    };
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这首歌曲吗？')) {
      await musicDB.deleteSong(id);
      loadPlaylist(); // Reload to refresh list
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">我的歌单</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            title="添加歌曲"
          >
            <Plus className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {playlist.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>暂无歌曲</p>
            <p className="text-sm mt-2">点击 + 号添加本地音乐</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {playlist.map((song, index) => (
              <li 
                key={song.id}
                onClick={() => playSong(index)}
                className={`p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                  index === currentSongIndex ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === currentSongIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className={`text-sm font-medium truncate ${
                      index === currentSongIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {song.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    onClick={(e) => song.id && handleDelete(e, song.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
  );
}
