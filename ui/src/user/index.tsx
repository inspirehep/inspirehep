import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Redirect } from 'react-router-dom';

import RouteOrRedirect from '../common/components/RouteOrRedirect';
import LoginPageContainer from './containers/LoginPageContainer';
import ProfilePage from './components/ProfilePage';
import SignUpPageContainer from './containers/SignUpPageContainer';
import PrivateRoute from '../common/PrivateRoute';
import LocalLoginPageContainer from './containers/LocalLoginPageContainer';
import {
  USER_LOGIN,
  USER_SIGNUP,
  USER_LOCAL_LOGIN,
  USER_PROFILE,
  USER,
  HOME,
  USER_SETTINGS,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import SettingsContainer from '../settings/containers/SettingsContainer';

const User = ({
  loggedIn,
  previousUrl,
}: {
  loggedIn: boolean;
  previousUrl: string;
}) => {
  return (
    <div className="w-100" data-testid="user">
      <SafeSwitch>
        <Redirect exact from={USER} to={USER_PROFILE} />
        <RouteOrRedirect
          exact
          path={USER_LOGIN}
          condition={!loggedIn}
          component={LoginPageContainer}
          redirectTo={previousUrl}
        />
        <RouteOrRedirect
          exact
          path={USER_SETTINGS}
          condition={loggedIn}
          component={SettingsContainer}
          redirectTo={previousUrl}
        />
        <RouteOrRedirect
          exact
          path={USER_SIGNUP}
          condition={!loggedIn}
          component={SignUpPageContainer}
          redirectTo={HOME}
        />
        <RouteOrRedirect
          exact
          path={USER_LOCAL_LOGIN}
          condition={!loggedIn}
          component={LocalLoginPageContainer}
          redirectTo={previousUrl}
        />
        {/* @ts-ignore */}
        <PrivateRoute exact path={USER_PROFILE} component={ProfilePage} />
      </SafeSwitch>
    </div>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.user.get('loggedIn'),
  previousUrl: state.router.location.previousUrl,
});

export default connect(stateToProps)(User);
