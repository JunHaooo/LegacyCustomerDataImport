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

// Define the BASE Joi schema for validating customer data (source of truth)
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

// reate the PATCH schema (Derived from base, all fields optional)
// .fork takes an array of fields and changes their rules
const patchSchema = customerSchema.fork(
  ['full_name', 'email', 'date_of_birth', 'timezone'], // List all fields that can be updated
  (field) => field.optional() 
).min(1); // .min(1) ensures the user sends at least ONE field to update

/**
 * Validates a full customer record (Import & PUT)
 */
const validateCustomer = (data) => {
  return customerSchema.validate(data, { abortEarly: false });
};

/**
 * Validates partial customer data (PATCH)
 */
const validatePartialCustomer = (data) => {
  return patchSchema.validate(data, { abortEarly: false });
};

module.exports = { 
  validateCustomer, // For validating full records (Import & PUT)
  validatePartialCustomer // For validating partial updates (PATCH)
};