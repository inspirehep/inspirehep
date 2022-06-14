import * as Sentry from '@sentry/browser';

export function getConfigFor(configKey: $TSFixMe, notSetValue = null) {
  try {
    return (window as $TSFixMe).CONFIG[configKey] != null
    ? (window as $TSFixMe).CONFIG[configKey]
    : notSetValue;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error); // eslint-disable-line no-console
    return notSetValue;
  }
}
