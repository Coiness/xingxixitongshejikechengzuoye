import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { ControlButtons } from '../components/ControlButtons';
import { Music, Disc, Camera, CameraOff } from 'lucide-react';
import { sendCameraFrame } from '../utils/websocket';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playlist, currentSongIndex, isPlaying, playNext, playPrevious, togglePlayPause, togglePlaylist } = usePlayerStore();
  const isPlayingRef = useRef(isPlaying);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const currentSong = playlist[currentSongIndex];

  // Camera handling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const videoElement = videoRef.current;

    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }

          // Capture frames every 1000ms (1fps)
          intervalId = setInterval(() => {
            if (videoRef.current && canvasRef.current) {
              const context = canvasRef.current.getContext('2d');
              if (context) {
                context.drawImage(videoRef.current, 0, 0, 320, 240);
                const frameData = canvasRef.current.toDataURL('image/jpeg', 0.5);
                sendCameraFrame(frameData);
              }
            }
          }, 1000);
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          setIsCameraOn(false);
          alert("无法访问摄像头，请检查权限");
        });
    } else {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
      const url = URL.createObjectURL(currentSong.file);
      audio.src = url;
      // When song changes, if it was playing or should play, play it
      if (isPlayingRef.current) {
        audio.play().catch(e => console.error("Play failed", e));
      }
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      audio.src = '';
    }
  }, [currentSong]); // Re-run when song changes

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
    <div className="flex-1 h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      {/* Camera Toggle Button */}
      <button
        onClick={toggleCamera}
        className={`absolute top-4 right-4 p-3 rounded-full transition-colors z-20 ${
          isCameraOn 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
        }`}
        title={isCameraOn ? "关闭摄像头" : "开启手势识别摄像头"}
      >
        {isCameraOn ? <CameraOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
      </button>

      {/* Camera Preview Board */}
      {isCameraOn && (
        <div className="absolute top-20 right-4 w-40 h-32 bg-black rounded-lg shadow-lg overflow-hidden border-2 border-white/20 z-10 transition-all duration-300 ease-in-out">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform -scale-x-100" 
            autoPlay 
            muted 
            playsInline 
          />
          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" width="320" height="240" />
          <div className="absolute bottom-1 right-1">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Hidden container if camera is off, just to keep refs valid if needed, though we conditionally render above now. 
          Actually, the effect depends on isCameraOn. 
          If isCameraOn is false, we don't need the video element in DOM if we handle cleanup correctly.
          However, the current effect logic relies on videoRef.current.
          Let's clean up the previous hidden block.
      */}
      
      {/* If camera is OFF, we don't render video/canvas to save resources, 
          BUT the effect expects refs to be stable-ish or handled.
          The effect handles cleanup when isCameraOn changes.
          Let's keep it simple: Only render when on. 
      */}


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
