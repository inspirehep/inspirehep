import MockAdapter from 'axios-mock-adapter';

import http from '../../common/http';
import citeArticle from '../citeArticle';

const mockHttp = new MockAdapter(http.httpClient);

describe('citeArticle', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('sends request with Accept header based on format and returns text', async () => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp.onGet(citeUrl).replyOnce(200, 'Test');
    const content = await citeArticle(format, 12345);
    expect(content).toEqual('Test');
  });

  it('returns a status code that is not 2xx without data', async () => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp.onGet(citeUrl).replyOnce(500);
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Request failed with status code 500')
    );
  });

  it('returns a network error', async () => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp.onGet(citeUrl).networkError();
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Network Error')
    );
  });
});
