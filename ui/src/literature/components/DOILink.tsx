import React, { Component } from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import EventTracker from '../../common/components/EventTracker';

type Props = {
    doi: string;
};

class DOILink extends Component<Props> {

  render() {
    const { children, doi } = this.props;
    const href = `//doi.org/${doi}`;
    return (
      // @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message
      <EventTracker eventId="DoiLink">
        <ExternalLink href={href}>{children}</ExternalLink>
      </EventTracker>
    );
  }
}

export default DOILink;
