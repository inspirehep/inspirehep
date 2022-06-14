import Piwik from 'react-piwik';
import { v4 as generateUUIDv4 } from 'uuid';

import { isSuperUser, isCataloger } from './common/authorization';
import { getConfigFor } from './common/config';

function isTrackerConfigured() {
  const PIWIK_URL = getConfigFor('REACT_APP_PIWIK_URL');
  const PIWIK_SITE_ID = getConfigFor('REACT_APP_PIWIK_SITE_ID');
  return PIWIK_URL != null && PIWIK_SITE_ID != null;
}

export function injectTrackerToHistory(history) {
  if (isTrackerConfigured()) {
    const PIWIK_URL = getConfigFor('REACT_APP_PIWIK_URL');
    const PIWIK_SITE_ID = getConfigFor('REACT_APP_PIWIK_SITE_ID');
    const piwik = new Piwik({
      url: PIWIK_URL,
      siteId: Number(PIWIK_SITE_ID),
    });
    return piwik.connectToHistory(history);
  }

  return history;
}

export async function trackEvent(...args) {
  if (isTrackerConfigured()) {
    Piwik.push(['trackEvent', ...args]);
  }
}

function getUserEventCategoryFromRoles(userRoles) {
  if (isSuperUser(userRoles)) {
    return 'Superuser';
  }

  if (isCataloger(userRoles)) {
    return 'Cataloger';
  }

  return 'User';
}

export async function setUserCategoryFromRoles(userRoles) {
  if (isTrackerConfigured()) {
    const userCategory = getUserEventCategoryFromRoles(userRoles);
    Piwik.push(['setCustomVariable', 1, 'UserCategory', userCategory]);
  }
}

export function checkIsTrackerBlocked() {
  return Array.isArray(window._paq) || navigator.doNotTrack === '1'; // eslint-disable-line no-underscore-dangle
}

export function getClientId() {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = generateUUIDv4();
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
}

export function setClientId() {
  if (isTrackerConfigured()) {
    const clientId = getClientId();
    Piwik.push(['setUserId', clientId]);
  }
}
