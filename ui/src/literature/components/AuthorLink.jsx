import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AuthorLink extends Component {
  render() {
    const { fullName, recordId } = this.props;
    const href = `//inspirehep.net/author/profile/${fullName}?recid=${recordId}`;
    return (
      <a target="_blank" href={href}>
        {fullName}
      </a>
    );
  }
}

AuthorLink.propTypes = {
  fullName: PropTypes.string.isRequired,
  recordId: PropTypes.number.isRequired,
};

export default AuthorLink;
