import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class CollaborationLink extends Component {
  render() {
    const collaboration = this.props.children;
    const link = `/literature?q=collaboration:${collaboration}`;
    return <Link to={link}>{collaboration}</Link>;
  }
}

CollaborationLink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default CollaborationLink;
