//Defines routes for customer-related operations (CRUD).

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

router.get('/', customerController.listCustomers); // List all customers
router.get('/:id', customerController.getCustomerById); // Get a specific customer by ID
router.put('/:id', customerController.updateCustomer); // Update a specific customer by ID
router.delete('/:id', customerController.deleteCustomer); // Delete a specific customer by ID
router.patch('/:id', customerController.patchCustomer); // Patch (partial update) a specific customer by ID

module.exports = router;