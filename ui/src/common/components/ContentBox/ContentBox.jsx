import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'antd';

import './ContentBox.scss';

class ContentBox extends Component {
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

ContentBox.propTypes = {
  leftActions: PropTypes.node,
  rightActions: PropTypes.node,
  children: PropTypes.node,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

ContentBox.defaultProps = {
  leftActions: null,
  rightActions: null,
  children: null,
  title: null,
  subTitle: null,
  loading: false,
  className: '',
};

export default ContentBox;
