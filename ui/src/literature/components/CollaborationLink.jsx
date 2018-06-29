import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CollaborationLink extends Component {
  render() {
    const collaboration = this.props.children;
    const href = `/literature?p=collaboration:"${collaboration}"`;
    return (
      <a target="_blank" href={href}>
        {collaboration}
      </a>
    );
  }
}

CollaborationLink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default CollaborationLink;
