import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EventTracker from '../../common/components/EventTracker';
import ExternalLink from '../../common/components/ExternalLink';

class ArxivEprintLink extends Component {
  get arxivId() {
    const { children } = this.props;
    return children;
  }

  render() {
    const { page } = this.props;

    const href = `//arxiv.org/abs/${this.arxivId}`;
    return (
      <EventTracker
        eventCategory={page}
        eventAction="link"
        eventId="Arvix eprint link"
      >
        <ExternalLink href={href}>{this.arxivId}</ExternalLink>
      </EventTracker>
    );
  }
}

ArxivEprintLink.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ArxivEprintLink;
