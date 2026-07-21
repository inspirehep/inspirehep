import React, { useEffect, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import './App.less';
import Header from './common/layouts/Header';
import Footer from './common/layouts/Footer';
import Loading from './common/components/Loading';
import RoutesWithFallback from './common/components/RoutesWithFallback';
import RequireAuth from './common/RequireAuth';

import {
  HOME,
  USER,
  HOLDINGPEN,
  BACKOFFICE,
  LITERATURE,
  AUTHORS,
  SUBMISSIONS,
  ERRORS,
  JOBS,
  CONFERENCES,
  INSTITUTIONS,
  SEMINARS,
  DATA,
  EXPERIMENTS,
  BIBLIOGRAPHY_GENERATOR,
  JOURNALS,
} from './common/routes';
import { setUserCategoryFromRoles, setClientId } from './tracker';
import { fetchLoggedInUser } from './actions/user';
import Home from './home';
import Literature from './literature';
import Conferences from './conferences';
import Data from './data';
import Authors from './authors';
import Jobs from './jobs';
import User from './user';
import Errors from './errors';
import GuideModalContainer from './common/containers/GuideModalContainer';
import { changeGuideModalVisibility } from './actions/ui';
import { getConfigFor } from './common/config';
import Institutions from './institutions';
import Seminars from './seminars';
import Experiments from './experiments';
import Journals from './journals';
import BibliographyGeneratorPageContainer from './bibliographyGenerator/BibliographyGeneratorPageContainer';
import { SUPERUSER_OR_CATALOGER } from './common/authorization';

const LazyHoldingpen = React.lazy(() => import('./holdingpen'));
const LazyBackoffice = React.lazy(() => import('./backoffice'));
const LazySubmissions = React.lazy(() => import('./submissions'));

function App({ userRoles, dispatch, guideModalVisibility }) {
  useEffect(() => {
    dispatch(fetchLoggedInUser());
  }, [dispatch]);

  useEffect(() => {
    const hasGuideModalBeenDisplayed = guideModalVisibility != null;
    const shouldDisplayGuideOnStart = getConfigFor('DISPLAY_GUIDE_ON_START');
    if (!hasGuideModalBeenDisplayed && shouldDisplayGuideOnStart) {
      setTimeout(() => {
        dispatch(changeGuideModalVisibility(true));
      }, 3000);
    }
  }, [guideModalVisibility, dispatch]);

  useEffect(() => {
    setUserCategoryFromRoles(userRoles);
  }, [userRoles]);

  useEffect(() => {
    setClientId();
  }, []);

  return (
    <Layout className="__App__" data-testid="app">
      <Header />
      <Layout.Content className="content">
        <Suspense fallback={<Loading />}>
          <RoutesWithFallback>
            <Route path={HOME} element={<Home />} />
            <Route path={`${USER}/*`} element={<User />} />
            <Route
              path={`${HOLDINGPEN}/*`}
              element={
                <RequireAuth>
                  <LazyHoldingpen />
                </RequireAuth>
              }
            />
            <Route
              path={`${BACKOFFICE}/*`}
              element={
                <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
                  <LazyBackoffice />
                </RequireAuth>
              }
            />
            <Route path={`${LITERATURE}/*`} element={<Literature />} />
            <Route path={`${AUTHORS}/*`} element={<Authors />} />
            <Route path={`${JOBS}/*`} element={<Jobs />} />
            <Route path={`${CONFERENCES}/*`} element={<Conferences />} />
            <Route path={`${INSTITUTIONS}/*`} element={<Institutions />} />
            <Route path={`${SEMINARS}/*`} element={<Seminars />} />
            <Route path={`${EXPERIMENTS}/*`} element={<Experiments />} />
            <Route path={`${JOURNALS}/*`} element={<Journals />} />
            <Route path={`${DATA}/*`} element={<Data />} />
            <Route
              path={`${SUBMISSIONS}/*`}
              element={
                <RequireAuth>
                  <LazySubmissions />
                </RequireAuth>
              }
            />
            <Route
              path={`${BIBLIOGRAPHY_GENERATOR}/*`}
              element={<BibliographyGeneratorPageContainer />}
            />
            <Route path={`${ERRORS}/*`} element={<Errors />} />
          </RoutesWithFallback>
        </Suspense>
        <GuideModalContainer />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

App.propTypes = {
  guideModalVisibility: PropTypes.bool,
  userRoles: PropTypes.instanceOf(List).isRequired,
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = (state) => ({
  guideModalVisibility: state.ui.get('guideModalVisibility'),
  userRoles: state.user.getIn(['data', 'roles']),
});

const dispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(stateToProps, dispatchToProps)(App);
