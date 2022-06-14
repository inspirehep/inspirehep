import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, USER_LOGIN } from './routes';

class PrivateRoute extends Component {
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

PrivateRoute.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  userRoles: PropTypes.instanceOf(List).isRequired,
  authorizedRoles: PropTypes.instanceOf(List),
};

PrivateRoute.defaultProps = {
  authorizedRoles: null,
};

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(PrivateRoute);
