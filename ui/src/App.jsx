import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import Loadable from 'react-loadable';
import { Set } from 'immutable';

import './App.scss';
import Header from './common/layouts/Header';
import Footer from './common/layouts/Footer';
import Loading from './common/components/Loading';
import PrivateRoute from './common/PrivateRoute';

const LITERATURE_AUTHORIZED_ROLES = Set(['superuser', 'betauser', 'cataloger']);
const AUTHORS_AUTHORIZED_ROLES = Set(['superuser']);

const Holdingpen$ = Loadable({
  loader: () => import('./holdingpen'),
  loading: Loading,
});
const Literature$ = Loadable({
  loader: () => import('./literature'),
  loading: Loading,
});
const Authors$ = Loadable({
  loader: () => import('./authors'),
  loading: Loading,
});
const Home$ = Loadable({
  loader: () => import('./home'),
  loading: Loading,
});
const User$ = Loadable({
  loader: () => import('./user'),
  loading: Loading,
});
const Submissions$ = Loadable({
  loader: () => import('./submissions'),
  loading: Loading,
});
const Errors$ = Loadable({
  loader: () => import('./errors'),
  loading: Loading,
});

class App extends Component {
  componentDidMount() {
    Loadable.preloadAll();
  }

  render() {
    return (
      <Layout className="__App__">
        <Header />
        <Layout.Content className="content">
          <Switch id="main">
            <Route exact path="/" component={Home$} />
            <Route path="/user" component={User$} />
            <PrivateRoute path="/holdingpen" component={Holdingpen$} />
            <PrivateRoute
              path="/literature"
              authorizedRoles={LITERATURE_AUTHORIZED_ROLES}
              component={Literature$}
            />
            <PrivateRoute
              path="/authors"
              authorizedRoles={AUTHORS_AUTHORIZED_ROLES}
              component={Authors$}
            />
            <PrivateRoute path="/submissions" component={Submissions$} />
            <Route path="/errors" component={Errors$} />
            <Redirect to="/errors" />
          </Switch>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
}

export default App;
