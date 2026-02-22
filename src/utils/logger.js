// Use winston for logging

const winston = require('winston');
const path = require('path');

// Define custom log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

// Choose log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development'; // Default to 'development' if NODE_ENV is not set
  const isDevelopment = env === 'development'; // Check if the environment is development
  return isDevelopment ? 'debug' : 'warn'; // True --> debug, False --> warn
};

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

// Define where to store/output logs
const transports = [
    // Log to the console
    new winston.transports.Console({
        // Override the default format for console logs
        format: winston.format.combine(
            winston.format.colorize({ all: true }), // Add colors to the log levels
            winston.format.printf(
                (info) => `${info.timestamp} [${info.level}]: ${info.message}`
            ) // Format the log message for console output
        )
    }),
    // Save errors to a file
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),

    //Save all logs to a file
    new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

module.exports = logger;