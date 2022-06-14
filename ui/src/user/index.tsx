import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';

type UserProps = {
    loggedIn: boolean;
    previousUrl: string;
};

class User extends Component<UserProps> {

  render() {
    const { loggedIn, previousUrl } = this.props;
    return (
      <div className="w-100">
        {/* @ts-expect-error ts-migrate(2559) FIXME: Type '{ children: Element[]; }' has no properties ... Remove this comment to see the full error message */}
        <SafeSwitch>
          <Redirect exact from={USER} to={USER_PROFILE} />
          <RouteOrRedirect
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exact: true; path: string; condition: bool... Remove this comment to see the full error message
            exact
            path={USER_LOGIN}
            condition={!loggedIn}
            component={LoginPageContainer}
            redirectTo={previousUrl}
          />
          <RouteOrRedirect
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exact: true; path: string; condition: bool... Remove this comment to see the full error message
            exact
            path={USER_SIGNUP}
            condition={!loggedIn}
            component={SignUpPageContainer}
            redirectTo={HOME}
          />
          <RouteOrRedirect
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exact: true; path: string; condition: bool... Remove this comment to see the full error message
            exact
            path={USER_LOCAL_LOGIN}
            condition={!loggedIn}
            component={LocalLoginPageContainer}
            redirectTo={previousUrl}
          />
          <PrivateRoute exact path={USER_PROFILE} component={ProfilePage} />
        </SafeSwitch>
      </div>
    );
  }
}

const stateToProps = (state: $TSFixMe) => ({
  loggedIn: state.user.get('loggedIn'),
  previousUrl: state.router.location.previousUrl
});

export default connect(stateToProps)(User);
