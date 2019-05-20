import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Set } from 'immutable';

import { isAuthorized } from '../authorization';

class Authorized extends Component {
  render() {
    const { userRoles, authorizedRoles, children } = this.props;
    const isUserAuthorized = isAuthorized(userRoles, authorizedRoles);

    if (isUserAuthorized) {
      return children;
    }

    return null;
  }
}

Authorized.propTypes = {
  authorizedRoles: PropTypes.instanceOf(Set).isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
  children: PropTypes.node.isRequired,
};

const stateToProps = state => ({
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(Authorized);
