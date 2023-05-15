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
}: {
  children: JSX.Element | string;
  onClick: MouseEventHandler<HTMLElement>;
  dataTestId: string;
  color: string;
  disabled: boolean;
}) => (
  <Button
    disabled={disabled}
    type="text"
    data-test-id={dataTestId}
    onClick={onClick}
    className={classNames('__LinkLikeButton__', color, { 'disabled': disabled })}
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
