const request = require('supertest');
const mongoose = require('mongoose');

// Mock the BullMQ Worker and Queue to prevent actual background processing during tests
jest.mock('bullmq', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(true)
  })),
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    close: jest.fn().mockResolvedValue(true)
  }))
}));

// Import the Express app and the Worker to ensure they are initialized for testing
const app = require('../../src/app'); 
const worker = require('../../src/workers/import.worker');

describe('Customer API Endpoints', () => {
  // Disconnect from DB after tests so Jest can exit
  afterAll(async () => {
    await mongoose.connection.close();

    await worker.close(); // Ensure the worker is properly closed after tests to prevent hanging processes

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait briefly to ensure all async operations are completed
  });

  it('should return 200 for health check', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('UP');
  });

  it('should return 200 for listing customers', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
  });
});