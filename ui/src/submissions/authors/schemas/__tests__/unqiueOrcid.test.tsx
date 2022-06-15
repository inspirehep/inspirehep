import MockAdapter from 'axios-mock-adapter';

import uniqueOrcid from '../uniqueOrcid';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../../../common/http.ts';

const mockHttp = new MockAdapter(http.httpClient);

describe('uniqueOrcid', () => {
  const schema = uniqueOrcid();

  afterEach(() => {
    mockHttp.reset();
  });

  it('validates when null', async (done: any) => {
    const isValid = await schema.isValid(undefined);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when empty', async (done: any) => {
    const isValid = await schema.isValid('');
    expect(isValid).toBe(true);
    done();
  });

  it('validates when orcid does not exist', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(404);

    const isValid = await schema.isValid(orcid);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when orcid does not exist after trimming', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(404);

    const isValid = await schema.isValid(`  ${orcid} `);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when orcid exists after trimming', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(200, {
      metadata: { control_number: 999108 },
    });

    const isValid = await schema.isValid(`  ${orcid} `);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when request fails', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(500);

    const isValid = await schema.isValid(orcid);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates if orcid exists with message that includes link to update form', async (done: any) => {
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
    // @ts-ignore
    expect(validationError.message).toMatchSnapshot();
    done();
  });
});
