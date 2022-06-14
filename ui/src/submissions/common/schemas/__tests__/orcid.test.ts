import isValidOrcid from 'is-valid-orcid';

import orcid from '../orcid';

jest.mock('is-valid-orcid');

describe('orcid', () => {
  const orcidSchema = orcid();

  it('validates when undefined', async done => {
    const isValid = await orcidSchema.isValid(undefined);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when has empty spaces', () => {
    isValidOrcid.mockImplementationOnce(() => true);
    orcidSchema.isValidSync(' 0000-0000-0000-0000 ');
    expect(isValidOrcid).toHaveBeenCalledWith('0000-0000-0000-0000');
  });

  it('validates when isValidOrcid returns true', async done => {
    isValidOrcid.mockImplementationOnce(() => true);
    const isValid = await orcidSchema.isValid('VALID ORCID');
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when isValidOrcid returns false', async done => {
    isValidOrcid.mockImplementationOnce(() => false);
    const isValid = await orcidSchema.isValid('INVALID ORCID');
    expect(isValid).toBe(false);
    done();
  });
});
