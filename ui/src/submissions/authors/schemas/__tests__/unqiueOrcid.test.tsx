import MockAdapter from 'axios-mock-adapter';

import uniqueOrcid from '../uniqueOrcid';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../../../common/http.ts';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('uniqueOrcid', () => {
  const schema = uniqueOrcid();

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    mockHttp.reset();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when null', async (done: any) => {
    const isValid = await schema.isValid(undefined);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when empty', async (done: any) => {
    const isValid = await schema.isValid('');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when orcid does not exist', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(404);

    const isValid = await schema.isValid(orcid);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when orcid does not exist after trimming', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(404);

    const isValid = await schema.isValid(`  ${orcid} `);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when orcid exists after trimming', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(200, {
      metadata: { control_number: 999108 },
    });

    const isValid = await schema.isValid(`  ${orcid} `);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when request fails', async (done: any) => {
    const orcid = '0000-0002-9127-1687';
    mockHttp.onGet(`/orcid/${orcid}`).replyOnce(500);

    const isValid = await schema.isValid(orcid);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationError).toBeDefined();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationError.message).toMatchSnapshot();
    done();
  });
});
