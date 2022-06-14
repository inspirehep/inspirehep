import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { LITERATURE } from '../routes';

type Props = {};

class CollaborationLink extends Component<Props> {

  get collaboration() {
    const { children } = this.props;
    return children;
  }

  render() {
    const link = `${LITERATURE}?q=collaboration:${this.collaboration}`;
    return <Link to={link}>{this.collaboration}</Link>;
  }
}

export default CollaborationLink;
