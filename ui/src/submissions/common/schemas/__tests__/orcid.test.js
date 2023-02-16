import isValidOrcid from 'is-valid-orcid';

import orcid from '../orcid';

jest.mock('is-valid-orcid');

describe('orcid', () => {
  const orcidSchema = orcid();

  it('validates when undefined', async () => {
    const isValid = await orcidSchema.isValid(undefined);
    expect(isValid).toBe(true);
  });

  it('validates when has empty spaces', () => {
    isValidOrcid.mockImplementationOnce(() => true);
    orcidSchema.isValidSync(' 0000-0000-0000-0000 ');
    expect(isValidOrcid).toHaveBeenCalledWith('0000-0000-0000-0000');
  });

  it('validates when isValidOrcid returns true', async () => {
    isValidOrcid.mockImplementationOnce(() => true);
    const isValid = await orcidSchema.isValid('VALID ORCID');
    expect(isValid).toBe(true);
  });

  it('invalidates when isValidOrcid returns false', async () => {
    isValidOrcid.mockImplementationOnce(() => false);
    const isValid = await orcidSchema.isValid('INVALID ORCID');
    expect(isValid).toBe(false);
  });
});
