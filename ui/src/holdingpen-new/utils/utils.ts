import storage from '../../common/storage';
import { BACKOFFICE_LOGIN, HOLDINGPEN_LOGIN_NEW } from '../../common/routes';

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
