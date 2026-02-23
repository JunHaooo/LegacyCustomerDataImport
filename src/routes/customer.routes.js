//Handles API endpoints related to customer data, such as listing imported customers and fetching individual customer details.

const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

/**
 * GET /api/customers
 * List all successfully imported customers
 */
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

module.exports = router;