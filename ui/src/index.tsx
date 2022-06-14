import 'core-js/modules/es7.object.entries';
import 'core-js/modules/es7.array.includes';

import ReactDOM from 'react-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import 'tachyons';
import * as Sentry from '@sentry/browser';
import { Idle } from 'idlejs';

import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import createStore, { history } from './store';
import App from './App';
import ErrorAppCrash from './errors/components/ErrorAppCrash';
import ErrorBoundary from './common/components/ErrorBoundary';
import { injectTrackerToHistory, getClientId } from './tracker';
import { getConfigFor } from './common/config';
import { userInactive } from './actions/user';

Sentry.init({
  dsn: getConfigFor('REACT_APP_SENTRY_DSN'),
  release: process.env.REACT_APP_VERSION,
  environment: getConfigFor('REACT_APP_SENTRY_ENVIRONMENT'),
});
// @ts-expect-error ts-migrate(2322) FIXME: Type 'string | null' is not assignable to type 'st... Remove this comment to see the full error message
Sentry.setUser({ id: getClientId() });

const store = createStore();

ReactDOM.render(
  // eslint-disable-next-line react/jsx-filename-extension
  <ErrorBoundary renderError={() => <ErrorAppCrash />}>
    <Provider store={store}>
      <ConnectedRouter history={injectTrackerToHistory(history)}>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  </ErrorBoundary>,
  document.getElementById('root')
);

// TODO: change to CRA 2.0 service worker script and register instead of unregistering.
// registerServiceWorker();
unregisterServiceWorker();

new Idle()
  .whenNotInteractive()
  .within(30)
  .do(() => store.dispatch(userInactive()))
  .start();
