import React, { Component } from 'react';
import { Row, Col, Card } from 'antd';

import './ContentBox.scss';

type OwnProps = {
    leftActions?: React.ReactNode;
    rightActions?: React.ReactNode;
    title?: string;
    subTitle?: string;
    loading?: boolean;
    className?: string;
};

type Props = OwnProps & typeof ContentBox.defaultProps;

class ContentBox extends Component<Props> {

static defaultProps = {
    leftActions: null,
    rightActions: null,
    children: null,
    title: null,
    subTitle: null,
    loading: false,
    className: '',
};

  render() {
    const {
      title,
      leftActions,
      rightActions,
      loading,
      children,
      subTitle,
      className,
    } = this.props;

    return (
      children && (
        <div className={`__ContentBox__ h-100 ${className}`}>
          <Card className="h-100" title={title} loading={loading}>
            <div className="pa2">
              {subTitle && <h3 className="pb1">{subTitle}</h3>}
              <div>{children}</div>
            </div>
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
            <Row className="actions ph2" type="flex" justify="space-between">
              <Col>{leftActions}</Col>
              <Col>{rightActions}</Col>
            </Row>
          </Card>
        </div>
      )
    );
  }
}

export default ContentBox;
