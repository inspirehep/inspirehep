import React, { ComponentPropsWithoutRef } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { List } from 'immutable';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, USER_LOGIN } from './routes';

interface PrivateRouteProps extends ComponentPropsWithoutRef<any> {
  loggedIn: boolean;
  userRoles: List<string>;
  authorizedRoles: List<string>;
  component?: JSX.Element | string | any;
}

function PrivateRoute(props: PrivateRouteProps) {
  if (props.loggedIn && props.authorizedRoles) {
    const isUserAuthorized = isAuthorized(props.userRoles, props.authorizedRoles);
    return (
      <RouteOrRedirect
        redirectTo={ERROR_401}
        condition={isUserAuthorized}
        component={props.component}
        {...props}
      />
    );
  }
  return (
    <RouteOrRedirect
      redirectTo={USER_LOGIN}
      condition={props.loggedIn}
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
