import React, { ComponentType } from 'react';
import { Row, Col, Spin } from 'antd';
import { LoadingComponentProps } from 'react-loadable';

const Loading: ComponentType<LoadingComponentProps> = () => (
  <Row className="w-100" justify="center" align="middle">
    <Col>
      <div data-test-id="loading" className="tc pa4">
        <Spin tip="Loading ..." />
      </div>
    </Col>
  </Row>
);

export default Loading;
