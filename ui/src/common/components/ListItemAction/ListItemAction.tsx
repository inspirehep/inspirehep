import React, { Component } from 'react';

import './ListItemAction.scss';

type Props = {};

class ListItemAction extends Component<Props> {

  render() {
    const { children } = this.props;

    return <span className="__ListItemAction__">{children}</span>;
  }
}

export default ListItemAction;
