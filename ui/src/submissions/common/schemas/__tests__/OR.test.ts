import { mixed } from 'yup';

import OR from '../OR';

describe('OR', () => {
  const divisibleByThreeSchema = mixed().test({
    test: value => value % 3 === 0,
  });
  const divisibleByTwoSchema = mixed().test({
    test: value => value % 2 === 0,
  });
  const divisibleByThreeOrTwoSchema = OR([
    divisibleByThreeSchema,
    divisibleByTwoSchema,
  ]);

  it('validates if one of the schemas are valid', async done => {
    expect(await divisibleByThreeOrTwoSchema.isValid(3)).toBe(true);
    expect(await divisibleByThreeOrTwoSchema.isValid(2)).toBe(true);
    expect(await divisibleByThreeOrTwoSchema.isValid(6)).toBe(true);
    done();
  });

  it('invalidates if none of the schemas is valid', async done => {
    const isValid = await divisibleByThreeOrTwoSchema.isValid(5);
    expect(isValid).toBe(false);
    done();
  });
});
