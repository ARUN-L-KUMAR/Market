const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socket');
const mongoose = require('mongoose');
require('dotenv').config();

const server = http.createServer(app);
initSocket(server);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(console.error);
