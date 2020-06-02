import axios from 'axios';

// `Proxy` could be used instead of wrapper class, depending on the browser support
class HttpClientWrapper {
  constructor() {
    this.httpClient = axios.create({
      baseURL: '/api',
    });

    this.activeCancelManagersById = new Map();
  }

  /**
   * Allows requests to be tracked by id
   * and there can't be multiple active requests with the same id
   * current one is cancelled when a newer one comes
   */
  async get(url, config, id) {
    if (!id) {
      return this.httpClient.get(url, config);
    }

    if (this.activeCancelManagersById.has(id)) {
      const cancelManager = this.activeCancelManagersById.get(id);
      cancelManager.cancel();
    }

    const cancelManager = axios.CancelToken.source();
    this.activeCancelManagersById.set(id, cancelManager);
    try {
      const response = await this.httpClient.get(url, {
        ...config,
        cancelToken: cancelManager.token,
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

  post(...args) {
    return this.httpClient.post(...args);
  }

  put(...args) {
    return this.httpClient.put(...args);
  }
}

const http = new HttpClientWrapper();
export default http;

export function isCancelError(error) {
  return axios.isCancel(error);
}

export const UI_SERIALIZER_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
};
