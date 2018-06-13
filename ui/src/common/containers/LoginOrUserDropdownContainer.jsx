import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { userLogout } from '../../actions/user';
import DropdownMenu from '../components/DropdownMenu';

class LoginOrUserDropdownContainer extends Component {
  static renderLoginLink() {
    return (
      <Link className="nav-item" to="/user/login">
        Login
      </Link>
    );
  }

  constructor(props) {
    super(props);

    this.onLogoutClick = this.onLogoutClick.bind(this);
  }

  onLogoutClick() {
    const { dispatch } = this.props;
    dispatch(userLogout());
  }

  renderUserDropdown() {
    const userActionItems = [
      {
        to: '/user/profile',
        display: 'Profile',
      },
      {
        onClick: this.onLogoutClick,
        display: 'Logout',
      },
    ];
    return (
      <DropdownMenu
        title="My Account"
        titleClassName="nav-item"
        items={userActionItems}
      />
    );
  }

  render() {
    const { loggedIn } = this.props;
    if (loggedIn) {
      return this.renderUserDropdown();
    }
    return LoginOrUserDropdownContainer.renderLoginLink();
  }
}

LoginOrUserDropdownContainer.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  LoginOrUserDropdownContainer
);
