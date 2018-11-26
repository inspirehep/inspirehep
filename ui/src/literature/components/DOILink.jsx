import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';

class DOILink extends Component {
  get doi() {
    const { children } = this.props;
    return children;
  }

  render() {
    const href = `//doi.org/${this.doi}`;
    return <ExternalLink href={href}>{this.doi}</ExternalLink>;
  }
}

DOILink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default DOILink;
