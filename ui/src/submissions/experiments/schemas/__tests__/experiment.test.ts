import experimentSchema from '../experiment';
import { experimentValues } from '../constants';

const dataWithRequiredFields = {
  project_type: [experimentValues[0]],
  legacy_name: "LATTICE-ETM",
};

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('experimentSchema', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await experimentSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await experimentSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when project_type is one of enum values', async () => {
    const data = {
      ...dataWithRequiredFields,
      project_type: [experimentValues[1]],
    };
    const isValid = await experimentSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when project_type is not one of enum values', async () => {
    const data = {
      ...dataWithRequiredFields,
      project_type: [experimentValues[0], 'test_type'],
    };
    const isValid = await experimentSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when legacy_name is a string', async () => {
    const data = {
      ...dataWithRequiredFields,
      legacy_name: 'test_name',
    };
    const isValid = await experimentSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when when legacy_name is an empty string', async () => {
    const data = {
      ...dataWithRequiredFields,
      legacy_name: '',
    };
    const isValid = await experimentSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });
});
