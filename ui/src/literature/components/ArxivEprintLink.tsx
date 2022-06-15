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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventId: string; }' is ... Remove this comment to see the full error message
      <EventTracker eventId="ArvixEprintLink">
        <ExternalLink href={href}>{this.arxivId}</ExternalLink>
      </EventTracker>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ArxivEprintLink.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ArxivEprintLink;
