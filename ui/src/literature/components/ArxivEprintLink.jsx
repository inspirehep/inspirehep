import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ExternalLink from '../../common/components/ExternalLink';

class ArxivEprintLink extends Component {
  get arxivId() {
    const { children } = this.props;
    return children;
  }

  render() {
    const href = `//arxiv.org/abs/${this.arxivId}`;
    return <ExternalLink href={href}>{this.arxivId}</ExternalLink>;
  }
}

ArxivEprintLink.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ArxivEprintLink;
