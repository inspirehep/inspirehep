import { InternalAxiosRequestConfig } from 'axios';

import { HttpClientWrapper } from '../http';

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

  it('never settles responses with status 0 (page is being left)', async () => {
    const http = new HttpClientWrapper({ adapter: respondWith(0, '') });
    const settled = jest.fn();

    http.get('/foo').then(settled, settled);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(settled).not.toHaveBeenCalled();
  });
});
