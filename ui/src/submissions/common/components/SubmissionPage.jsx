import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

function SubmissionPage({ title, description, children }) {
  return (
    <Row type="flex" justify="center">
      <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
        <Row className="mb3 pa3 bg-white">
          <Col span={24}>
            <h3>{title}</h3>
            {description}
          </Col>
        </Row>
        <Row>
          <Col span={24}>{children}</Col>
        </Row>
      </Col>
    </Row>
  );
}
SubmissionPage.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
};

export default SubmissionPage;
