const { validateCustomer } = require('../../src/services/validation.service');

describe('Customer Validation Service', () => {
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
});