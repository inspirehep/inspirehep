import React from 'react';
import { Layout, Row, Col } from 'antd';
import useResizeObserver from 'use-resize-observer';
import classNames from 'classnames';

import SearchBoxContainer from '../../containers/SearchBoxContainer';
import './Header.less';
import { Logo, LogoBackoffice } from '../../components/Logo';
import HeaderMenuContainer from './HeaderMenuContainer';
import BetaRibbon from './BetaRibbon';
import CollectionsMenu from '../CollectionsMenu';
import Banners from './Banners';

function Header({
  isHomePage,
  isSubmissionsPage,
  isBackofficePage,
  isBetaPage,
}: {
  isHomePage: boolean;
  isSubmissionsPage: boolean;
  isBackofficePage: boolean;
  isBetaPage: boolean;
}) {
  const [stickyContainerRef, , stickyContainerHeight] = useResizeObserver();

  return (
    <div className={classNames('__Header__', { backoffice: isBackofficePage })}>
      <div ref={stickyContainerRef} className="sticky" data-test-id="sticky">
        <Banners />
        {isBetaPage && <BetaRibbon />}
        <Layout.Header className="header">
          <Row align="middle" gutter={{ xs: 8, sm: 16 }}>
            <Col xs={{ span: 13, order: 1 }} sm={{ span: 6, order: 1 }} lg={5}>
              {isBackofficePage ? <LogoBackoffice /> : <Logo />}
            </Col>
            <Col
              xs={{ span: 24, order: 3 }}
              sm={{ span: 14, order: 2 }}
              lg={12}
              xl={13}
              xxl={14}
            >
              {!isHomePage && !isSubmissionsPage && !isBackofficePage && (
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
      <div className="non-sticky" style={{ marginTop: stickyContainerHeight }}>
        {isBackofficePage ? (
          <div className="fake-collections-menu" />
        ) : (
          <CollectionsMenu />
        )}
      </div>
    </div>
  );
}

export default Header;
