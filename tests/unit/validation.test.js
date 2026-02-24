// Tests for the validation service to ensure that customer data is correctly validated before processing

const { validateCustomer, validatePartialCustomer } = require('../../src/services/validation.service');

describe('Customer Validation Service', () => {
  
  // Test case for validating a correct customer record
  test('should validate a correct customer record', () => {
    const validData = {
      full_name: 'John Doe',
      email: 'john@example.com',
      date_of_birth: '1990-05-15',
      timezone: 'America/New_York'
    };
    
    const { error } = validateCustomer(validData);
    expect(error).toBeUndefined();
  });

  // Test case for validating a record with email is invalid
  test('should fail if email is malformed', () => {
    const invalidData = {
      full_name: 'Jane Smith',
      email: 'not-an-email',
      date_of_birth: '1985-08-22',
      timezone: 'Europe/London'
    };

    const { error } = validateCustomer(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Valid email format is required'); // Isolate one failure at a time by calling index 0
  });

  // Test case for validating a record with date of birth in the future
  test('should fail if date_of_birth is in the future', () => {
    const futureDate = {
      full_name: 'Baby Future',
      email: 'future@example.com',
      date_of_birth: '2099-01-01',
      timezone: 'UTC'
    };

    const { error } = validateCustomer(futureDate);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Date of birth must be in the past');
  });

  // Test case for validating a record with an invalid timezone
  test('should fail if the timezone is not a valid IANA identifier', () => {
    const invalidData = {
      full_name: 'John Doe',
      email: 'john@example.com',
      date_of_birth: '1990-01-01',
      timezone: 'Not/A_Real_Place' // Invalid
    };
    const { error } = validateCustomer(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Invalid IANA timezone identifier');
  });

  // Test case for partial update validation
  test('should validate a partial update with only one field', () => {
    const partialData = { full_name: 'Jun Hao Updated' };
    
    // Using your partial validation function
    const { error } = validatePartialCustomer(partialData);
    expect(error).toBeUndefined();
  });

  // Test case for validating that email is still validated in a PATCH request
  test('should fail partial update if email is malformed', () => {
    const invalidPartial = { email: 'wrong-email-format' };

    const { error } = validatePartialCustomer(invalidPartial);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Valid email format is required');
  });

  // Test case for validating that at least one field is required in a PATCH request
  test('should fail partial update if timezone is invalid', () => {
    const invalidTimezone = { timezone: 'Fake/City' };

    const { error } = validatePartialCustomer(invalidTimezone);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Invalid IANA timezone identifier');
  });
  
  // Test case for validating that unknown fields are not allowed
  test('should fail if an unknown field is provided', () => {
    const unknownField = { hacker_score: 9001 };

    const { error } = validatePartialCustomer(unknownField);
    expect(error).toBeDefined();
    // Joi by default doesn't allow unknown keys unless .unknown() is set
  });
});