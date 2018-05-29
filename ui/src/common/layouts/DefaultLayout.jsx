import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

const DefaultLayout = ({ sider, content }) => (
  <Row type="flex">
    <Col span={6}>{sider}</Col>
    <Col span={17}>{content}</Col>
  </Row>
);

DefaultLayout.propTypes = {
  sider: PropTypes.func.isRequired,
  content: PropTypes.func.isRequired,
};

export default DefaultLayout;
