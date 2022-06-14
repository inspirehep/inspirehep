import React, { Component } from 'react';
import { Row, Col, Alert } from 'antd';

type OwnProps = {
    message?: React.ReactNode;
};

type Props = OwnProps & typeof SubmissionSuccess.defaultProps;

class SubmissionSuccess extends Component<Props> {

static defaultProps = {
    message: 'Successfully submitted, thank you! Your submission will be visible upon approval from the INSPIRE team.',
};

  render() {
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

export default SubmissionSuccess;
