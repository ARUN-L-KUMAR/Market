import { io } from 'socket.io-client';
import { SOCKET_CONFIG } from '../config/appConfig';

// Connect directly to the backend server
const SOCKET_URL = SOCKET_CONFIG.url;

// Track connected handlers to avoid memory leaks and duplicate handlers
const trackHandlers = () => {
  const handlers = new Map();
  
  return {
    add: (event, handler) => {
      if (!handlers.has(event)) {
        handlers.set(event, new Set());
      }
      handlers.get(event).add(handler);
    },
    remove: (event, handler) => {
      if (handlers.has(event)) {
        handlers.get(event).delete(handler);
      }
    },
    has: (event, handler) => {
      return handlers.has(event) && handlers.get(event).has(handler);
    },
    count: (event) => {
      return handlers.has(event) ? handlers.get(event).size : 0;
    }
  };
};

// Create a dummy socket implementation in case real socket fails
const createDummySocket = () => {
  const handlerTracker = trackHandlers();
  
  return {
    on: (event, handler) => {
      handlerTracker.add(event, handler);
      return this;
    },
    off: (event, handler) => {
      handlerTracker.remove(event, handler);
      return this;
    },
    emit: () => {},
    connected: false,
    disconnected: true,
    id: 'dummy-socket',
    handlerCount: (event) => handlerTracker.count(event)
  };
};

// Create a wrapper around socket.io to prevent duplicate event handlers
const createSocketWrapper = (socketIo) => {
  const handlerTracker = trackHandlers();
  
  return {
    on: (event, handler) => {
      // Only add the handler if it hasn't been added before
      if (!handlerTracker.has(event, handler)) {
        socketIo.on(event, handler);
        handlerTracker.add(event, handler);
      }
      return this;
    },
    off: (event, handler) => {
      socketIo.off(event, handler);
      handlerTracker.remove(event, handler);
      return this;
    },
    emit: (...args) => socketIo.emit(...args),
    connect: () => socketIo.connect(),
    disconnect: () => socketIo.disconnect(),
    connected: socketIo.connected,
    disconnected: socketIo.disconnected,
    id: socketIo.id,
    handlerCount: (event) => handlerTracker.count(event)
  };
};

// Try to create the real socket instance, fall back to dummy if it fails
let socket;
try {
  console.log('Attempting to connect to socket at:', SOCKET_URL);
  const socketIo = io(SOCKET_URL, SOCKET_CONFIG.options);
  socket = createSocketWrapper(socketIo);
} catch (error) {
  console.warn('Failed to initialize socket.io, using dummy implementation:', error);
  socket = createDummySocket();
}

// Event handlers for debugging in development
if (import.meta.env.DEV) {
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.warn('Socket connection error:', error);
    console.info('Real-time updates will not be available. The app will still function but you won\'t get live updates.');
  });
}

// Add timeout to detect if socket connection fails
let connectionSuccessful = false;
socket.on('connect', () => {
  connectionSuccessful = true;
});

// If socket.io fails to connect within 5 seconds in development, warn the user
if (import.meta.env.DEV) {
  setTimeout(() => {
    if (!connectionSuccessful && socket.connected === false) {
      console.warn(
        'Socket connection timeout. The backend server might not be running. ' +
        'The application will continue to work without real-time updates.'
      );
    }
  }, 5000);
}

export default socket;
