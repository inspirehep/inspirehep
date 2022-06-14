import React, { useEffect } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route } from 'react-router-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Layout } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import Loadable from 'react-loadable';
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
  CONFERENCES,
  INSTITUTIONS,
  SEMINARS,
  EXPERIMENTS,
  BIBLIOGRAPHY_GENERATOR,
} from './common/routes';
import UserFeedback from './common/components/UserFeedback';
import { setUserCategoryFromRoles, setClientId } from './tracker';
import { fetchLoggedInUser } from './actions/user';
import Home from './home';
import Literature from './literature';
import Conferences from './conferences';
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
import BibliographyGeneratorPageContainer from './bibliographyGenerator/BibliographyGeneratorPageContainer';

const Holdingpen$ = Loadable({
  loader: () => import('./holdingpen'),
  loading: Loading,
});
const Submissions$ = Loadable({
  loader: () => import('./submissions'),
  loading: Loading,
});

type AppProps = {
    guideModalVisibility?: boolean;
    userRoles: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    dispatch: $TSFixMeFunction;
};

function App({ userRoles, dispatch, guideModalVisibility }: AppProps) {
  useEffect(
    () => {
      dispatch(fetchLoggedInUser());
    },
    [dispatch]
  );

  useEffect(
    () => {
      const hasGuideModalBeenDisplayed = guideModalVisibility != null;
      const shouldDisplayGuideOnStart = getConfigFor('DISPLAY_GUIDE_ON_START');
      if (!hasGuideModalBeenDisplayed && shouldDisplayGuideOnStart) {
        setTimeout(() => {
          dispatch(changeGuideModalVisibility(true));
        }, 3000);
      }
    },
    [guideModalVisibility, dispatch]
  );

  useEffect(
    () => {
      setUserCategoryFromRoles(userRoles);
    },
    [userRoles]
  );

  useEffect(() => {
    setClientId();
  }, []);

  return (
    <Layout className="__App__">
      <Header />
      <Layout.Content className="content">
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element[]; id: string; }' is not... Remove this comment to see the full error message */}
        <SafeSwitch id="main">
          <Route exact path={HOME} component={Home} />
          <Route path={USER} component={User} />
          <PrivateRoute path={HOLDINGPEN} component={Holdingpen$} />
          <Route path={LITERATURE} component={Literature} />
          <Route path={AUTHORS} component={Authors} />
          <Route path={JOBS} component={Jobs} />
          <Route path={CONFERENCES} component={Conferences} />
          <Route path={INSTITUTIONS} component={Institutions} />
          <Route path={SEMINARS} component={Seminars} />
          <Route path={EXPERIMENTS} component={Experiments} />
          <PrivateRoute path={SUBMISSIONS} component={Submissions$} />
          <Route
            path={BIBLIOGRAPHY_GENERATOR}
            component={BibliographyGeneratorPageContainer}
          />
          <Route path={ERRORS} component={Errors} />
        </SafeSwitch>
        <UserFeedback />
        <GuideModalContainer />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

const stateToProps = (state: $TSFixMe) => ({
  guideModalVisibility: state.ui.get('guideModalVisibility'),
  userRoles: state.user.getIn(['data', 'roles'])
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(App);
