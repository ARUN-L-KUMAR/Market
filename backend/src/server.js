const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socket');
const mongoose = require('mongoose');
require('dotenv').config();

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
