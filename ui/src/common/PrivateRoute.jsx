import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Set } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';

class PrivateRoute extends Component {
  render() {
    const { loggedIn, userRoles, authorizedRoles, ...routeProps } = this.props;
    if (loggedIn && authorizedRoles) {
      const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);
      return (
        <RouteOrRedirect
          redirectTo="/errors/401"
          condition={isUserAuthorized}
          {...routeProps}
        />
      );
    }
    return (
      <RouteOrRedirect
        redirectTo="/user/login"
        condition={loggedIn}
        {...routeProps}
      />
    );
  }
}

PrivateRoute.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
  authorizedRoles: PropTypes.instanceOf(Set),
};

PrivateRoute.defaultProps = {
  authorizedRoles: null,
};

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(PrivateRoute);
