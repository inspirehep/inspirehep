import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, USER_LOGIN } from './routes';

function PrivateRoute({
  loggedIn,
  userRoles,
  authorizedRoles,
  component,
  props
}: {
  loggedIn: boolean;
  userRoles: List<string>;
  authorizedRoles: List<string>;
  props: any,
  component?: JSX.Element | string;
}) {
  if (loggedIn && authorizedRoles) {
    const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);
    return (
      <RouteOrRedirect
        redirectTo={ERROR_401}
        condition={isUserAuthorized}
        component={component}
        {...props}
      />
    );
  }
  return (
    <RouteOrRedirect
      redirectTo={USER_LOGIN}
      condition={loggedIn}
      component={component}
      {...props}
    />
  );
}

PrivateRoute.defaultProps = {
  authorizedRoles: null,
};

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(PrivateRoute);
