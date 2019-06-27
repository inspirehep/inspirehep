import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import 'tachyons';
import * as Sentry from '@sentry/browser';

import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import createStore, { history } from './store';
import App from './App';
import './theme.less';
import ErrorAppCrash from './errors/components/ErrorAppCrash';
import ErrorBoundary from './common/components/ErrorBoundary';
import { injectTrackerToHistory } from './tracker';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
});

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
