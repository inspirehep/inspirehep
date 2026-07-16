import { Row, Col, Card } from 'antd';
import classNames from 'classnames';

import './ContentBox.less';

const ContentBox = ({
  title,
  leftActions = null,
  rightActions = null,
  loading = false,
  children = null,
  subTitle,
  className = '',
  fullHeight = true,
  smallPadding = true,
}: {
  title?: string;
  leftActions?: JSX.Element | JSX.Element[] | null;
  rightActions?: JSX.Element | JSX.Element[] | null;
  loading?: boolean;
  children?: JSX.Element | JSX.Element[] | any;
  subTitle?: string;
  className?: string;
  fullHeight?: boolean;
  smallPadding?: boolean;
}) =>
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
  );

export default ContentBox;
