import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import {
  SUBMISSIONS_AUTHOR,
  USER_LOGIN,
  SUBMISSIONS_JOB,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_CONFERENCE,
  SUBMISSIONS_SEMINAR,
} from '../../routes';
import ExternalLink from '../../components/ExternalLink';
import LinkLikeButton from '../../components/LinkLikeButton';

import './HeaderMenu.scss';
import { PAPER_SEARCH_URL, HELP_BLOG_URL } from '../../constants';
import DisplayGuideButtonContainer from '../../containers/DisplayGuideButtonContainer';

class HeaderMenu extends Component {
  render() {
    const { loggedIn, onLogoutClick } = this.props;
    return (
      <Menu
        className="__HeaderMenu__"
        theme="dark"
        mode="horizontal"
        selectable={false}
      >
        <Menu.SubMenu key="help" title="Help" popupClassName="header-submenu">
          <Menu.Item key="help.search-tips">
            <ExternalLink href={PAPER_SEARCH_URL}>Search Tips</ExternalLink>
          </Menu.Item>
          <Menu.Item key="help.tour">
            <DisplayGuideButtonContainer>
              Take the tour
            </DisplayGuideButtonContainer>
          </Menu.Item>
          <Menu.Item key="help.help-center">
            <ExternalLink href={HELP_BLOG_URL}>Help Center</ExternalLink>
          </Menu.Item>
        </Menu.SubMenu>

        <Menu.SubMenu
          key="submit"
          title="Submit"
          popupClassName="header-submenu"
        >
          <Menu.Item key="submit.author">
            <Link to={SUBMISSIONS_AUTHOR}>Author</Link>
          </Menu.Item>
          <Menu.Item key="submit.job">
            <Link to={SUBMISSIONS_JOB}>Job</Link>
          </Menu.Item>
          <Menu.Item key="submit.seminar">
            <Link to={SUBMISSIONS_SEMINAR}>Seminars</Link>
          </Menu.Item>
          <Menu.Item key="submit.literature">
            <Link to={SUBMISSIONS_LITERATURE}>Literature</Link>
          </Menu.Item>
          <Menu.Item key="submit.conference">
            <Link to={SUBMISSIONS_CONFERENCE}>Conference</Link>
          </Menu.Item>
        </Menu.SubMenu>
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
};

export default HeaderMenu;
