import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';

import './App.scss';
import Header from './common/layouts/Header';
import Footer from './common/layouts/Footer';
import Loading from './common/components/Loading';
import SafeSwitch from './common/components/SafeSwitch';
import PrivateRoute from './common/PrivateRoute';

import { SUPERUSER_OR_BETAUSER_OR_CATALOGER } from './common/authorization';
import {
  HOME,
  USER,
  HOLDINGPEN,
  LITERATURE,
  AUTHORS,
  SUBMISSIONS,
  ERRORS,
} from './common/routes';
import UserFeedback from './common/components/UserFeedback';

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
    const { isBannerVisible } = this.props;
    return (
      <Layout className="__App__">
        <Header />
        <Layout.Content className="content" style={{ marginTop: isBannerVisible ? 112 : 64 }}>
          <SafeSwitch id="main">
            <Route exact path={HOME} component={Home$} />
            <Route path={USER} component={User$} />
            <PrivateRoute path={HOLDINGPEN} component={Holdingpen$} />
            <PrivateRoute
              path={LITERATURE}
              authorizedRoles={SUPERUSER_OR_BETAUSER_OR_CATALOGER}
              component={Literature$}
            />
            <PrivateRoute
              path={AUTHORS}
              authorizedRoles={SUPERUSER_OR_BETAUSER_OR_CATALOGER}
              component={Authors$}
            />
            <PrivateRoute path={SUBMISSIONS} component={Submissions$} />
            <Route path={ERRORS} component={Errors$} />
          </SafeSwitch>
          <UserFeedback />
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
}

App.propTypes = {
  isBannerVisible: PropTypes.bool.isRequired,
}

const stateToProps = state => ({
  isBannerVisible: state.ui.get('bannerVisibility')
})

export default connect(stateToProps)(App);
