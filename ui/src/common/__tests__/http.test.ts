import axios, { InternalAxiosRequestConfig } from 'axios';

import { HttpClientWrapper } from '../http';
import { httpErrorToActionPayload } from '../utils';

const respondWith =
  (status: number, data: unknown) =>
  async (config: InternalAxiosRequestConfig) => ({
    data,
    status,
    statusText: '',
    headers: {},
    config,
  });

describe('HttpClientWrapper', () => {
  it('resolves successful responses', async () => {
    const http = new HttpClientWrapper({
      adapter: respondWith(200, { foo: 'bar' }),
    });

    const response = await http.get('/foo');

    expect(response.data).toEqual({ foo: 'bar' });
  });

  it('rejects responses with status 0 as network errors', async () => {
    const http = new HttpClientWrapper({ adapter: respondWith(0, '') });

    const error = await http.get('/foo').catch((err) => err);

    expect(axios.isAxiosError(error)).toBe(true);
    expect(httpErrorToActionPayload(error)).toEqual({
      error: { status: 'network' },
    });
  });
});
