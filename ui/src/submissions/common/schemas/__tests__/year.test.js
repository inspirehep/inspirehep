import year from '../year';

describe('year', () => {
  const yearSchema = year();

  it('validates if it is empty string', async () => {
    const isValid = await yearSchema.isValid('');
    expect(isValid).toBe(true);
  });

  it('validates if it is a year string (min)', async () => {
    const isValid = await yearSchema.isValid('1000');
    expect(isValid).toBe(true);
  });

  it('validates if it is a year string (max)', async () => {
    const isValid = await yearSchema.isValid('2050');
    expect(isValid).toBe(true);
  });

  it('validates if it is a year string', async () => {
    const isValid = await yearSchema.isValid('2018');
    expect(isValid).toBe(true);
  });

  it('validates if it is a year number', async () => {
    const isValid = await yearSchema.isValid(1234);
    expect(isValid).toBe(true);
  });

  it('invalidates if it is not a number string', async () => {
    const isValid = await yearSchema.isValid('foo');
    expect(isValid).toBe(false);
  });

  it('invalidates if it is not a year string', async () => {
    const isValid = await yearSchema.isValid('12');
    expect(isValid).toBe(false);
  });

  it('invalidates if it is a year string but less than min', async () => {
    const isValid = await yearSchema.isValid('999');
    expect(isValid).toBe(false);
  });

  it('invalidates if it is a year string but more than max', async () => {
    const isValid = await yearSchema.isValid('2051');
    expect(isValid).toBe(false);
  });
});
