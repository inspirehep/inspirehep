import React from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import OrcidProfileLink from '../../common/components/OrcidProfileLink';

type Props = {
    orcid?: string;
    enabled: boolean;
};

function OrcidPushSettingMessage({ orcid, enabled }: Props) {
  if (enabled) {
    return (
      <div>
        <p>
          This profile is already connected to the following ORCID:
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message */}
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
        <ExternalLink href="mailto:authors@inspirehep.net">
          authors@inspirehep.net
        </ExternalLink>
        .
      </div>
    </div>
  );
}

export default OrcidPushSettingMessage;
