import React from 'react';
import { Row, Col, Card } from 'antd';
import classNames from 'classnames';

import './ContentBox.less';

const ContentBox = ({
  title,
  leftActions,
  rightActions,
  loading,
  children,
  subTitle,
  className,
  fullHeight = true,
  smallPadding = true,
}: {
  title: string;
  leftActions: JSX.Element | JSX.Element[];
  rightActions: JSX.Element | JSX.Element[];
  loading: boolean;
  children: JSX.Element | JSX.Element[] | any;
  subTitle: string;
  className: string;
  fullHeight?: boolean;
  smallPadding?: boolean;
}) => {
  return (
    children && (
      <div
        className={classNames(
          '__ContentBox__',
          { 'h-100': fullHeight },
          className
        )}
      >
        <Card className="h-100" title={title} loading={loading}>
          <div
            className={classNames(
              { pa2: smallPadding },
              { pa3: !smallPadding },
              className
            )}
          >
            {subTitle && <h3 className="pb1">{subTitle}</h3>}
            <div>{children}</div>
          </div>
          <Row className="actions ph2" justify="space-between">
            <Col>{leftActions}</Col>
            <Col>{rightActions}</Col>
          </Row>
        </Card>
      </div>
    )
  );
};

ContentBox.defaultProps = {
  leftActions: null,
  rightActions: null,
  children: null,
  title: null,
  subTitle: null,
  loading: false,
  className: '',
};

export default ContentBox;
