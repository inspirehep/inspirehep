// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { mixed } from 'yup';

import OR from '../OR';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('OR', () => {
  const divisibleByThreeSchema = mixed().test({
    test: (value: any) => value % 3 === 0,
  });
  const divisibleByTwoSchema = mixed().test({
    test: (value: any) => value % 2 === 0,
  });
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
  const divisibleByThreeOrTwoSchema = OR([
    divisibleByThreeSchema,
    divisibleByTwoSchema,
  ]);

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates if one of the schemas are valid', async (done: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(await divisibleByThreeOrTwoSchema.isValid(3)).toBe(true);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(await divisibleByThreeOrTwoSchema.isValid(2)).toBe(true);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(await divisibleByThreeOrTwoSchema.isValid(6)).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates if none of the schemas is valid', async (done: any) => {
    const isValid = await divisibleByThreeOrTwoSchema.isValid(5);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });
});
