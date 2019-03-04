import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';
import EventTracker from '../../common/containers/EventTracker';

class DOILink extends Component {
  get doi() {
    const { children } = this.props;
    return children;
  }

  render() {
    const href = `//doi.org/${this.doi}`;
    return (
      <EventTracker eventId="DoiLink">
        <ExternalLink href={href}>{this.doi}</ExternalLink>
      </EventTracker>
    );
  }
}

DOILink.propTypes = {
  children: PropTypes.string.isRequired,
};

export default DOILink;
