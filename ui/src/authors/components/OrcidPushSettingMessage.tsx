import React from 'react';

import OrcidProfileLink from '../../common/components/OrcidProfileLink';

function OrcidPushSettingMessage({ orcid, enabled }: { orcid: string, enabled: boolean }) {
  if (enabled) {
    return (
      <div>
        <p>
          This profile is already connected to the following ORCID:{' '}
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
    </div>
  );
}

export default OrcidPushSettingMessage;
