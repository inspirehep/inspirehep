import React from 'react';
import { List } from 'immutable';
import { Button } from 'antd';

import UserAction from './UserAction';
import DropdownMenu from './DropdownMenu';

const ActionsDropdownOrAction = ({
  values,
  renderDropdownAction,
  title,
  renderAction,
}: {
  values: List<string>;
  title: string | JSX.Element;
  renderDropdownAction: (args: any) => JSX.Element;
  renderAction: Function;
}) => {
  function renderDropdown() {
    return (
      <DropdownMenu title={<Button>{title}</Button>}>
        {values.map(renderDropdownAction)}
      </DropdownMenu>
    );
  }

  return (
    <UserAction>
      {values.size > 1 ? renderDropdown() : renderAction(values.first(), title)}
    </UserAction>
  );
};

export default ActionsDropdownOrAction;
