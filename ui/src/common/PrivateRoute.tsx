// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, USER_LOGIN } from './routes';

class PrivateRoute extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loggedIn' does not exist on type 'Readon... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
PrivateRoute.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  userRoles: PropTypes.instanceOf(List).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  authorizedRoles: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
PrivateRoute.defaultProps = {
  authorizedRoles: null,
};

const stateToProps = (state: any) => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles'])
});

export default connect(stateToProps)(PrivateRoute);
