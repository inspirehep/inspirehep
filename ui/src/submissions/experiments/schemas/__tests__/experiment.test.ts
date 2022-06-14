import experimentSchema from '../experiment';
import { experimentValues } from '../constants';

const dataWithRequiredFields = {
  project_type: [experimentValues[0]],
  legacy_name: "LATTICE-ETM",
};

describe('experimentSchema', () => {
  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await experimentSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await experimentSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when project_type is one of enum values', async () => {
    const data = {
      ...dataWithRequiredFields,
      project_type: [experimentValues[1]],
    };
    const isValid = await experimentSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when project_type is not one of enum values', async () => {
    const data = {
      ...dataWithRequiredFields,
      project_type: [experimentValues[0], 'test_type'],
    };
    const isValid = await experimentSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when legacy_name is a string', async () => {
    const data = {
      ...dataWithRequiredFields,
      legacy_name: 'test_name',
    };
    const isValid = await experimentSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when when legacy_name is an empty string', async () => {
    const data = {
      ...dataWithRequiredFields,
      legacy_name: '',
    };
    const isValid = await experimentSchema.isValid(data);
    expect(isValid).toBe(false);
  });
});
