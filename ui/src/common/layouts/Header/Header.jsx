import React from 'react';
import { Layout, Row, Col } from 'antd';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import SearchBoxContainer from '../../containers/SearchBoxContainer';
import './Header.less';
import Logo from '../../components/Logo';
import HeaderMenuContainer from './HeaderMenuContainer';
import BetaRibbon from './BetaRibbon';
import CollectionsMenu from '../CollectionsMenu';
import Banners from './Banners';
import { getConfigFor } from '../../config';

function Header({ isHomePage, isSubmissionsPage, isBetaPage }) {
  const banners = getConfigFor('BANNERS', []);

  return (
    <div className="__Header__">
      <div className="sticky" data-test-id="sticky">
        <Banners />
        {isBetaPage && <BetaRibbon />}
        <Layout.Header className="header">
          <Row type="flex" align="middle" gutter={{ xs: 8, sm: 16 }}>
            <Col xs={{ span: 13, order: 1 }} sm={{ span: 6, order: 1 }} lg={5}>
              <Logo />
            </Col>
            <Col
              xs={{ span: 24, order: 3 }}
              sm={{ span: 14, order: 2 }}
              lg={12}
              xl={13}
              xxl={14}
            >
              {!isHomePage && !isSubmissionsPage && (
                <SearchBoxContainer className="search-box" />
              )}
            </Col>
            <Col
              xs={{ span: 11, order: 2 }}
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
      <div
        className={classNames('non-sticky', {
          mt5: banners.length === 0,
          mt6: banners.length > 0,
        })}
      >
        <CollectionsMenu />
      </div>
    </div>
  );
}

Header.propTypes = {
  isHomePage: PropTypes.bool.isRequired,
  isSubmissionsPage: PropTypes.bool.isRequired,
  isBetaPage: PropTypes.bool.isRequired,
};

export default Header;
