// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import Piwik from 'react-piwik';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'uuid... Remove this comment to see the full error message
import { v4 as generateUUIDv4 } from 'uuid';

import { isSuperUser, isCataloger } from './common/authorization';
import { getConfigFor } from './common/config';

function isTrackerConfigured() {
  const PIWIK_URL = getConfigFor('REACT_APP_PIWIK_URL');
  const PIWIK_SITE_ID = getConfigFor('REACT_APP_PIWIK_SITE_ID');
  return PIWIK_URL != null && PIWIK_SITE_ID != null;
}

export function injectTrackerToHistory(history: any) {
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

export async function trackEvent(...args: any[]) {
  if (isTrackerConfigured()) {
    Piwik.push(['trackEvent', ...args]);
  }
}

function getUserEventCategoryFromRoles(userRoles: any) {
  if (isSuperUser(userRoles)) {
    return 'Superuser';
  }

  if (isCataloger(userRoles)) {
    return 'Cataloger';
  }

  return 'User';
}

export async function setUserCategoryFromRoles(userRoles: any) {
  if (isTrackerConfigured()) {
    const userCategory = getUserEventCategoryFromRoles(userRoles);
    Piwik.push(['setCustomVariable', 1, 'UserCategory', userCategory]);
  }
}

export function checkIsTrackerBlocked() {
  // @ts-expect-error ts-migrate(2339) FIXME: Property '_paq' does not exist on type 'Window & t... Remove this comment to see the full error message
  return Array.isArray(window._paq) || navigator.doNotTrack === '1'; // eslint-disable-line no-underscore-dangle
}

export function getClientId() {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = generateUUIDv4();
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
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
