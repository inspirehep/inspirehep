import React, { Component } from 'react';
import { Row, Col, Spin } from 'antd';

class Loading extends Component {
  render() {
    return (
      <Row type="flex" justify="middle" align="middle">
        <Col span={24}>
          <div className="tc">
            <Spin tip="Loading ..." />
          </div>
        </Col>
      </Row>
    );
  }
}

export default Loading;
