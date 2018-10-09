import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { Set } from 'immutable';

import SearchBoxContainer from './../../containers/SearchBoxContainer';
import DropdownMenu from '../../components/DropdownMenu';
import './Header.scss';
import logo from './logo.svg';
import LoginOrUserDropdownContainer from '../../containers/LoginOrUserDropdownContainer';
import { isCataloger } from '../../authorization';
import { doSetsHaveCommonItem } from '../../utils';
import Logo from '../../../common/containers/LogoContainer';

const ONLY_SUPER_USERS_AND_CATALOGERS_AND_BETAUSERS = Set([
  'superuser',
  'cataloger',
  'betauser',
]);

const UNAUTHORIZED_TOOL_LINKS = [
  {
    href: '//inspirehep.net/textmining/',
    display: 'Reference extractor',
  },
  {
    href: '/tools/authorlist',
    display: 'Author list',
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
  ...UNAUTHORIZED_TOOL_LINKS,
];

class Header extends Component {
  getToolLinksForUser() {
    const { userRoles } = this.props;

    if (isCataloger(userRoles)) {
      return ALL_TOOL_LINKS;
    }
    return UNAUTHORIZED_TOOL_LINKS;
  }

  displaySearchBox() {
    const { shouldDisplaySearchBox, userRoles } = this.props;
    return (
      shouldDisplaySearchBox &&
      doSetsHaveCommonItem(
        userRoles,
        ONLY_SUPER_USERS_AND_CATALOGERS_AND_BETAUSERS
      )
    );
  }

  render() {
    return (
      <Layout.Header className="__Header__">
        <Row type="flex" align="middle" gutter={16}>
          <Col lg={4} xl={5}>
            <Logo
              src={logo}
              authorizedRoles={ONLY_SUPER_USERS_AND_CATALOGERS_AND_BETAUSERS}
            />
          </Col>
          <Col lg={12} xl={13} xxl={14}>
            {this.displaySearchBox() && <SearchBoxContainer />}
          </Col>
          <Col lg={8} xl={6} xxl={5}>
            <Row type="flex" justify="end">
              <Col className="nav-item-container">
                <DropdownMenu
                  title="Tools"
                  titleClassName="nav-item"
                  items={this.getToolLinksForUser()}
                />
              </Col>
              <Col className="nav-item-container">
                <Link className="nav-item" to="/submissions/authors">
                  Submit
                </Link>
              </Col>
              <Col className="nav-item-container">
                <LoginOrUserDropdownContainer />
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout.Header>
    );
  }
}
Header.propTypes = {
  shouldDisplaySearchBox: PropTypes.bool.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
};

const stateToProps = state => ({
  shouldDisplaySearchBox: state.router.location.pathname !== '/',
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(Header);
