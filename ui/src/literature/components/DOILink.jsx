import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DOILink extends Component {
  render() {
    const doi = this.props.children;
    const href = `//doi.org/${doi}`;
    return (
      <a target="_blank" href={href}>{doi}</a>
    );
  }
}

DOILink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default DOILink;
