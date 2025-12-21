import { usePlayerStore } from '../store/usePlayerStore';

const WS_URL = 'ws://localhost:8080';
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 30000;

interface GestureCommand {
  action: 'play_pause' | 'previous' | 'next' | 'toggle_list';
  timestamp: number;
}

let ws: WebSocket | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export const connectWebSocket = (navigate: (path: string) => void) => {
  if (ws) return;

  console.log('Connecting to WebSocket...', WS_URL);
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
    startHeartbeat();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const command: GestureCommand = JSON.parse(event.data);
      console.log('Received command:', command);
      handleCommand(command, navigate);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    stopHeartbeat();
    ws = null;
    reconnectTimer = setTimeout(() => connectWebSocket(navigate), RECONNECT_INTERVAL);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    ws?.close();
  };
};

const startHeartbeat = () => {
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    }
  }, HEARTBEAT_INTERVAL);
};

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

const handleCommand = (command: GestureCommand, navigate: (path: string) => void) => {
  const store = usePlayerStore.getState();

  switch (command.action) {
    case 'play_pause':
      store.togglePlayPause();
      break;
    case 'previous':
      store.playPrevious();
      break;
    case 'next':
      store.playNext();
      break;
    case 'toggle_list':
      // Basic navigation logic based on current URL would be better, 
      // but here we just toggle. 
      // Since we are outside React component, we need a way to know current location or just force navigate.
      // We passed 'navigate' function.
      if (window.location.pathname === '/') {
        navigate('/playlist');
      } else {
        navigate('/');
      }
      break;
    default:
      console.warn('Unknown command:', command.action);
  }
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  stopHeartbeat();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};
