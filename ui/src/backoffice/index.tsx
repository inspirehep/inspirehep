import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';

import DashboardPageContainer from './containers/DashboardPageContainer/DashboardPageContainer';
import SearchPageContainer from './containers/SearchPageContainer/SearchPageContainer';
import {
  BACKOFFICE,
  BACKOFFICE_SEARCH,
  BACKOFFICE_LOGIN,
  BACKOFFICE_LOCAL_LOGIN,
  USER_LOGIN,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import AuthorDetailPageContainer from './containers/DetailPageContainer/AuthorDetailPageContainer';
import DocumentHead from '../common/components/DocumentHead';
import LoginPage from './components/LoginPage';
import PrivateRoute from '../common/PrivateRoute';
import LocalLoginPageContainer from './containers/LocalLoginPageContainer/LocalLoginPageContainer';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';

const META_DESCRIPTION = 'Tool for curators to manage submissions and harvests';
const TITLE = 'Backoffice';

const Backoffice = ({ loggedIn }: { loggedIn: boolean }) => {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <div className="w-100" data-testid="backoffice">
        <SafeSwitch>
          <PrivateRoute
            exact
            path={BACKOFFICE_LOGIN}
            component={LoginPage}
            redirectTo={USER_LOGIN}
            loggedIn={loggedIn}
            authorizedRoles={SUPERUSER_OR_CATALOGER}
          />
          <PrivateRoute
            exact
            path={BACKOFFICE_LOCAL_LOGIN}
            component={LocalLoginPageContainer}
            redirectTo={BACKOFFICE_LOGIN}
            authorizedRoles={SUPERUSER_OR_CATALOGER}
            backoffice
          />
          <PrivateRoute
            exact
            path={BACKOFFICE}
            component={DashboardPageContainer}
            authorizedRoles={SUPERUSER_OR_CATALOGER}
            backoffice
          />
          <PrivateRoute
            exact
            path={BACKOFFICE_SEARCH}
            component={SearchPageContainer}
            authorizedRoles={SUPERUSER_OR_CATALOGER}
            backoffice
          />
          <PrivateRoute
            exact
            path={`${BACKOFFICE}/:id`}
            component={AuthorDetailPageContainer}
            authorizedRoles={SUPERUSER_OR_CATALOGER}
            backoffice
          />
        </SafeSwitch>
      </div>
    </>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.user.get('loggedIn'),
});

export default connect(stateToProps)(Backoffice);
