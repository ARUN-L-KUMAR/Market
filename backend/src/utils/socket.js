const jwt = require('jsonwebtoken');
let io;

function initSocket(server) {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'https://akmarket.vercel.app',
        'https://market-nz1afvikx-arun-kumars-projects-0de1d555.vercel.app',
        'https://market-git-master-arun-kumars-projects-0de1d555.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
      } catch (err) {
        // Token invalid — allow connection but mark as unauthenticated
        socket.userId = null;
        socket.userRole = null;
      }
    }
    next(); // Allow connection (some features like product rooms are public)
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room for targeted updates (requires auth)
    socket.on('joinUserRoom', (userId) => {
      if (socket.userId && socket.userId === userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
      }
    });

    // Join product room for inventory updates (public)
    socket.on('joinProductRoom', (productId) => {
      socket.join(`product_${productId}`);
    });

    // Join admin room — requires verified admin role
    socket.on('joinRoom', ({ room, userId }) => {
      if (room === 'adminRoom') {
        if (socket.userRole === 'admin' && socket.userId) {
          socket.join(room);
          console.log(`Admin ${socket.userId} joined admin room`);
          io.to(room).emit('userActivity', {
            type: 'ADMIN_CONNECTED',
            userId: socket.userId,
            timestamp: new Date()
          });
        } else {
          socket.emit('error', { message: 'Unauthorized: Admin access required' });
        }
      } else if (room.startsWith('product-')) {
        socket.join(room);
      }
    });

    // Leave room
    socket.on('leaveRoom', ({ room, userId }) => {
      socket.leave(room);

      if (room === 'adminRoom' && socket.userRole === 'admin') {
        io.to(room).emit('userActivity', {
          type: 'ADMIN_DISCONNECTED',
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Handle cart updates (requires auth)
    socket.on('updateCart', (data) => {
      if (socket.userId) {
        io.to('adminRoom').emit('cartActivity', data);
      }
    });

    // Handle wishlist updates (requires auth)
    socket.on('updateWishlist', (data) => {
      if (socket.userId) {
        io.to('adminRoom').emit('wishlistActivity', data);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = {
  initSocket,
  get io() {
    return io;
  }
};