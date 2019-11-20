import React, { Component } from 'react';
import { Alert, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { WRAPPER_COL, LABEL_COL } from '../withFormItem';

class FieldInfoAlert extends Component {
  render() {
    const { description } = this.props;
    return (
      <Row className="mb1">
        <Col span={WRAPPER_COL.span} offset={LABEL_COL.span}>
          <Alert type="info" description={description} showIcon />
        </Col>
      </Row>
    );
  }
}

FieldInfoAlert.propTypes = {
  description: PropTypes.node.isRequired,
};

export default FieldInfoAlert;
