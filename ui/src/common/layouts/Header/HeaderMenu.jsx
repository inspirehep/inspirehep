import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { List } from 'immutable';

import {
  SUBMISSIONS_AUTHOR,
  USER_LOGIN,
  SUBMISSIONS_JOB,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_CONFERENCE,
} from '../../routes';
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
        <Menu.SubMenu key="submit" title="Submit">
          <Menu.Item key="submit.author">
            <Link to={SUBMISSIONS_AUTHOR}>Author</Link>
          </Menu.Item>
          <Menu.Item key="submit.job">
            <Link to={SUBMISSIONS_JOB}>Job</Link>
          </Menu.Item>
          <Menu.Item key="submit.literature">
            <Link to={SUBMISSIONS_LITERATURE}>Literature</Link>
          </Menu.Item>
          <Menu.Item key="submit.conference">
            <Link to={SUBMISSIONS_CONFERENCE}>Conference</Link>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="tools" title="Tools">
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
        <Menu.Item key="help" title="Help">
          <ExternalLink href="//labs.inspirehep.net/help/knowledge-base/">
            Help
          </ExternalLink>
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
  userRoles: PropTypes.instanceOf(List).isRequired,
};

export default HeaderMenu;
