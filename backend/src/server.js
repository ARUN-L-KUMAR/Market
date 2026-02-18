require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socket');
const mongoose = require('mongoose');

// Print diagnostic info (masking secrets)
console.log('\n--- Environment Diagnostics ---');
console.log(`Port: ${process.env.PORT}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
console.log(`SMTP User: ${process.env.SMTP_USER}`);
console.log(`SMTP Pass: ${process.env.SMTP_PASS ? '********' : 'NOT SET'}`);
console.log(`SMTP From: ${process.env.SMTP_FROM}`);
console.log('------------------------------\n');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);
