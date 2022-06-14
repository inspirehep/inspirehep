import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../routes';

class CollaborationLink extends Component {
  get collaboration() {
    const { children } = this.props;
    return children;
  }

  render() {
    const link = `${LITERATURE}?q=collaboration:${this.collaboration}`;
    return <Link to={link}>{this.collaboration}</Link>;
  }
}

CollaborationLink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default CollaborationLink;
