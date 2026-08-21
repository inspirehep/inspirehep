import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { HistoryRouter as Router } from 'redux-first-history/rr6';
import 'antd/dist/antd.less';
import 'tachyons';
import * as Sentry from '@sentry/browser';
import { Idle } from 'idlejs';

import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import createStore, { getReduxHistory } from './store';
import App from './App';
import ErrorAppCrash from './errors/components/ErrorAppCrash';
import ErrorBoundary from './common/components/ErrorBoundary';
import { injectTrackerToHistory, getClientId } from './tracker';
import { getConfigFor } from './common/config';
import { userInactive } from './actions/user';

Sentry.init({
  dsn: getConfigFor('REACT_APP_SENTRY_DSN'),
  release: import.meta.env.VITE_APP_VERSION,
  environment: getConfigFor('REACT_APP_SENTRY_ENVIRONMENT'),
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],
});
Sentry.setUser({ id: getClientId() });

const store = createStore();

/**
 * The "ResizeObserver loop limit exceeded" error means that `ResizeObserver` was not
 * able to deliver all observations within a single animation frame. It doesn't break
 * the functionality of the application. The W3C considers converting this error to a warning:
 * https://github.com/w3c/csswg-drafts/issues/5023
 * We can safely ignore it in the production environment to avoid hammering Sentry and other
 * libraries relying on `window.addEventListener('error', callback)`.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (error) => {
    const isResizeObserverLoopError =
      error.message === 'ResizeObserver loop limit exceeded' ||
      error.message ===
        'ResizeObserver loop completed with undelivered notifications';

    if (process.env.NODE_ENV === 'production' && isResizeObserverLoopError) {
      error.stopImmediatePropagation();
    }
  });
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ErrorBoundary renderError={() => <ErrorAppCrash />}>
    <Provider store={store}>
      <Router history={injectTrackerToHistory(getReduxHistory())}>
        <App />
      </Router>
    </Provider>
  </ErrorBoundary>
);

unregisterServiceWorker();

new Idle()
  .whenNotInteractive()
  .within(30)
  .do(() => store.dispatch(userInactive()))
  .start();
