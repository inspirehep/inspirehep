import { Component } from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { List } from 'immutable';

import { isAuthorized } from '../authorization';

class Authorized extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type 'Reado... Remove this comment to see the full error message
    const { userRoles, authorizedRoles, children } = this.props;
    const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);

    if (isUserAuthorized) {
      return children;
    }

    return null;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Authorized.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  authorizedRoles: PropTypes.instanceOf(List).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  userRoles: PropTypes.instanceOf(List).isRequired,
  children: PropTypes.node.isRequired,
};

const stateToProps = (state: any) => ({
  userRoles: state.user.getIn(['data', 'roles'])
});

export default connect(stateToProps)(Authorized);
