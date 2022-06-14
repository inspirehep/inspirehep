import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ListItemAction.scss';

class ListItemAction extends Component {
  render() {
    const { children } = this.props;

    return <span className="__ListItemAction__">{children}</span>;
  }
}

ListItemAction.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ListItemAction;
