import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

function RouterLinkButton({
  className,
  ...linkProps
}: any) {
  return (
    <Link
      className={classNames('ant-btn ant-btn-primary', className)}
      {...linkProps}
    />
  );
}

export default RouterLinkButton;
