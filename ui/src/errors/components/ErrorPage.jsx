import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

class ErrorPage extends Component {
  render() {
    const { detail, message, imageSrc } = this.props;
    return (
      <Col className="mt3 mb3" span={14} justify="center" align="middle">
        <Row>
          <Col>
            <h3 className="f2 sm-f3">{message}</h3>
          </Col>
        </Row>
        {detail && (
          <Row>
            <Col>
              <h3 className="f3 normal sm-f4">{detail}</h3>
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            <img src={imageSrc} alt="ERROR" />
          </Col>
        </Row>
      </Col>
    );
  }
}

ErrorPage.propTypes = {
  detail: PropTypes.node,
  message: PropTypes.string.isRequired,
  imageSrc: PropTypes.node.isRequired,
};

ErrorPage.defaultProps = {
  detail: null,
};

export default ErrorPage;
