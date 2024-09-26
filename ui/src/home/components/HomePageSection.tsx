import React from 'react';
import classNames from 'classnames';
import { Row, Col } from 'antd';

function HomePageSection({
  description,
  children,
  className,
  title,
}: {
  children: JSX.Element;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Row className={classNames('pv4 ph2', className)} justify="center">
      <Col>
        {title && <h2 className="tc f2 sm-f4">{title}</h2>}
        {description && <p className="tc">{description}</p>}
        <div className={title && 'mt5'}>{children}</div>
      </Col>
    </Row>
  );
}

export default HomePageSection;
