//Main application file for the Express server

require('dotenv').config();
require('./workers/import.worker'); // Start the import worker
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const importRoutes = require('./routes/import.routes');
const customerRoutes = require('./routes/customer.routes');

const app = express();

// Connect to the database
connectDB();

// Middleware to parse JSON bodies
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (_, res) => {
    res.status(200).json({ status: 'UP' });
});

// Route for handling CSV imports
app.use('/api/imports', importRoutes);

// Route for handling customer data
app.use('/api/customers', customerRoutes);

// Start the serverg at the end of the file to ensure all routes and middleware are set up before accepting requests
app.listen(PORT, () => {
    logger.info(`Server in ${process.env.NODE_ENV || 'development'} mode running on port ${PORT}`);
});

module.exports = app; 