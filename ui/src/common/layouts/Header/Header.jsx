import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu, Row, Col } from 'antd';
import PropTypes from 'prop-types';

import SearchBoxContainer from './../../containers/SearchBoxContainer';
import './Header.scss';

const Header = props => (
  <Layout.Header className="__Header__">
    <Row type="flex" align="middle" gutter={16}>
      <Col span={4}>
        <Link to="/">INSPIRE</Link>
      </Col>
      <Col span={16}>
        {props.shouldDisplaySearchBox && <SearchBoxContainer />}
      </Col>
      <Col span={4}>
        <Menu className="menu" theme="dark" mode="horizontal">
          <Menu.Item>
            <Link to="/holdingpen/dashboard">Holdingpen</Link>
          </Menu.Item>
        </Menu>
      </Col>
    </Row>
  </Layout.Header>
);

Header.propTypes = {
  shouldDisplaySearchBox: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  shouldDisplaySearchBox: state.router.location.pathname !== '/',
});

export default connect(stateToProps)(Header);
