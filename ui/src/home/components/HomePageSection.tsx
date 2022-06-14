import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';
import { Row, Col } from 'antd';

type Props = {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
};

function HomePageSection({ title, description, children, className }: Props) {
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

export default HomePageSection;
