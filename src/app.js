//Main application file for the Express server

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const app = express();

// Connect to the database
connectDB();

// Middleware to parse JSON bodies
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    logger.info(`Server in ${process.env.NODE_ENV || 'development'} mode running on port ${PORT}`);
});

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

module.exports = app; 