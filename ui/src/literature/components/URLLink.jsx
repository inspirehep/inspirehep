import React, { Component } from 'react';
import PropTypes from 'prop-types';

class URLLink extends Component {
  render() {
    const { children } = this.props;
    return (
      <a target="_blank" href={children}>
        {children}
      </a>
    );
  }
}

URLLink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default URLLink;
