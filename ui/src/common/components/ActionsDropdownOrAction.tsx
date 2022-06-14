import React, { Component } from 'react';
import { List } from 'immutable';
import { Button } from 'antd';

import ListItemAction from './ListItemAction';
import DropdownMenu from './DropdownMenu';

type Props = {
    values: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    renderDropdownAction: $TSFixMeFunction;
    renderAction: $TSFixMeFunction;
    title: React.ReactNode;
};

class ActionsDropdownOrAction extends Component<Props> {

  renderDropdown() {
    const { values, renderDropdownAction, title } = this.props;
    return (
      <DropdownMenu title={<Button>{title}</Button>}>
        {values.map(renderDropdownAction)}
      </DropdownMenu>
    );
  }

  render() {
    const { values, title, renderAction } = this.props;
    return (
      <ListItemAction>
        {values.size > 1
          ? this.renderDropdown()
          : renderAction(values.first(), title)}
      </ListItemAction>
    );
  }
}

export default ActionsDropdownOrAction;
