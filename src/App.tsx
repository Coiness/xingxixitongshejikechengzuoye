import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Player from './pages/Player';
import Playlist from './pages/Playlist';
import { connectWebSocket, disconnectWebSocket } from './utils/websocket';
import { usePlayerStore } from './store/usePlayerStore';

function AppContent() {
  const { showPlaylist } = usePlayerStore();

  useEffect(() => {
    // Initialize WebSocket connection
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div 
        className={`transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 overflow-hidden ${
          showPlaylist ? 'w-80 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0'
        }`}
      >
        <div className="w-80 h-full">
          <Playlist />
        </div>
      </div>
      <Player />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
