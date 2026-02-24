// Set up MongoDB connection using Mongoose with structured logging

const mongoose = require('mongoose'); 
const logger = require('../utils/logger'); // Import the logger utility for structured logging

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); 

        // Structured logging for successful connection
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Structured logging for connection errors
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;