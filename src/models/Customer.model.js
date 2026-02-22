// Ensures that the Customer model is defined with proper validation and indexing for efficient querying. The email field is indexed to allow for fast lookups, and the schema includes timestamps to track when each customer record was created and last updated.

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensure email uniqueness and speedy lookups
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'], // Simple email regex for validation
    },
    date_of_birth: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    timezone: {
        type: String,
        required: [true, 'Timezone is required'],
    }
 }, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Customer', customerSchema);