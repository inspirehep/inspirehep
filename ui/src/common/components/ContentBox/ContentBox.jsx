import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'antd';

import './ContentBox.scss';

class ContentBox extends Component {
  render() {
    const { title, leftActions, rightActions, loading } = this.props;

    return (
      <div className="__ContentBox__">
        <Card title={title} loading={loading}>
          <div className="pa3">{this.props.children}</div>
          <Row type="flex" justify="space-between">
            <Col>{leftActions}</Col>
            <Col>{rightActions}</Col>
          </Row>
        </Card>
      </div>
    );
  }
}

ContentBox.propTypes = {
  leftActions: PropTypes.node,
  rightActions: PropTypes.node,
  children: PropTypes.node,
  title: PropTypes.string,
  loading: PropTypes.bool,
};

ContentBox.defaultProps = {
  leftActions: null,
  rightActions: null,
  children: null,
  title: null,
  loading: false,
};

export default ContentBox;
