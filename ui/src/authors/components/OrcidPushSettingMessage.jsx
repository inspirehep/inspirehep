import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';
import OrcidProfileLink from '../../common/components/OrcidProfileLink';

function OrcidPushSettingMessage({ orcid, enabled, authorBAI }) {
  if (enabled) {
    return (
      <div>
        <p>
          This profile is already connected to the following ORCID:
          <OrcidProfileLink orcid={orcid} />
        </p>
        <p>
          Your{' '}
          <ExternalLink href={`//inspirehep.net/author/claim/${authorBAI}`}>
            claimed
          </ExternalLink>{' '}
          works will be exported automatically.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Your INSPIRE works are not exported to your ORCID{' '}
        <OrcidProfileLink orcid={orcid} /> yet. Please note that only the
        publications that are verified as yours on INSPIRE will be exported to
        ORCID.
      </p>
      <div>
        To export your publications to ORCID, please follow the following
        instructions:
        <ol className="pv2">
          <li>
            <p>Clean your INSPIRE profile</p>
            <p>
              Before you export your publications to ORCID, you must clean up
              and prepare your INSPIRE author profile. The goal is to have a
              unique INSPIRE profile associated to you, with all works marked as
              yours.
            </p>
            <p>
              The most expedient way to clean your profile is to obtain an arXiv
              ID and login to INSPIRE using this arXiv ID. If you don’t use an
              arXiv ID, you can make changes to your profile as a guest, but all
              actions will require approval from the INSPIRE team, which may
              take a few days depending on how many requests are before yours.
              If you don’t mind waiting, you can follow the instructions below
              without signing in with an arXiv ID and still prepare your author
              profile for an ORCID connection. Please be aware that this
              approval process is necessary to ensure the quality of the
              information we have in INSPIRE.
            </p>

            <p>
              <ExternalLink href="//inspirehep.net/info/HepNames/connect_orcid#hide1">
                Instructions on cleaning your profile
              </ExternalLink>
            </p>
          </li>
          <li>
            <p>Claim your work</p>
            <p>
              Once your profile is clean, you need to confirm that the{' '}
              <ExternalLink href={`//inspirehep.net/author/claim/${authorBAI}`}>
                listed works
              </ExternalLink>{' '}
              are yours. Only claimed works will be pushed to ORCID.
            </p>
            <p>
              Note that cleaning and claiming have to be done periodically, in
              order to keep your profile up to date
            </p>
          </li>
          <li>
            <p>Connect your INSPIRE author profile to ORCID</p>
            <p>
              Once you clean up your INSPIRE author profile and you claim your
              works as explained above, you are ready to export them to ORCID.
            </p>
          </li>
        </ol>
      </div>
      <p>
        Note that if you use your ORCID when publishing a paper, INSPIRE will
        automatically attribute it to you and send this information to the ORCID
        register. If you don’t, or if the publisher doesn’t send this
        information to INSPIRE, you need to claim it.
      </p>
      <p>
        If you have questions or need assistance during any steps of this
        process, don’t hesitate to send a message to{' '}
        <ExternalLink href="mailto:authors@inspirehep.net">
          authors@inspirehep.net
        </ExternalLink>
      </p>
    </div>
  );
}

OrcidPushSettingMessage.propTypes = {
  orcid: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
  authorBAI: PropTypes.string.isRequired,
};

export default OrcidPushSettingMessage;
