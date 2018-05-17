import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Row, Col } from 'antd';

import SearchBoxContainer from './../../containers/SearchBoxContainer';
import './Header.scss';

const Header = () => (
  <Layout className="__Header__">
    <Layout.Header>
      <Row type="flex" align="middle" gutter={16}>
        <Col span={4}>
          <Link to="/literature">INSPIRE</Link>
        </Col>
        <Col span={16}>
          <SearchBoxContainer />
        </Col>
        <Col span={4}>
          <Menu className="menuItems" theme="dark" mode="horizontal">
            <Menu.Item>
              <Link to="/holdingpen/dashboard">Holdingpen</Link>
            </Menu.Item>
          </Menu>
        </Col>
      </Row>
    </Layout.Header>
  </Layout>
);

export default Header;
