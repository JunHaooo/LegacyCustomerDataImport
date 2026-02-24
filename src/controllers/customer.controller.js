//Controllers for handling customer-related API requests, including listing, retrieving, updating, and deleting customers.

const Customer = require('../models/Customer');
const { validateCustomer, validatePartialCustomer } = require('../services/validation.service');

// List customers with pagination
exports.listCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const customers = await Customer.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const count = await Customer.countDocuments();
    res.json({ total: count, page, data: customers });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching customers' });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching customer' });
  }
};

// Update a customer by ID
exports.updateCustomer = async (req, res) => {
  try {
    const { error, value } = validateCustomer(req.body);
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
    
    const customer = await Customer.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Error updating customer' });
  }
};

// Delete a customer by ID
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting customer' });
  }
};

// Patch (partial update) a customer by ID
exports.patchCustomer = async (req, res) => {
  const { error, value } = validatePartialCustomer(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
  
  // { new: true } returns the updated document, { runValidators: true } ensures Mongoose-level checks
  const customer = await Customer.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  
  res.json(customer);
};