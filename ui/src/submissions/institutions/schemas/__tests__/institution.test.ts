import institutionSchema from '../institution';

const dataWithRequiredFields = {
  identifier: 'test_institution',
};

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('identifierSchema', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await institutionSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await institutionSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when identifier identifier is a string', async () => {
    const data = {
      ...dataWithRequiredFields,
      identifier: 'test_name',
    };
    const isValid = await institutionSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when when identifier identifier is an empty string', async () => {
    const data = {
      ...dataWithRequiredFields,
      identifier: '',
    };
    const isValid = await institutionSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });
});
