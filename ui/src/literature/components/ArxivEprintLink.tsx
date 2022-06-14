import React, { Component } from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import EventTracker from '../../common/components/EventTracker';

type Props = {};

class ArxivEprintLink extends Component<Props> {

  get arxivId() {
    const { children } = this.props;
    return children;
  }

  render() {
    const href = `//arxiv.org/abs/${this.arxivId}`;
    return (
      // @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message
      <EventTracker eventId="ArvixEprintLink">
        <ExternalLink href={href}>{this.arxivId}</ExternalLink>
      </EventTracker>
    );
  }
}

export default ArxivEprintLink;
