import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { INSTITUTION_PAPERS_NS } from '../../search/constants';
import { getPapersQueryString } from '../utils';

function InstitutionPapers({ recordId }) {
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

InstitutionPapers.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default InstitutionPapers;
