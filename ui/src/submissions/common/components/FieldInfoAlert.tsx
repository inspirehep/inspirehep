import React, { Component } from 'react';
import { Alert, Row, Col } from 'antd';
import { LABEL_COL, WRAPPER_COL } from '../withFormItem';

type Props = {
    description: React.ReactNode;
};

class FieldInfoAlert extends Component<Props> {

  render() {
    const { description } = this.props;

    return (
      <Row className="mb1">
        <Col
          {...{
            sm: { span: 24 },
            md: { span: WRAPPER_COL.md.span, offset: LABEL_COL.md.span },
          }}
        >
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <Alert type="info" description={description} showIcon />
        </Col>
      </Row>
    );
  }
}

export default FieldInfoAlert;
