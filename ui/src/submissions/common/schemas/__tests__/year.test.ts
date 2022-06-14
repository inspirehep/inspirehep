import year from '../year';

describe('year', () => {
  const yearSchema = year();

  it('validates if it is empty string', async done => {
    const isValid = await yearSchema.isValid('');
    expect(isValid).toBe(true);
    done();
  });

  it('validates if it is a year string (min)', async done => {
    const isValid = await yearSchema.isValid('1000');
    expect(isValid).toBe(true);
    done();
  });

  it('validates if it is a year string (max)', async done => {
    const isValid = await yearSchema.isValid('2050');
    expect(isValid).toBe(true);
    done();
  });

  it('validates if it is a year string', async done => {
    const isValid = await yearSchema.isValid('2018');
    expect(isValid).toBe(true);
    done();
  });

  it('validates if it is a year number', async done => {
    const isValid = await yearSchema.isValid(1234);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates if it is not a number string', async done => {
    const isValid = await yearSchema.isValid('foo');
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates if it is not a year string', async done => {
    const isValid = await yearSchema.isValid('12');
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates if it is a year string but less than min', async done => {
    const isValid = await yearSchema.isValid('999');
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates if it is a year string but more than max', async done => {
    const isValid = await yearSchema.isValid('2051');
    expect(isValid).toBe(false);
    done();
  });
});
