//Main application file for the Express server
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const importRoutes = require('./routes/import.routes');
const customerRoutes = require('./routes/customer.routes');

// Start the import worker to process CSV files in the background
require('./workers/import.worker'); 

const app = express();

// 1. Connect to the database
connectDB();

// 2. Middleware setup
app.use(helmet()); // Middleware to set security-related HTTP headers
app.use(express.json()); // Middleware to parse JSON bodies

//Rate Limiting: Prevents abuse/DoS attacks by limiting requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);


//3. Routes setup
// Health check endpoint
app.get('/', (_, res) => {
    res.status(200).json({ status: 'UP' });
});

// Route for handling CSV imports
app.use('/api/imports', importRoutes);

// Route for handling customer data
app.use('/api/customers', customerRoutes);



// 4. Global Error Handler 
app.use((err, req, res, _) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

//5. Server initialization
const PORT = process.env.PORT || 3000;

// Start the serverg at the end of the file to ensure all routes and middleware are set up before accepting requests
app.listen(PORT, () => {
    logger.info(`Server in ${process.env.NODE_ENV || 'development'} mode running on port ${PORT}`);
});


module.exports = app; 