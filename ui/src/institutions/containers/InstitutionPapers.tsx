import React, { useMemo } from 'react';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { INSTITUTION_PAPERS_NS } from '../../search/constants';
import { getPapersQueryString } from '../utils';

type Props = {
    recordId: number;
};

function InstitutionPapers({ recordId }: Props) {
  const baseQuery = useMemo(
    () => ({
      q: getPapersQueryString(recordId),
    }),
    [recordId]
  );

  return (
    <LiteratureSearchContainer
      namespace={INSTITUTION_PAPERS_NS}
      baseQuery={baseQuery}
      noResultsTitle="0 Papers"
      embedded
    />
  );
}

export default InstitutionPapers;
