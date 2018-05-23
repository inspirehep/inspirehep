import MockAdapter from 'axios-mock-adapter';

import http from '../../common/http';
import citeArticle from '../citeArticle';

const mockHttp = new MockAdapter(http);

describe('citeArticle', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('sends request with Accept header based on format and returns text', async (done) => {
    const citeUrl = '/literature/12345';
    const format = 'test';
    mockHttp.onGet(citeUrl, null, { Accept: 'application/x-test' }).replyOnce(200, 'Test');
    const content = await citeArticle(format, 12345);
    expect(content).toEqual('Test');
    done();
  });

  it('sends request with Accept header based on format and returns text', async (done) => {
    const citeUrl = '/literature/12345';
    const format = 'another';
    mockHttp.onGet(citeUrl, null, { Accept: 'application/x-test' }).replyOnce(200, 'Test');
    const content = await citeArticle(format, 12345);
    expect(content).toEqual('nothing for format: another');
    done();
  });


  // TODO: test error case
});
