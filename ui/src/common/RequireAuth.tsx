import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { Navigate } from 'react-router-dom';
import { RootState } from '../types';

import { isAuthorized } from './authorization';
import { ERROR_401, BACKOFFICE_LOGIN, USER_LOGIN } from './routes';
import Loading from './components/Loading';

interface RequireAuthProps extends ComponentPropsWithoutRef<any> {
  loggedIn: boolean;
  isFetchingLoggedInUser: boolean;
  userRoles: List<string>;
  authorizedRoles?: List<string> | null;
  children: ReactNode;
  backoffice?: boolean;
}

function RequireAuth({
  backoffice = false,
  authorizedRoles = null,
  ...props
}: RequireAuthProps) {
  if (props.isFetchingLoggedInUser) {
    return <Loading />;
  }

  if (props.loggedIn && authorizedRoles) {
    const isUserAuthorized = isAuthorized(props.userRoles, authorizedRoles);
    return isUserAuthorized ? (
      props.children
    ) : (
      <Navigate to={ERROR_401} replace />
    );
  }

  return props.loggedIn ? (
    props.children
  ) : (
    <Navigate to={backoffice ? BACKOFFICE_LOGIN : USER_LOGIN} replace />
  );
}

const stateToProps = (state: RootState) => ({
  loggedIn: state.user.get('loggedIn'),
  isFetchingLoggedInUser: state.user.get('isFetchingLoggedInUser'),
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(RequireAuth);
