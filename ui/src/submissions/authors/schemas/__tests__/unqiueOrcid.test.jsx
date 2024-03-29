import MockAdapter from 'axios-mock-adapter';

import uniqueOrcid from '../uniqueOrcid';
import http from '../../../../common/http';

const mockHttp = new MockAdapter(http.httpClient);

describe('uniqueOrcid', () => {
  const schema = uniqueOrcid();

  afterEach(() => {
    mockHttp.reset();
  });

  it('validates when null', async () => {
    const isValid = await schema.isValid(undefined);
    expect(isValid).toBe(true);
  });

  it('validates when empty', async () => {
    const isValid = await schema.isValid('');
    expect(isValid).toBe(true);
  });

  it('validates when orcid does not exist', async () => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(404);

    const isValid = await schema.isValid(orcid);
    expect(isValid).toBe(true);
  });

  it('validates when orcid does not exist after trimming', async () => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(404);

    const isValid = await schema.isValid(`  ${orcid} `);
    expect(isValid).toBe(true);
  });

  it('invalidates when orcid exists after trimming', async () => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(200, {
      metadata: { control_number: 999108 },
    });

    const isValid = await schema.isValid(`  ${orcid} `);
    expect(isValid).toBe(false);
  });

  it('validates when request fails', async () => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(500);

    const isValid = await schema.isValid(orcid);
    expect(isValid).toBe(true);
  });

  it('invalidates if orcid exists with message that includes link to update form', async () => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(200, {
      metadata: { control_number: 999108 },
    });

    let validationError;
    try {
      await schema.validate(orcid);
    } catch (error) {
      validationError = error;
    }

    expect(validationError).toBeDefined();
    expect(validationError.message).toMatchSnapshot();
  });
});
