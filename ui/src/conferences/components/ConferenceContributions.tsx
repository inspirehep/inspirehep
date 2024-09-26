import React, { useMemo } from 'react';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { CONFERENCE_CONTRIBUTIONS_NS } from '../../search/constants';
import { getContributionsQueryString } from '../utils';

function ConferenceContributions({ conferenceRecordId }: { conferenceRecordId: number }) {
  const baseQuery = useMemo(
    () => ({
      q: getContributionsQueryString(conferenceRecordId),
    }),
    [conferenceRecordId]
  );

  return (
    <LiteratureSearchContainer
      namespace={CONFERENCE_CONTRIBUTIONS_NS}
      baseQuery={baseQuery}
      noResultsTitle="0 Contributions"
      embedded
      page="Conference details"
    />
  );
}

export default ConferenceContributions;
