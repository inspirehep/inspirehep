import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

function RouterLinkButton({ className, ...linkProps }) {
  return (
    <Link
      className={classNames('ant-btn ant-btn-primary', className)}
      {...linkProps}
    />
  );
}

export default RouterLinkButton;
