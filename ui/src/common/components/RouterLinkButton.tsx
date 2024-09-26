import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

interface LinkProps {
  className?: string;
  to: string;
  [x: string]: any;
}

function RouterLinkButton({ className, ...linkProps }: LinkProps) {
  return (
    <Link
      className={classNames('ant-btn ant-btn-primary', className)}
      {...linkProps}
    />
  );
}

export default RouterLinkButton;
