import {
  BACKOFFICE_LOGIN,
  HOLDINGPEN_LOGIN_NEW,
  BACKOFFICE_SEARCH_API,
  BACKOFFICE_API,
} from '../../common/routes';
import storage from '../../common/storage';

export const refreshToken = async () => {
  try {
    const res = await fetch(`${BACKOFFICE_LOGIN}refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: storage.getSync('holdingpen.refreshToken'),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    storage.set('holdingpen.token', data.access);
    return data.access;
  } catch (error) {
    window.location.assign(HOLDINGPEN_LOGIN_NEW);
  }

  return null;
};

export const getSearchResults = async (
  query: { page: number; size: number } | string
) => {
  const token = storage.getSync('holdingpen.token');

  const resolveQuery =
    typeof query !== 'string'
      ? `${BACKOFFICE_SEARCH_API}?page=${query.page}&size=${query.size}`
      : `${BACKOFFICE_API}/${query}`;

  const fetchResults = async (token: string): Promise<any> => {
    const res = await fetch(`${resolveQuery}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 403) {
      // eslint-disable-next-line no-param-reassign
      token = await refreshToken();
      if (token) {
        return fetchResults(token);
      }
      return { results: [], count: 0 };
    }

    const data = await res.json();
    return data || { results: [], count: 0 };
  };

  return fetchResults(token);
};
