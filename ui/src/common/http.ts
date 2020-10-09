import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';

// `Proxy` could be used instead of wrapper class, depending on the browser support
class HttpClientWrapper {
  httpClient = axios.create({
    baseURL: '/api',
  });
  private activeCancelManagersById = new Map<string, CancelTokenSource>();

  /**
   * Allows requests to be tracked by id
   * and there can't be multiple active requests with the same id
   * current one is cancelled when a newer one comes
   */
  async get(url: string, config: AxiosRequestConfig, id?: string) {
    if (!id) {
      return this.httpClient.get(url, config);
    }

    const activeCancelManager = this.activeCancelManagersById.get(id);
    if (activeCancelManager) {
      activeCancelManager.cancel();
    }

    const newCancelManager = axios.CancelToken.source();
    this.activeCancelManagersById.set(id, newCancelManager);
    try {
      const response = await this.httpClient.get(url, {
        ...config,
        cancelToken: newCancelManager.token,
      });

      this.activeCancelManagersById.delete(id);
      return response;
    } catch (error) {
      if (!axios.isCancel(error)) {
        this.activeCancelManagersById.delete(id);
      }
      throw error;
    }
  }

  post(...args: Parameters<typeof axios.post>) {
    return this.httpClient.post(...args);
  }

  put(...args: Parameters<typeof axios.put>) {
    return this.httpClient.put(...args);
  }
}

const http = new HttpClientWrapper();
export default http;

export function isCancelError(error: Error) {
  return axios.isCancel(error);
}

export const UI_SERIALIZER_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
};
