// Initializes BullMQ Queue with Redis connection settings from environment variables

const { Queue } = require('bullmq');
const logger = require('../utils/logger');

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1', // Default to localhost if REDIS_HOST is not set
    port: process.env.REDIS_PORT || 6379, // Default to 6379 if REDIS_PORT is not set
};

const importQueue = new Queue('importQueue', { connection });

logger.info('BullMQ Queue initialized with connection');

module.exports = {
    importQueue,
    connection,
};