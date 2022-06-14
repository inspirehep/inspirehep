import * as Sentry from '@sentry/browser';

export function getConfigFor(configKey: any, notSetValue = null) {
  try {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Window &... Remove this comment to see the full error message
    return window.CONFIG[configKey] != null
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Window &... Remove this comment to see the full error message
      ? window.CONFIG[configKey]
      : notSetValue;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error); // eslint-disable-line no-console
    return notSetValue;
  }
}
