import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Button } from 'antd';

import ListItemAction from './ListItemAction';
import DropdownMenu from './DropdownMenu';

class ActionsDropdownOrAction extends Component {
  renderDropdown() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values, renderDropdownAction, title } = this.props;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <DropdownMenu title={<Button>{title}</Button>}>
        {values.map(renderDropdownAction)}
      </DropdownMenu>
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ActionsDropdownOrAction.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  values: PropTypes.instanceOf(List).isRequired,
  renderDropdownAction: PropTypes.func.isRequired,
  renderAction: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
};

export default ActionsDropdownOrAction;
