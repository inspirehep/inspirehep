import { journalSchema } from '../journal';

const dataWithRequiredFields = {
  short_title: 'test_journal',
  journal_title: 'test_journal',
};

describe('journalSchema', () => {
  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await journalSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await journalSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when values are strings', async () => {
    const data = dataWithRequiredFields;
    const isValid = await journalSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when value is an empty string', async () => {
    const data = {
      ...dataWithRequiredFields,
      short_title: '',
    };
    const isValid = await journalSchema.isValid(data);
    expect(isValid).toBe(false);
  });
});
