import React, { Component } from 'react';
import { Alert, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { LABEL_COL, WRAPPER_COL } from '../withFormItem';

class FieldInfoAlert extends Component {
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
