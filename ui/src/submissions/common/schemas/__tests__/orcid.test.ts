import isValidOrcid from 'is-valid-orcid';

import orcid from '../orcid';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('is-valid-orcid');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('orcid', () => {
  const orcidSchema = orcid();

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when undefined', async (done: $TSFixMe) => {
    const isValid = await orcidSchema.isValid(undefined);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when has empty spaces', () => {
    (isValidOrcid as $TSFixMe).mockImplementationOnce(() => true);
    orcidSchema.isValidSync(' 0000-0000-0000-0000 ');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValidOrcid).toHaveBeenCalledWith('0000-0000-0000-0000');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when isValidOrcid returns true', async (done: $TSFixMe) => {
    (isValidOrcid as $TSFixMe).mockImplementationOnce(() => true);
    const isValid = await orcidSchema.isValid('VALID ORCID');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when isValidOrcid returns false', async (done: $TSFixMe) => {
    (isValidOrcid as $TSFixMe).mockImplementationOnce(() => false);
    const isValid = await orcidSchema.isValid('INVALID ORCID');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });
});
