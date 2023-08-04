import initializeSocketIO from "./socketio";

require('dotenv').config();

const cors = require('cors');
const express = require('express');
const http = require('http');
const { connectToDatabase } = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const { route } = require('./routes/router');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(route);

app.use(errorHandler);

// Create an HTTP server instance
const server = http.createServer(app);

// Create a Socket.IO instance and attach it to the server
initializeSocketIO(server);

// Establish the database connection only once when the application starts
connectToDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });