import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
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

class User extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loggedIn' does not exist on type 'Readon... Remove this comment to see the full error message
    const { loggedIn, previousUrl } = this.props;
    return (
      <div className="w-100">
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
          <PrivateRoute exact path={USER_PROFILE} component={ProfilePage} />
        </SafeSwitch>
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
User.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  previousUrl: PropTypes.string.isRequired,
};

const stateToProps = (state: any) => ({
  loggedIn: state.user.get('loggedIn'),
  previousUrl: state.router.location.previousUrl
});

export default connect(stateToProps)(User);
