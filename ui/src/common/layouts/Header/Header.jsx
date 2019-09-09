import React, { Component } from 'react';
import { Layout, Row, Col } from 'antd';
import PropTypes from 'prop-types';

import SearchBoxContainer from '../../containers/SearchBoxContainer';
import './Header.scss';
import Logo from '../../components/Logo';
import Banner from './Banner';
import HeaderMenuContainer from './HeaderMenuContainer';
import BetaRibbon from './BetaRibbon';

class Header extends Component {
  render() {
    const { isHomePage, isSubmissionsPage, isBetaPage } = this.props;
    return (
      <div className="__Header__">
        {isBetaPage && <Banner />}
        {isBetaPage && <BetaRibbon />}
        <Layout.Header className="header">
          <Row type="flex" align="middle" gutter={{ xs: 8, sm: 16 }}>
            <Col xs={{ span: 12, order: 1 }} sm={{ span: 6, order: 1 }} lg={5}>
              <Logo />
            </Col>
            <Col
              xs={{ span: 24, order: 3 }}
              sm={{ span: 14, order: 2 }}
              lg={12}
              xl={13}
              xxl={14}
            >
              {!isHomePage && !isSubmissionsPage && <SearchBoxContainer />}
            </Col>
            <Col
              xs={{ span: 12, order: 2 }}
              sm={{ span: 4, order: 3 }}
              lg={7}
              xl={6}
              xxl={5}
            >
              <HeaderMenuContainer />
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
  isBetaPage: PropTypes.bool.isRequired,
};

export default Header;
