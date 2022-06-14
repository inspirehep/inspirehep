import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Button } from 'antd';

import ListItemAction from './ListItemAction';
import DropdownMenu from './DropdownMenu';

class ActionsDropdownOrAction extends Component {
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

ActionsDropdownOrAction.propTypes = {
  values: PropTypes.instanceOf(List).isRequired,
  renderDropdownAction: PropTypes.func.isRequired,
  renderAction: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
};

export default ActionsDropdownOrAction;
