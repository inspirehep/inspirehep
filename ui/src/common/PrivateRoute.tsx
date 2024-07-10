import React, { ComponentPropsWithoutRef } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, HOLDINGPEN_LOGIN_NEW, USER_LOGIN } from './routes';

interface PrivateRouteProps extends ComponentPropsWithoutRef<any> {
  loggedIn: boolean;
  userRoles: List<string>;
  authorizedRoles: List<string>;
  component?: JSX.Element | string | any;
  isHoldinpen?: boolean;
  loggedInToHoldinpen?: boolean;
}

function PrivateRoute({
  isHoldinpen = false,
  loggedInToHoldinpen = false,
  ...props
}: PrivateRouteProps) {
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

  const resolveLoggedIn = props.isHoldinpen
    ? props.loggedInToHoldinpen && props.loggedIn
    : props.loggedIn;

  return (
    <RouteOrRedirect
      redirectTo={props.isHoldingpen ? HOLDINGPEN_LOGIN_NEW : USER_LOGIN}
      condition={resolveLoggedIn}
      component={props.component}
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
