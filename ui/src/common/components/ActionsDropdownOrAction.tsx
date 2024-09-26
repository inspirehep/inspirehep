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
  values: List<any>;
  title: string | JSX.Element;
  renderDropdownAction: (args: any) => any;
  renderAction: Function;
}) => {
  function renderDropdown() {
    return (
      <DropdownMenu
        title={<Button>{title}</Button>}
        // @ts-expect-error
        items={values.map(renderDropdownAction)}
      />
    );
  }

  return (
    <UserAction>
      {values.size > 1 ? renderDropdown() : renderAction(values.first(), title)}
    </UserAction>
  );
};

export default ActionsDropdownOrAction;
