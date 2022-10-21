import React, { MouseEventHandler } from 'react';
import { Button } from 'antd';

import './LinkLikeButton.less'

const LinkLikeButton = ({
  children,
  onClick,
  dataTestId,
  color,
}: {
  children: JSX.Element;
  onClick: MouseEventHandler<HTMLElement>;
  dataTestId: string;
  color: string
}) => (
  <Button type="text" data-test-id={dataTestId} onClick={onClick} className={`__LinkLikeButton__ ${color}`}>
    {children}
  </Button>
);

LinkLikeButton.defaultProps = {
  dataTestId: undefined,
  color: 'blue'
};

export default LinkLikeButton;
