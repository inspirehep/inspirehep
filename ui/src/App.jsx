import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';
import { List } from 'immutable';

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
  CONFERENCES,
} from './common/routes';
import UserFeedback from './common/components/UserFeedback';
import { setUserCategoryFromRoles } from './tracker';
import { fetchLoggedInUser } from './actions/user';
import Home from './home';
import Literature from './literature';
import Conferences from './conferences';
import Authors from './authors';
import Jobs from './jobs';
import User from './user';
import Errors from './errors';

const Holdingpen$ = Loadable({
  loader: () => import('./holdingpen'),
  loading: Loading,
});
const Submissions$ = Loadable({
  loader: () => import('./submissions'),
  loading: Loading,
});

function App({ userRoles, dispatch }) {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(
    () => {
      dispatch(fetchLoggedInUser());
    },
    [dispatch]
  );

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
          <Route exact path={HOME} component={Home} />
          <Route path={USER} component={User} />
          <PrivateRoute path={HOLDINGPEN} component={Holdingpen$} />
          <Route path={LITERATURE} component={Literature} />
          <Route path={AUTHORS} component={Authors} />
          <Route path={JOBS} component={Jobs} />
          <Route path={CONFERENCES} component={Conferences} />
          <PrivateRoute path={SUBMISSIONS} component={Submissions$} />
          <Route path={ERRORS} component={Errors} />
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
  userRoles: PropTypes.instanceOf(List).isRequired,
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = state => ({
  isBannerVisible: state.ui.get('bannerVisibility'),
  isBetaPage: isBetaRoute(String(state.router.location.pathname)),
  userRoles: state.user.getIn(['data', 'roles']),
});

const dispatchToProps = dispatch => ({
  dispatch,
});

export default connect(stateToProps, dispatchToProps)(App);
