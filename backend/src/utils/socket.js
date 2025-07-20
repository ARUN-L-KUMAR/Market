let io;

function initSocket(server) {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: { 
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user-specific room for targeted updates
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });
    
    // Join product room for inventory updates
    socket.on('joinProductRoom', (productId) => {
      socket.join(`product_${productId}`);
      console.log(`Joined product room: ${productId}`);
    });
    
    // Join admin room for dashboard updates
    socket.on('joinRoom', ({ room, userId }) => {
      if (room === 'adminRoom' && userId) {
        socket.join(room);
        console.log(`Admin ${userId} joined admin room`);
        
        // Emit initial connection event
        io.to(room).emit('userActivity', {
          type: 'ADMIN_CONNECTED',
          userId,
          timestamp: new Date()
        });
      } else if (room.startsWith('product-')) {
        socket.join(room);
        console.log(`Joined product room: ${room}`);
      }
    });
    
    // Leave room
    socket.on('leaveRoom', ({ room, userId }) => {
      socket.leave(room);
      console.log(`Left room: ${room}`);
      
      if (room === 'adminRoom' && userId) {
        io.to(room).emit('userActivity', {
          type: 'ADMIN_DISCONNECTED',
          userId,
          timestamp: new Date()
        });
      }
    });
    
    // Handle cart updates
    socket.on('updateCart', (data) => {
      // Broadcast to admin dashboard
      io.to('adminRoom').emit('cartActivity', data);
    });
    
    // Handle wishlist updates
    socket.on('updateWishlist', (data) => {
      // Broadcast to admin dashboard
      io.to('adminRoom').emit('wishlistActivity', data);
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