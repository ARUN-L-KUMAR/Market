const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socket');
const mongoose = require('mongoose');
require('dotenv').config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

const connectWithFallback = () => {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      const isDnsError = err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || (err.message && err.message.includes('querySrv'));
      if (isDnsError) {
        console.warn('Database connection failed due to DNS resolution error. Attempting fallback to public DNS (8.8.8.8, 1.1.1.1)...');
        try {
          const dns = require('dns');
          dns.setServers(['8.8.8.8', '1.1.1.1']);
          
          mongoose.connect(process.env.MONGO_URI)
            .then(() => {
              console.log('Database connected successfully using fallback public DNS.');
              server.listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on port ${PORT}`);
              });
            })
            .catch((retryErr) => {
              console.error('Database connection failed even with public DNS fallback:', retryErr);
              process.exit(1);
            });
        } catch (dnsErr) {
          console.error('Failed to set public DNS servers:', dnsErr);
          process.exit(1);
        }
      } else {
        console.error('Database connection failed:', err);
        process.exit(1);
      }
    });
};

connectWithFallback();

