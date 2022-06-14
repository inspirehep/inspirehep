import React, { Component } from 'react';
import { Row, Col, Alert } from 'antd';
import PropTypes from 'prop-types';

class SubmissionSuccess extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'message' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { message } = this.props;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Row type="flex" justify="center">
        <Col className="mv3" span={14}>
          <Alert message={message} type="success" showIcon />
        </Col>
      </Row>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SubmissionSuccess.propTypes = {
  message: PropTypes.node,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SubmissionSuccess.defaultProps = {
  message:
    'Successfully submitted, thank you! Your submission will be visible upon approval from the INSPIRE team.',
};

export default SubmissionSuccess;
