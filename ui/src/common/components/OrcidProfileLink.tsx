import React from 'react';

import LinkWithTargetBlank from './LinkWithTargetBlank';
import EventTracker from './EventTracker';

function OrcidProfileLink({
  children,
  orcid,
  className,
}: {
  orcid?: string;
  children?: JSX.Element | JSX.Element[];
  className?: string;
}) {
  return (
    <EventTracker
      eventCategory="Author detail"
      eventAction="Link"
      eventId="Orcid link"
    >
      <LinkWithTargetBlank className={className} href={`//orcid.org/${orcid}`}>
        {children || orcid}
      </LinkWithTargetBlank>
    </EventTracker>
  );
}

export default OrcidProfileLink;
