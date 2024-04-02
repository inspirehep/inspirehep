import React, { MouseEventHandler } from 'react';
import { Button } from 'antd';
import classNames from 'classnames';

import './LinkLikeButton.less';

const LinkLikeButton = ({
  children,
  onClick,
  dataTestId,
  color,
  disabled,
  className,
}: {
  children: JSX.Element | string;
  onClick: MouseEventHandler<HTMLElement>;
  dataTestId: string;
  color: string;
  disabled: boolean;
  className?: string;
}) => (
  <Button
    disabled={disabled}
    type="text"
    data-test-id={dataTestId}
    onClick={onClick}
    className={classNames('__LinkLikeButton__', color, { disabled }, className)}
    data-testid={dataTestId}
  >
    {children}
  </Button>
);

LinkLikeButton.defaultProps = {
  dataTestId: undefined,
  disabled: false,
  color: 'blue',
};

export default LinkLikeButton;
