import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';

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
        <LinkWithTargetBlank href={href}>{this.arxivId}</LinkWithTargetBlank>
      </EventTracker>
    );
  }
}

ArxivEprintLink.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ArxivEprintLink;
