// Simple socket.io test client
import { io } from 'socket.io-client';

// Connect directly to the backend server with all possible options
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
  // Try all transports
  transports: ['websocket', 'polling'],
  // Automatically reconnect
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  // Increase timeout
  timeout: 20000,
  // Force new connection
  forceNew: true,
  // Don't automatically connect
  autoConnect: false
});

// Debug events
socket.on('connect', () => {
  console.log('[TEST] Socket connected successfully!');
  console.log('[TEST] Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[TEST] Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('[TEST] Connection error:', error.message);
});

socket.on('connect_timeout', () => {
  console.error('[TEST] Connection timeout');
});

socket.on('reconnect', (attemptNumber) => {
  console.log('[TEST] Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('[TEST] Reconnect error:', error.message);
});

// Try to connect
console.log('[TEST] Attempting connection to http://localhost:3001...');
socket.connect();

export default socket;
