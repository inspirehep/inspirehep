import MockAdapter from 'axios-mock-adapter';

import http from '../../common/http';
import citeArticle from '../citeArticle';

const mockHttp = new MockAdapter(http.httpClient);

<<<<<<< Updated upstream

describe('citeArticle', () => {
 
=======
describe('citeArticle', () => {
>>>>>>> Stashed changes
  afterEach(() => {
    mockHttp.reset();
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('sends request with Accept header based on format and returns text', async (done: any) => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .replyOnce(200, 'Test');
    const content = await citeArticle(format, 12345);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(content).toEqual('Test');
    done();
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('returns a status code that is not 2xx without data', async (done: any) => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .replyOnce(500);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Request failed with status code 500')
    );
    done();
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('returns a network error', async (done: any) => {
    const citeUrl = '/literature/12345';
    const format = 'application/x-test';
    mockHttp
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
      .onGet(citeUrl, null, { Accept: 'application/x-test' })
      .networkError();
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    await expect(citeArticle(format, 12345)).rejects.toThrow(
      new Error('Network Error')
    );
    done();
  });
});
