import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, Tooltip, Button } from 'antd';

import {
  SUBMISSIONS_AUTHOR,
  USER_LOGIN,
  SUBMISSIONS_JOB,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_CONFERENCE,
  SUBMISSIONS_SEMINAR,
  SUBMISSIONS_INSTITUTION,
  SUBMISSIONS_EXPERIMENT,
} from '../../routes';
import ExternalLink from '../../components/ExternalLink.tsx';
import LinkLikeButton from '../../components/LinkLikeButton';

import './HeaderMenu.scss';
import { PAPER_SEARCH_URL, HELP_BLOG_URL } from '../../constants';
import DisplayGuideButtonContainer from '../../containers/DisplayGuideButtonContainer';
import { CLAIMING_DISABLED_INFO } from '../../../authors/components/AssignNoProfileAction';

class HeaderMenu extends Component {
  render() {
    const { loggedIn, onLogoutClick, isCatalogerLoggedIn, profileControlNumber } = this.props;
    const USER_PROFILE_URL = `/authors/${profileControlNumber}`;

    return (
      <Menu
        className="__HeaderMenu__"
        theme="dark"
        mode="horizontal"
        selectable={false}
      >
        <Menu.SubMenu
          key="help"
          title="Help"
          popupClassName="header-submenu ant-menu-dark"
        >
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
          popupClassName="header-submenu ant-menu-dark"
        >
          <Menu.Item key="submit.literature">
            <Link to={SUBMISSIONS_LITERATURE}>Literature</Link>
          </Menu.Item>
          <Menu.Item key="submit.author">
            <Link to={SUBMISSIONS_AUTHOR}>Author</Link>
          </Menu.Item>
          <Menu.Item key="submit.job">
            <Link to={SUBMISSIONS_JOB}>Job</Link>
          </Menu.Item>
          <Menu.Item key="submit.seminar">
            <Link to={SUBMISSIONS_SEMINAR}>Seminar</Link>
          </Menu.Item>
          <Menu.Item key="submit.conference">
            <Link to={SUBMISSIONS_CONFERENCE}>Conference</Link>
          </Menu.Item>
          {isCatalogerLoggedIn && (
            <Menu.Item key="submit.institution">
              <Link to={SUBMISSIONS_INSTITUTION}>Institution</Link>
            </Menu.Item>
          )}
          {isCatalogerLoggedIn && (
            <Menu.Item key="submit.experiment">
              <Link to={SUBMISSIONS_EXPERIMENT}>Experiment</Link>
            </Menu.Item>
          )}
        </Menu.SubMenu>
        {loggedIn ? (
          <Menu.SubMenu
            key="account"
            title="Account"
            popupClassName="header-submenu ant-menu-dark"
            data-test-id="account"
          >
            <Menu.Item key="my-profile">
              {profileControlNumber ? (
                <Link to={USER_PROFILE_URL}>My profile</Link>
              ) : (
                <Tooltip title={CLAIMING_DISABLED_INFO}>
                  <Button ghost disabled>My profile</Button>
                </Tooltip>
              )}
            </Menu.Item>
            <Menu.Item key="logout">
              <LinkLikeButton onClick={onLogoutClick} dataTestId="logout">
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
  onLogoutClick: PropTypes.func.isRequired,
  isCatalogerLoggedIn: PropTypes.bool.isRequired,
  profileControlNumber: PropTypes.string,
};

export default HeaderMenu;
