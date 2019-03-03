import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { Set } from 'immutable';

import SearchBoxContainer from '../../containers/SearchBoxContainer';
import DropdownMenu from '../../components/DropdownMenu';
import './Header.scss';
import LoginOrUserDropdownContainer from '../../containers/LoginOrUserDropdownContainer';
import { isCataloger } from '../../authorization';
import Logo from '../../components/Logo';
import {
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS,
  HOME,
  // SUBMISSIONS_LITERATURE,
} from '../../routes';
import Banner from './Banner';


const UNAUTHORIZED_TOOL_LINKS = [
  {
    href: '//inspirehep.net/textmining/',
    display: 'Reference extractor',
  },
  {
    href: '//inspirehep.net/info/hep/tools/bibliography_generate',
    display: 'Bibliography generator',
  },
];

const ALL_TOOL_LINKS = [
  {
    href: '/holdingpen',
    display: 'Holdingpen',
  },
  {
    href: '/tools/authorlist',
    display: 'Author list',
  },
  ...UNAUTHORIZED_TOOL_LINKS,
];

const SUBMISSION_LINKS = [
  {
    to: SUBMISSIONS_AUTHOR,
    display: 'Author',
  },
  /** TODO: uncomment when `Literature Submissions` function
  {
    to: SUBMISSIONS_LITERATURE,
    display: 'Literature',
  },
  */
];

class Header extends Component {
  getToolLinksForUser() {
    const { userRoles } = this.props;
    return isCataloger(userRoles) ? ALL_TOOL_LINKS : UNAUTHORIZED_TOOL_LINKS;
  }

  render() {
    const { isHomePage, isSubmissionsPage } = this.props;
    return (
      <div className="__Header__">
        <Banner />
        <Layout.Header className="header">
          <Row type="flex" align="middle" gutter={16}>
            <Col xs={0} lg={4} xl={5}>
              <Logo />
            </Col>
            <Col xs={24} lg={12} xl={13} xxl={14}>
              {!isHomePage && !isSubmissionsPage && <SearchBoxContainer />}
            </Col>
            <Col xs={0} lg={8} xl={6} xxl={5}>
              <Row type="flex" justify="end">
                <Col className="nav-item-container">
                  <DropdownMenu
                    title="Tools"
                    titleClassName="nav-item"
                    items={this.getToolLinksForUser()}
                  />
                </Col>
                <Col className="nav-item-container">
                  <DropdownMenu
                    title="Submit"
                    titleClassName="nav-item"
                    items={SUBMISSION_LINKS}
                  />
                </Col>
                <Col className="nav-item-container">
                  <LoginOrUserDropdownContainer />
                </Col>
              </Row>
            </Col>
          </Row>
        </Layout.Header>
      </div>
    );
  }
}

Header.propTypes = {
  isHomePage: PropTypes.bool.isRequired,
  isSubmissionsPage: PropTypes.bool.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
};

const stateToProps = state => ({
  isHomePage: state.router.location.pathname === HOME,
  isSubmissionsPage: String(state.router.location.pathname).startsWith(SUBMISSIONS),
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(Header);
