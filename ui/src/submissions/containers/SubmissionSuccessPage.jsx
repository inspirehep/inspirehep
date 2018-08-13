import React, { Component } from 'react';
import { Row, Col } from 'antd';

class SubmissionSuccessPage extends Component {
  render() {
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <div className="mb3">Submission Success</div>
        </Col>
      </Row>
    );
  }
}

export default SubmissionSuccessPage;
