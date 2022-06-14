import React, { useMemo } from 'react';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { CONFERENCE_CONTRIBUTIONS_NS } from '../../search/constants';
import { getContributionsQueryString } from '../utils';

type Props = {
    conferenceRecordId: string;
};

function ConferenceContributions({ conferenceRecordId }: Props) {
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
    />
  );
}

export default ConferenceContributions;
