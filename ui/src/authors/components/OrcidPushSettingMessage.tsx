import React from 'react';
import EventTracker from '../../common/components/EventTracker';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import OrcidProfileLink from '../../common/components/OrcidProfileLink';

function OrcidPushSettingMessage({ orcid, enabled }: { orcid: string, enabled: boolean }) {
  if (enabled) {
    return (
      <div>
        <p>
          This profile is already connected to the following ORCID:
          <OrcidProfileLink orcid={orcid} />
        </p>
        <p>Your claimed works will be exported automatically.</p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Your INSPIRE works are not exported to your ORCID yet. Please note that
        only the publications that are verified as yours on INSPIRE will be
        exported to ORCID.
      </p>
      <div>
        A new interface that will allow you to claim your papers is coming up
        soon. In the meantime, if you wish to claim a paper as yours, you can
        send your request at{' '}
        <EventTracker
          eventCategory="Author detail"
          eventAction="Mail"
          eventId="Contact authors@inspirehep.net"
        >
          <LinkWithTargetBlank href="mailto:authors@inspirehep.net">
            authors@inspirehep.net
          </LinkWithTargetBlank>
        </EventTracker>
        .
      </div>
    </div>
  );
}

export default OrcidPushSettingMessage;
