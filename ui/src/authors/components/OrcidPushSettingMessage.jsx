import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink.tsx';
import OrcidProfileLink from '../../common/components/OrcidProfileLink';

function OrcidPushSettingMessage({ orcid, enabled }) {
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
        <ExternalLink href="mailto:authors@inspirehep.net">
          authors@inspirehep.net
        </ExternalLink>
        .
      </div>
    </div>
  );
}

OrcidPushSettingMessage.propTypes = {
  orcid: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
};

export default OrcidPushSettingMessage;
