// Integration tests for the Customer API endpoints using Supertest and Jest

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

  // Test GET for health check
  test('should return 200 for health check', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('UP');
  });

  // Test GET for listing customers
  test('should return 200 for listing customers', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
  });

  //Test GET for non-existent customer
  test('should return 404 for a non-existent customer ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/customers/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });

  //Test DELETE for non-existent customer
  test('should return 404 when trying to delete a non-existent customer', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/customers/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });

  //Test UPDATE (PUT) for non-existent customer
  test('should return 400 when updating with invalid data', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/customers/${fakeId}`)
      .send({ email: 'not-an-email' }); // Invalid data
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  //Test POST for creating import without file
  test('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/api/imports');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});