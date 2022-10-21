import React from 'react';

import './UserAction.less';

const UserActionWrapper = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => <span className="__UserAction__">{children}</span>;

export default UserActionWrapper;
