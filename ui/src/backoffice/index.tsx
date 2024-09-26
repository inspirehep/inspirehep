import React from 'react';
import { Route } from 'react-router-dom';
import { connect, RootStateOrAny } from 'react-redux';

import DashboardPageContainer from './containers/DashboardPageContainer/DashboardPageContainer';
import SearchPageContainer from './containers/SearchPageContainer/SearchPageContainer';
import {
  BACKOFFICE,
  BACKOFFICE_SEARCH,
  BACKOFFICE_LOGIN,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import AuthorDetailPageContainer from './containers/DetailPageContainer/AuthorDetailPageContainer';
import DocumentHead from '../common/components/DocumentHead';
import LoginPageContainer from './containers/LoginPageContainer/LoginPageContainer';
import PrivateRoute from '../common/PrivateRoute';

const META_DESCRIPTION = 'Tool for curators to manage submissions and harvests';
const TITLE = 'Backoffice';

const Backoffice = () => {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <div className="w-100" data-testid="backoffice">
        <SafeSwitch>
          <Route exact path={BACKOFFICE_LOGIN} component={LoginPageContainer} />
          <PrivateRoute
            exact
            path={BACKOFFICE}
            component={DashboardPageContainer}
            backoffice
          />
          <PrivateRoute
            exact
            path={BACKOFFICE_SEARCH}
            component={SearchPageContainer}
            backoffice
          />
          <PrivateRoute
            exact
            path={`${BACKOFFICE}/:id`}
            component={AuthorDetailPageContainer}
            backoffice
          />
        </SafeSwitch>
      </div>
    </>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.backoffice.get('loggedIn'),
});

export default connect(stateToProps)(Backoffice);
