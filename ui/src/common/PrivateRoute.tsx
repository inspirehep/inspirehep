import React, { ComponentPropsWithoutRef } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { RootState } from '../types';

import RouteOrRedirect from './components/RouteOrRedirect';
import { isAuthorized } from './authorization';
import { ERROR_401, BACKOFFICE_LOGIN, USER_LOGIN } from './routes';

interface PrivateRouteProps extends ComponentPropsWithoutRef<any> {
  loggedIn: boolean;
  userRoles: List<string>;
  authorizedRoles?: List<string> | null;
  loggedInToBackoffice: boolean;
  component?: JSX.Element | string | any;
  backoffice?: boolean;
}

function PrivateRoute({
  backoffice = false,
  authorizedRoles = null,
  ...props
}: PrivateRouteProps) {
  if (props.loggedIn && authorizedRoles) {
    const isUserAuthorized = isAuthorized(props.userRoles, authorizedRoles);
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
      redirectTo={backoffice ? BACKOFFICE_LOGIN : USER_LOGIN}
      condition={props.loggedIn}
      component={props.component}
      {...props}
    />
  );
}

const stateToProps = (state: RootState) => ({
  loggedIn: state.user.get('loggedIn'),
  loggedInToBackoffice: state.backoffice.get('loggedIn'),
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(PrivateRoute);
