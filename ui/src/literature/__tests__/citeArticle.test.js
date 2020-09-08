import MockAdapter from 'axios-mock-adapter';

import http from '../../common/http';
import citeArticle from '../citeArticle';

const mockHttp = new MockAdapter(http.httpClient);

describe('citeArticle', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('sends request with Accept header based on format and returns text', async done => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .replyOnce(200, 'Test');
    const content = await citeArticle(format, 12345);
    expect(content).toEqual('Test');
    done();
  });

  it('returns a status code that is not 2xx without data', async done => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .replyOnce(500);
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Request failed with status code 500')
    );
    done();
  });

  it('returns a network error', async done => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .networkError();
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Network Error')
    );
    done();
  });
});
