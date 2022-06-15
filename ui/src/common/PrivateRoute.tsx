import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, USER_LOGIN } from './routes';

function PrivateRoute(props: any) {
    const { loggedIn, userRoles, authorizedRoles, ...routeProps } = props;
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

PrivateRoute.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  userRoles: PropTypes.instanceOf(List).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  authorizedRoles: PropTypes.instanceOf(List),
};

PrivateRoute.defaultProps = {
  authorizedRoles: null,
};

const stateToProps = (state: any) => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles'])
});

export default connect(stateToProps)(PrivateRoute);
