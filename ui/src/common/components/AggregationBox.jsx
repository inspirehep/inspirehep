import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';
import classNames from 'classnames';

class AggregationBox extends Component {
  render() {
    const { name, headerAction, children, className } = this.props;
    return (
      <div className={classNames('w-100 br1', className)}>
        <Row type="flex" justify="space-between">
          <Col flex="auto">
            <h3 className="pb1">{name}</h3>
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

AggregationBox.propTypes = {
  headerAction: PropTypes.node,
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

AggregationBox.defaultProps = {
  headerAction: null,
  children: null,
};

export default AggregationBox;
