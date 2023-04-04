import React from 'react';
import { Row, Col, Spin } from 'antd';

const Loading = () => (
  <Row className="w-100" justify="center" align="middle">
    <Col>
      <div data-test-id="loading" className="tc pa4">
        <Spin tip="Loading ..." />
      </div>
    </Col>
  </Row>
);

export default Loading;
