// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, USER_LOGIN } from './routes';

type OwnPrivateRouteProps = {
    loggedIn: boolean;
    userRoles: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    authorizedRoles?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type PrivateRouteProps = OwnPrivateRouteProps & typeof PrivateRoute.defaultProps;

class PrivateRoute extends Component<PrivateRouteProps> {

static defaultProps = {
    authorizedRoles: null,
};

  render() {
    const { loggedIn, userRoles, authorizedRoles, ...routeProps } = this.props;
    if (loggedIn && authorizedRoles) {
      const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);
      return (
        <RouteOrRedirect
          redirectTo={ERROR_401}
          condition={isUserAuthorized}
          {...routeProps}
        />
      );
    }
    return (
      <RouteOrRedirect
        redirectTo={USER_LOGIN}
        condition={loggedIn}
        {...routeProps}
      />
    );
  }
}

const stateToProps = (state: $TSFixMe) => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles'])
});

export default connect(stateToProps)(PrivateRoute);
