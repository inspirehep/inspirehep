import * as Sentry from '@sentry/browser';

// eslint-disable-next-line import/prefer-default-export
export function getConfigFor(configKey) {
  try {
    return window.CONFIG[configKey];
  } catch (error) {
    Sentry.captureException(error);
    console.error(error); // eslint-disable-line no-console
    return null;
  }
}
