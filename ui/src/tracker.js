import Piwik from 'react-piwik';

function isTrackerConfigured() {
  const { REACT_APP_PIWIK_URL, REACT_APP_PIWIK_SITE_ID } = process.env;
  return REACT_APP_PIWIK_URL != null && REACT_APP_PIWIK_SITE_ID != null;
}

export function injectTrackerToHistory(history) {
  if (isTrackerConfigured()) {
    const { REACT_APP_PIWIK_URL, REACT_APP_PIWIK_SITE_ID } = process.env;
    const piwik = new Piwik({
      url: REACT_APP_PIWIK_URL,
      siteId: Number(REACT_APP_PIWIK_SITE_ID),
    });
    return piwik.connectToHistory(history);
  }

  return history;
}

export function trackEvent(...args) {
  if (isTrackerConfigured()) { 
    Piwik.push(['trackEvent', ...args]);
  }
}

export function checkIsTrackerBlocked() {
  return Array.isArray(window._paq) || navigator.doNotTrack === '1'; // eslint-disable-line no-underscore-dangle
}
