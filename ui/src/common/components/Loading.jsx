import React, { Component } from 'react';
import { Row, Col, Spin } from 'antd';

class Loading extends Component {
  render() {
    return (
      <Row className="w-100" type="flex" justify="center" align="middle">
        <Col>
          <div data-test-id="loading" className="tc pa4">
            <Spin tip="Loading ..." />
          </div>
        </Col>
      </Row>
    );
  }
}

export default Loading;
