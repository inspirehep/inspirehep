import Piwik from 'react-piwik';
import { isSuperUser, isCataloger } from './common/authorization';

function isTrackerConfigured() {
  const { REACT_APP_PIWIK_URL, REACT_APP_PIWIK_SITE_ID } = window.CONFIG;
  return REACT_APP_PIWIK_URL != null && REACT_APP_PIWIK_SITE_ID != null;
}

export function injectTrackerToHistory(history) {
  if (isTrackerConfigured()) {
    const { REACT_APP_PIWIK_URL, REACT_APP_PIWIK_SITE_ID } = window.CONFIG;
    const piwik = new Piwik({
      url: REACT_APP_PIWIK_URL,
      siteId: Number(REACT_APP_PIWIK_SITE_ID),
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
