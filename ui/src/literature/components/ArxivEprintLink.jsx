import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ArxivEprintLink extends Component {
  render() {
    const arxivId = this.props.children;
    const href = `//arxiv.org/abs/${arxivId}`;
    return (
      <a target="_blank" href={href}>{arxivId}</a>
    );
  }
}

ArxivEprintLink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default ArxivEprintLink;
