import React, { ComponentPropsWithoutRef } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, BACKOFFICE_LOGIN, USER_LOGIN } from './routes';

interface PrivateRouteProps extends ComponentPropsWithoutRef<any> {
  loggedIn: boolean;
  userRoles: List<string>;
  authorizedRoles: List<string>;
  component?: JSX.Element | string | any;
  backoffice?: boolean;
  loggedInToBackoffice?: boolean;
}

function PrivateRoute({ ...props }: PrivateRouteProps) {
  if (props.loggedIn && props.authorizedRoles) {
    const isUserAuthorized = isAuthorized(
      props.userRoles,
      props.authorizedRoles
    );
    return (
      <RouteOrRedirect
        redirectTo={ERROR_401}
        condition={isUserAuthorized}
        component={props.component}
        {...props}
      />
    );
  }

  const resolveLoggedIn = props.backoffice
    ? props.loggedInToBackoffice && props.loggedIn
    : props.loggedIn;

  return (
    <RouteOrRedirect
      redirectTo={props.backoffice ? BACKOFFICE_LOGIN : USER_LOGIN}
      condition={resolveLoggedIn || false}
      component={props.component}
      {...props}
    />
  );
}

PrivateRoute.defaultProps = {
  backoffice: false,
  authorizedRoles: null,
};

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.user.get('loggedIn'),
  loggedInToBackoffice: state.backoffice.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(PrivateRoute);
