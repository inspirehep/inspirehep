import React, { Component } from 'react';
import { Col, Row } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';

type OwnProps = {
    headerAction?: React.ReactNode;
    name: string;
    className?: string;
};

type Props = OwnProps & typeof AggregationBox.defaultProps;

class AggregationBox extends Component<Props> {

static defaultProps = {
    headerAction: null,
    children: null,
};

  render() {
    const { name, headerAction, children, className } = this.props;
    return (
      <div className={classNames('w-100 br1', className)}>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <Row type="flex" justify="space-between">
          <Col flex="auto">
            <h3 className="pb1 fw4">{name}</h3>
          </Col>
          <Col>{headerAction}</Col>
        </Row>
        <Row className="w-100">
          <Col flex="auto">{children}</Col>
        </Row>
      </div>
    );
  }
}

export default AggregationBox;
