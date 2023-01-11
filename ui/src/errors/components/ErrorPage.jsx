import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';

class ErrorPage extends Component {
  render() {
    const { detail, message, imageSrc, url } = this.props;
    return (
      <Col className="mt3 mb3" span={14} justify="center" align="middle">
        <Row>
          <Col span={24}>
            <h3 className="f2 sm-f3">{message}</h3>
          </Col>
        </Row>
        {detail && (
          <Row>
            <Col span={24}>
              <h3 className="f3 normal sm-f4">{detail}</h3>
            </Col>
          </Row>
        )}
        {url && (
          <Row>
            <Col span={24}>
              <p className="f5 normal">
                Redirected from: <Link to={url}>{url}</Link>
              </p>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={24}>
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
