import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';
import { Set } from 'immutable';

import './App.scss';
import Header from './common/layouts/Header';
import Footer from './common/layouts/Footer';
import Loading from './common/components/Loading';
import SafeSwitch from './common/components/SafeSwitch';
import PrivateRoute from './common/PrivateRoute';

import {
  HOME,
  USER,
  HOLDINGPEN,
  LITERATURE,
  AUTHORS,
  SUBMISSIONS,
  ERRORS,
  JOBS,
  isBetaRoute,
} from './common/routes';
import UserFeedback from './common/components/UserFeedback';
import { setUserCategoryFromRoles } from './tracker';

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
const Jobs$ = Loadable({
  loader: () => import('./jobs'),
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

function App({ userRoles }) {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    Loadable.preloadAll();
  }, []);

  useEffect(
    () => {
      setUserCategoryFromRoles(userRoles);
    },
    [userRoles]
  );

  return (
    <Layout className="__App__">
      <Header onHeightChange={setHeaderHeight} />
      <Layout.Content className="content" style={{ marginTop: headerHeight }}>
        <SafeSwitch id="main">
          <Route exact path={HOME} component={Home$} />
          <Route path={USER} component={User$} />
          <PrivateRoute path={HOLDINGPEN} component={Holdingpen$} />
          <Route path={LITERATURE} component={Literature$} />
          <Route path={AUTHORS} component={Authors$} />
          <Route path={JOBS} component={Jobs$} />
          <PrivateRoute path={SUBMISSIONS} component={Submissions$} />
          <Route path={ERRORS} component={Errors$} />
        </SafeSwitch>
        <UserFeedback />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

App.propTypes = {
  isBannerVisible: PropTypes.bool.isRequired,
  isBetaPage: PropTypes.bool.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
};

const stateToProps = state => ({
  isBannerVisible: state.ui.get('bannerVisibility'),
  isBetaPage: isBetaRoute(String(state.router.location.pathname)),
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(App);
