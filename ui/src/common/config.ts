import * as Sentry from '@sentry/browser';

export function getConfigFor(configKey: string, notSetValue: any = null) {
  try {
    return window.CONFIG[configKey] != null
      ? window.CONFIG[configKey]
      : notSetValue;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return notSetValue;
  }
}
