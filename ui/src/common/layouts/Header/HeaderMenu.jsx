import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { Set } from 'immutable';

import { SUBMISSIONS_AUTHOR, USER_LOGIN, SUBMISSIONS_JOB } from '../../routes';
import ExternalLink from '../../components/ExternalLink';
import LinkLikeButton from '../../components/LinkLikeButton';
import { isCataloger } from '../../authorization';

import './HeaderMenu.scss';

class HeaderMenu extends Component {
  render() {
    const { loggedIn, userRoles, onLogoutClick } = this.props;
    const isUserCataloger = isCataloger(userRoles);
    return (
      <Menu
        className="__HeaderMenu__"
        theme="dark"
        mode="horizontal"
        selectable={false}
      >
        <Menu.SubMenu title="Submit">
          <Menu.Item key="submit.author">
            <Link to={SUBMISSIONS_AUTHOR}>Author</Link>
          </Menu.Item>
          {isUserCataloger && (
            <Menu.Item key="submit.job">
              <Link to={SUBMISSIONS_JOB}>Job</Link>
            </Menu.Item>
          )}
          <Menu.Item key="submit.literature">
            <ExternalLink href="/literature/new">Literature</ExternalLink>
          </Menu.Item>
        </Menu.SubMenu>
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
        <Menu.Item title="Help">
          <ExternalLink href="//labs.inspirehep.net/help/knowledge-base/">Help</ExternalLink>
        </Menu.Item>
        <Menu.Item key="login-logout">
          {loggedIn ? (
            // TODO: create LoginLinkOrLogoutButtonContainer
            <LinkLikeButton onClick={onLogoutClick} dataTestId="logout">
              Logout
            </LinkLikeButton>
          ) : (
            <Link to={USER_LOGIN}>Login</Link>
          )}
        </Menu.Item>
      </Menu>
    );
  }
}

HeaderMenu.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
};

export default HeaderMenu;
