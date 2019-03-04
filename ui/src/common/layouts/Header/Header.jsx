import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col } from 'antd';
import PropTypes from 'prop-types';

import SearchBoxContainer from '../../containers/SearchBoxContainer';
import './Header.scss';
import Logo from '../../components/Logo';
import {
  SUBMISSIONS,
  HOME,
} from '../../routes';
import Banner from './Banner';
import HeaderMenu from './HeaderMenu';


class Header extends Component {
  render() {
    const { isHomePage, isSubmissionsPage } = this.props;
    return (
      <div className="__Header__">
        <Banner />
        <Layout.Header className="header">
          <Row type="flex" align="middle" gutter={{ xs: 8, md: 16}}>
            <Col xs={0} lg={4} xl={5}>
              <Logo />
            </Col>
            <Col xs={18} lg={12} xl={13} xxl={14}>
              {!isHomePage && !isSubmissionsPage && <SearchBoxContainer />}
            </Col>
            <Col xs={6} lg={8} xl={6} xxl={5}>
              <HeaderMenu />
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
};

const stateToProps = state => ({
  isHomePage: state.router.location.pathname === HOME,
  isSubmissionsPage: String(state.router.location.pathname).startsWith(SUBMISSIONS),
});

export default connect(stateToProps)(Header);
