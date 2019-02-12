import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { userLogout } from '../../actions/user';
import DropdownMenu from '../components/DropdownMenu';
import { USER_LOGIN, USER_PROFILE } from '../routes';

class LoginOrUserDropdownContainer extends Component {
  static renderLoginLink() {
    return (
      <Link className="nav-item" to={USER_LOGIN}>
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
        to: USER_PROFILE,
        display: 'Profile',
      },
      // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
      <a key="Logout" onClick={this.onLogoutClick} data-test-id="logout">
        Logout
      </a>,
    ];
    return (
      <DropdownMenu
        title="My Account"
        titleClassName="nav-item"
        dataTestId="my-account-dropdown"
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
