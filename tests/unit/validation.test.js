// Tests for the validation service to ensure that customer data is correctly validated before processing

const { validateCustomer } = require('../../src/services/validation.service');

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

  test('should pass if the timezone is a valid IANA identifier', () => {
    const validData = {
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      date_of_birth: '1985-08-22',
      timezone: 'Europe/London' // Valid
    };
    const { error } = validateCustomer(validData);
    expect(error).toBeUndefined();
  });
});