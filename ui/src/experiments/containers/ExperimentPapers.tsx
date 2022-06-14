import React, { useMemo } from 'react';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { getPapersQueryString } from '../utils';
import { EXPERIMENT_PAPERS_NS } from '../../search/constants';

type Props = {
    recordId: number;
};

function ExperimentPapers({ recordId }: Props) {
  const baseQuery = useMemo(
    () => ({
      q: getPapersQueryString(recordId),
    }),
    [recordId]
  );

  return (
    <LiteratureSearchContainer
      namespace={EXPERIMENT_PAPERS_NS}
      baseQuery={baseQuery}
      noResultsTitle="0 Papers"
      embedded
    />
  );
}

export default ExperimentPapers;
