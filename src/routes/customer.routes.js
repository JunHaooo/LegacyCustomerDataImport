//Handles API endpoints related to customer data, such as listing imported customers and fetching individual customer details. This router provides CRUD operations for customer records, allowing clients to retrieve, update, and delete customer information as needed. 

const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { validateCustomer } = require('../services/validation.service');

// 1. GET /api/customers - List with pagination 
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const customers = await Customer.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
  const count = await Customer.countDocuments();
  res.json({ total: count, page, data: customers });
});

// 2. GET /api/customers/:id - Retrieve by ID 
router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(customer);
});

// 3. PUT /api/customers/:id - Update with validation 
router.put('/:id', async (req, res) => {
  const { error, value } = validateCustomer(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
  
  const customer = await Customer.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(customer);
});

// 4. DELETE /api/customers/:id - Delete 
router.delete('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Customer deleted successfully' });
});

module.exports = router;