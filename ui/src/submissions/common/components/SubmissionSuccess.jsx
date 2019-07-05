import React, { Component } from 'react';
import { Row, Col, Alert } from 'antd';
import PropTypes from 'prop-types';

class SubmissionSuccess extends Component {
  render() {
    const { message } = this.props;
    return (
      <Row type="flex" justify="center">
        <Col className="mv3" span={14}>
          <Alert message={message} type="success" showIcon />
        </Col>
      </Row>
    );
  }
}

SubmissionSuccess.propTypes = {
  message: PropTypes.node,
};

SubmissionSuccess.defaultProps = {
  message: 'Successfully submitted, thank you for the submission!',
};

export default SubmissionSuccess;
