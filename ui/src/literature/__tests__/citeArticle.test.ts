import MockAdapter from 'axios-mock-adapter';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import citeArticle from '../citeArticle';

const mockHttp = new MockAdapter(http.httpClient);


describe('citeArticle', () => {
 
  afterEach(() => {
    mockHttp.reset();
  });

  
  it('sends request with Accept header based on format and returns text', async (done: any) => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .replyOnce(200, 'Test');
    const content = await citeArticle(format, 12345);
    
    expect(content).toEqual('Test');
    done();
  });

  
  it('returns a status code that is not 2xx without data', async (done: any) => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .replyOnce(500);
    
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Request failed with status code 500')
    );
    done();
  });

  
  it('returns a network error', async (done: any) => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .networkError();
    
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Network Error')
    );
    done();
  });
});
