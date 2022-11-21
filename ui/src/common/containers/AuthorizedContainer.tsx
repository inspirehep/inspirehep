import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { List } from 'immutable';

import { isAuthorized } from '../authorization';

    const Authorized = ({ userRoles, authorizedRoles, children }: { userRoles: List<string>, authorizedRoles: List<string>, children: any }) => {
    const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);

    if (isUserAuthorized) {
      return children;
    }

    return null;
  }

const stateToProps = (state: RootStateOrAny) => ({
  userRoles: state.user.getIn(['data', 'roles']),
});

export default connect(stateToProps)(Authorized);
