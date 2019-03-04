import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { Set } from 'immutable';

import { userLogout } from '../../../actions/user';
import { SUBMISSIONS_AUTHOR, USER_LOGIN } from '../../routes';
import ExternalLink from '../../components/ExternalLink';
import LinkLikeButton from '../../components/LinkLikeButton';
import { isCataloger } from '../../authorization';

import './HeaderMenu.scss';

class HeaderMenu extends Component {
  constructor(props) {
    super(props);

    this.onLogoutClick = this.onLogoutClick.bind(this);
  }

  onLogoutClick() {
    const { dispatch } = this.props;
    dispatch(userLogout());
  }

  render() {
    const { loggedIn } = this.props;
    const { userRoles } = this.props;
    const isUserCataloger = isCataloger(userRoles);
    return (
      <Menu
        className="__HeaderMenu__"
        theme="dark"
        mode="horizontal"
        selectable={false}
      >
        <Menu.SubMenu title="Tools">
          {isUserCataloger && (
            <Menu.Item key="tools.holdingpen">
              <ExternalLink href="/holdingpen">Holdingpen</ExternalLink>
            </Menu.Item>
          )}
          {isUserCataloger && (
            <Menu.Item key="tools.authorlist">
              <ExternalLink href="/tools/authorlist">Author list</ExternalLink>
            </Menu.Item>
          )}
          <Menu.Item key="tools.refextract">
            <ExternalLink href="//inspirehep.net/textmining/">
              Reference extractor
            </ExternalLink>
          </Menu.Item>
          <Menu.Item key="tools.bibgen">
            <ExternalLink href="//inspirehep.net/info/hep/tools/bibliography_generate">
              Bibliography generator
            </ExternalLink>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu title="Submit">
          <Menu.Item key="submit.author">
            <Link to={SUBMISSIONS_AUTHOR}>Author</Link>
          </Menu.Item>
          <Menu.Item key="submit.literature">
            <ExternalLink href="/literature/new">Literature</ExternalLink>
          </Menu.Item>
        </Menu.SubMenu>
        {loggedIn ? (
          <Menu.SubMenu title="My account">
            <Menu.Item key="logout">
              <LinkLikeButton onClick={this.onLogoutClick}>
                Logout
              </LinkLikeButton>
            </Menu.Item>
          </Menu.SubMenu>
        ) : (
          <Menu.Item key="login">
            <Link to={USER_LOGIN}>Login</Link>
          </Menu.Item>
        )}
      </Menu>
    );
  }
}

HeaderMenu.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
};

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
