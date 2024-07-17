import React from 'react';
import { Route } from 'react-router-dom';
import { connect, RootStateOrAny } from 'react-redux';

import DashboardPageContainer from './containers/DashboardPageContainer/DashboardPageContainer';
import SearchPageContainer from './containers/SearchPageContainer/SearchPageContainer';
import {
  HOLDINGPEN_NEW,
  HOLDINGPEN_SEARCH_NEW,
  HOLDINGPEN_LOGIN_NEW,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import AuthorDetailPageContainer from './containers/DetailPageContainer/AuthorDetailPageContainer';
import DocumentHead from '../common/components/DocumentHead';
import LoginPageContainer from './containers/LoginPageContainer/LoginPageContainer';
import PrivateRoute from '../common/PrivateRoute';

const META_DESCRIPTION = 'Tool for curators to manage submissions and harvests';
const TITLE = 'Holdingpen';

const Holdingpen = () => {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <div className="w-100" data-testid="holdingpen-new">
        <SafeSwitch>
          <Route
            exact
            path={HOLDINGPEN_LOGIN_NEW}
            component={LoginPageContainer}
          />
          <PrivateRoute
            exact
            path={HOLDINGPEN_NEW}
            component={DashboardPageContainer}
            holdingpen
          />
          <PrivateRoute
            exact
            path={HOLDINGPEN_SEARCH_NEW}
            component={SearchPageContainer}
            holdingpen
          />
          <PrivateRoute
            exact
            path={`${HOLDINGPEN_NEW}/:id`}
            component={AuthorDetailPageContainer}
            holdingpen
          />
        </SafeSwitch>
      </div>
    </>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.holdingpen.get('loggedIn'),
});

export default connect(stateToProps)(Holdingpen);
