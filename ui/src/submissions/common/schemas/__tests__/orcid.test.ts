import isValidOrcid from 'is-valid-orcid';

import orcid from '../orcid';

jest.mock('is-valid-orcid');

describe('orcid', () => {
  const orcidSchema = orcid();

  it('validates when undefined', async (done: any) => {
    const isValid = await orcidSchema.isValid(undefined);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when has empty spaces', () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    isValidOrcid.mockImplementationOnce(() => true);
    orcidSchema.isValidSync(' 0000-0000-0000-0000 ');
    expect(isValidOrcid).toHaveBeenCalledWith('0000-0000-0000-0000');
  });

  it('validates when isValidOrcid returns true', async (done: any) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    isValidOrcid.mockImplementationOnce(() => true);
    const isValid = await orcidSchema.isValid('VALID ORCID');
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when isValidOrcid returns false', async (done: any) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    isValidOrcid.mockImplementationOnce(() => false);
    const isValid = await orcidSchema.isValid('INVALID ORCID');
    expect(isValid).toBe(false);
    done();
  });
});
