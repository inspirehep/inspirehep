import React from 'react';
import { Col, Row } from 'antd';
import classNames from 'classnames';

function AggregationBox({
  name,
  headerAction,
  children,
  className,
}: {
  name: string;
  headerAction: any;
  children: any;
  className?: string;
}) {
  return (
    <div className={classNames('w-100 br1', className)}>
      <Row justify="space-between">
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

AggregationBox.defaultProps = {
  headerAction: null,
  children: null,
};

export default AggregationBox;
