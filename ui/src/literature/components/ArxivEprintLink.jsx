import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';
import EventTracker from '../../common/components/EventTracker';

class ArxivEprintLink extends Component {
  get arxivId() {
    const { children } = this.props;
    return children;
  }

  render() {
    const href = `//arxiv.org/abs/${this.arxivId}`;
    return (
      <EventTracker eventId="ArvixEprintLink">
        <ExternalLink href={href}>{this.arxivId}</ExternalLink>
      </EventTracker>
    );
  }
}

ArxivEprintLink.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ArxivEprintLink;
