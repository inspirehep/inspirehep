import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';

import {
  BACKOFFICE,
  BACKOFFICE_SEARCH,
  BACKOFFICE_LOGIN,
  BACKOFFICE_LOCAL_LOGIN,
  USER_LOGIN,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import DocumentHead from '../common/components/DocumentHead';
import PrivateRoute from '../common/PrivateRoute';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import SearchPageContainer from './search/containers/SearchPageContainer';
import DashboardPageContainer from './dashboard/containers/DashboardPageContainer';
import LoginPage from './login/components/LoginPage';
import LocalLoginPageContainer from './login/containers/LocalLoginPageContainer';
import AuthorDetailPageContainer from './authors/containers/AuthorDetailPageContainer';

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
