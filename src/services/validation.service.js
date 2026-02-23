//Validates customer data using Joi schema before processing it for import. This ensures that all required fields are present and correctly formatted, such as validating that the email is in a proper format and the date of birth is a valid date in the past. The validation results include detailed error messages for any issues found, which can be used to provide feedback on rejected records.

const Joi = require('joi');

// Helper to check for valid IANA timezone
const isValidTimeZone = (value, helpers) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch (err) {
    return helpers.error('any.invalid');
  }
};

// Define the Joi schema for validating customer data
const customerSchema = Joi.object({
    full_name: Joi.string().trim().required().messages({
        'string.empty': 'Full name is required',
    }),
    email: Joi.string().email().lowercase().required().messages({
        'string.email': 'Valid email format is required',
    }),
    date_of_birth: Joi.date().iso().max('now').required().messages({
        'date.max': 'Date of birth must be in the past',
        'date.base': 'Date of birth must be a valid date',
    }),
    timezone: Joi.string().custom(isValidTimeZone).required().messages({
        'any.invalid': 'Invalid IANA timezone identifier',
        'string.empty': 'Timezone is required',
    }),
});

/**
 * Validates a single customer record
 * @param {Object} data - The row from the CSV
 * @returns {Object} { error, value }
 */

// The validateCustomer function takes a data object (representing a customer record) and validates it against the defined Joi schema. It returns an object containing any validation errors and the validated value, which can be used to determine if the record is valid or if it should be rejected with specific error messages.
const validateCustomer = (data) => {
  return customerSchema.validate(data, { abortEarly: false });
};

module.exports = { validateCustomer }; // Export the validation function for use in the customer controller