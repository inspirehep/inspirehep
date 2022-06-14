import React, { Component } from 'react';
import { Row, Col } from 'antd';

type OwnProps = {
    detail?: React.ReactNode;
    message: string;
    imageSrc: React.ReactNode;
};

type Props = OwnProps & typeof ErrorPage.defaultProps;

class ErrorPage extends Component<Props> {

static defaultProps = {
    detail: null,
};

  render() {
    const { detail, message, imageSrc } = this.props;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Col className="mt3 mb3" span={14} justify="center" align="middle">
        <Row>
          <Col span={24}>
            <h3 className="f2 sm-f3">{message}</h3>
          </Col>
        </Row>
        {detail && (
          <Row>
            <Col span={24}>
              <h3 className="f3 normal sm-f4">{detail}</h3>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={24}>
            {/* @ts-expect-error ts-migrate(2322) FIXME: Type 'ReactNode' is not assignable to type 'string... Remove this comment to see the full error message */}
            <img src={imageSrc} alt="ERROR" />
          </Col>
        </Row>
      </Col>
    );
  }
}

export default ErrorPage;
