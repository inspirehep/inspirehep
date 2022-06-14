import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ListItemAction.scss';

class ListItemAction extends Component {
  render() {
    const { children } = this.props;

    return <span className="__ListItemAction__">{children}</span>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ListItemAction.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ListItemAction;
