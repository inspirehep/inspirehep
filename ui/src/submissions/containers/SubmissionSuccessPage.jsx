import React, { Component } from 'react';
import { Row, Col, Alert } from 'antd';

class SubmissionSuccessPage extends Component {
  render() {
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <Alert
            message="Successfully submitted, thanks you for the submission!"
            type="success"
            showIcon
          />
        </Col>
      </Row>
    );
  }
}

export default SubmissionSuccessPage;
