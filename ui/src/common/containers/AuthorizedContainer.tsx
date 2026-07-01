import { connect } from 'react-redux';
import { List } from 'immutable';
import { RootState } from '../../types';

import { isAuthorized } from '../authorization';

const Authorized = ({
  userRoles,
  authorizedRoles,
  children,
}: {
  userRoles: List<string>;
  authorizedRoles: List<string>;
  children: any;
}) => {
  const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);

  if (isUserAuthorized) {
    return children;
  }

  return null;
};

const stateToProps = (state: RootState) => ({
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(Authorized);
