import React from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';
import { Row, Col } from 'antd';

function HomePageSection({
  title,
  description,
  children,
  className
}: any) {
  return (
    <Row className={classNames('pv4 ph2', className)} justify="center">
      <Col>
        <h2 className="tc f2 sm-f4">{title}</h2>
        {description && <p className="tc">{description}</p>}
        <div className="mt5">{children}</div>
      </Col>
    </Row>
  );
}

HomePageSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default HomePageSection;
