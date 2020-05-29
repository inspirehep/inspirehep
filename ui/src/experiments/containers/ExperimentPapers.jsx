import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { getPapersQueryString } from '../utils';
import { EXPERIMENT_PAPERS_NS } from '../../search/constants';

function ExperimentPapers({ recordId }) {
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

ExperimentPapers.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default ExperimentPapers;
