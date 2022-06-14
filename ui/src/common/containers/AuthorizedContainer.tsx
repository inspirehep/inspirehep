import { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { List } from 'immutable';

import { isAuthorized } from '../authorization';

type AuthorizedProps = {
    authorizedRoles: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    userRoles: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

class Authorized extends Component<AuthorizedProps> {

  render() {
    const { userRoles, authorizedRoles, children } = this.props;
    const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);

    if (isUserAuthorized) {
      return children;
    }

    return null;
  }
}

const stateToProps = (state: $TSFixMe) => ({
  userRoles: state.user.getIn(['data', 'roles'])
});

export default connect(stateToProps)(Authorized);
