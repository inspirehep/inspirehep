/* eslint no-underscore-dangle: ["error", { "allow": ["_created_at", "_updated_at"] }] */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  InternalAxiosRequestConfig,
} from 'axios';
import { startCase } from 'lodash';
import { BACKOFFICE_API } from './routes';

function transformBackofficeUrl(url: string) {
  let newUrl = url;
  const match = url.match(/\/backoffice\/search/);
  if (match) {
    newUrl = newUrl.replace('/facets', '').replace('q=', 'search=');
    return newUrl.replace(`/backoffice/search`, `/workflows/authors/search/`);
  }
  return url;
}

function transformBackofficeResponse(data: any) {
  return {
    hits: {
      hits: data.results.map((item: any) => ({
        id: item.id,
        created: item.legacy_creation_date,
        updated: item._created_at,
        data: {
          ...item.data,
          _created_at: item._created_at,
          _updated_at: item._updated_at,
        },
        decisions: item.decisions,
        workflow_type: item.workflow_type,
        status: item.status,
      })),
      total: data.count,
    },

    links: {
      self: data.previous || '',
      next: data.next || '',
    },
    aggregations: Object.entries(data.facets || {}).reduce(
      (acc: Record<string, any>, [key, value]: [string, any]) => {
        const cleanKey = key.replace('_filter_', '');
        const buckets = value[cleanKey]?.buckets || value.status?.buckets || [];
        acc[cleanKey] = {
          ...value,
          buckets,
          meta: {
            title: startCase(cleanKey.replace(/_/g, ' ')),
            type: 'checkbox',
          },
        };
        return acc;
      },
      {}
    ),
  };
}

// `Proxy` could be used instead of wrapper class, depending on the browser support
export class HttpClientWrapper {
  private httpClient;

  private activeCancelManagersById = new Map<string, CancelTokenSource>();

  constructor(config: AxiosRequestConfig) {
    this.httpClient = axios.create({
      ...config,
    });
    this.setupInterceptors();
  }

  private static handleRequestUrlInterceptor(
    config: InternalAxiosRequestConfig
  ) {
    const url = config.url || '';
    if (url.startsWith('/backoffice')) {
      config.baseURL = BACKOFFICE_API;
      config.withCredentials = true;
      config.url = transformBackofficeUrl(url);
      config.headers.Accept = 'application/json';
    } else {
      config.baseURL = '/api';
    }
    return config;
  }

  private static handleResponseInterceptor(response: AxiosResponse) {
    if (response.config.url?.includes('/workflows/authors/search')) {
      return {
        ...response,
        data: transformBackofficeResponse(response.data),
      };
    }
    return response;
  }

  private setupInterceptors() {
    this.httpClient.interceptors.request.use(
      HttpClientWrapper.handleRequestUrlInterceptor
    );
    this.httpClient.interceptors.response.use(
      HttpClientWrapper.handleResponseInterceptor
    );
  }

  /**
   * Allows requests to be tracked by id
   * and there can't be multiple active requests with the same id
   * current one is cancelled when a newer one comes
   */
  async get(url: string, config?: AxiosRequestConfig, id?: string) {
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

const http = new HttpClientWrapper({});

export function isCancelError(error: Error) {
  return axios.isCancel(error);
}

export const UI_SERIALIZER_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
};

export default http;
