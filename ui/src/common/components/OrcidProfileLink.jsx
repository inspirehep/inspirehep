import React from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from './LinkWithTargetBlank';
import EventTracker from './EventTracker';

function OrcidProfileLink({ children, orcid, className }) {
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

OrcidProfileLink.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  orcid: PropTypes.string.isRequired,
};

export default OrcidProfileLink;
