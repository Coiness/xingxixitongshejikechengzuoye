import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Player from './pages/Player';
import Playlist from './pages/Playlist';
import { connectWebSocket, disconnectWebSocket } from './utils/websocket';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize WebSocket connection with navigation capability
    connectWebSocket(navigate);

    return () => {
      disconnectWebSocket();
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Player />} />
      <Route path="/playlist" element={<Playlist />} />
    </Routes>
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
