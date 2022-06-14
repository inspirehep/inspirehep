import institutionSchema from '../institution';

const dataWithRequiredFields = {
  identifier: 'test_institution',
};

describe('identifierSchema', () => {
  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await institutionSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await institutionSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when identifier identifier is a string', async () => {
    const data = {
      ...dataWithRequiredFields,
      identifier: 'test_name',
    };
    const isValid = await institutionSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when when identifier identifier is an empty string', async () => {
    const data = {
      ...dataWithRequiredFields,
      identifier: '',
    };
    const isValid = await institutionSchema.isValid(data);
    expect(isValid).toBe(false);
  });
});
