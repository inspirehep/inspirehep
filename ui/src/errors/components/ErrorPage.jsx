import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

class ErrorPage extends Component {
  render() {
    const { statusCode, message, imageSrc } = this.props;
    return (
      <Col className="mt3 mb3" span={14} justify="center" align="middle">
        <Row>
          <Col>
            <h3 className="f1">{statusCode}</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3 className="f2">{message}</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <img src={imageSrc} alt="ERROR" />
          </Col>
        </Row>
      </Col>
    );
  }
}

export default ErrorPage;

ErrorPage.propTypes = {
  statusCode: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  imageSrc: PropTypes.node.isRequired,
};
