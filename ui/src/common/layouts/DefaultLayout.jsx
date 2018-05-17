import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Row, Col } from 'antd';

import Header from './../partials/Header';

const DefaultLayout = ({sider, content}) => (
  <Row type="flex">
    <Col span={6}>
      {sider}
    </Col>
    <Col span={17}>
      {content}
    </Col>
  </Row>
);

DefaultLayout.propTypes = {
  sider: PropTypes.func.isRequired,
  content: PropTypes.func.isRequired,
};

export default DefaultLayout;
