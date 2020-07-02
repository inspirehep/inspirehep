import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { AUTHOR_SEMINARS_NS } from '../../search/constants';
import SeminarSearchContainer from '../../seminars/containers/SeminarSearchContainer';

function AuthorSeminars({ recordId }) {
  const baseQuery = useMemo(
    () => ({
      q: `speakers.record.$ref:${recordId}`,
    }),
    [recordId]
  );

  return (
    <SeminarSearchContainer
      namespace={AUTHOR_SEMINARS_NS}
      baseQuery={baseQuery}
    />
  );
}

AuthorSeminars.propTypes = {
  recordId: PropTypes.string.isRequired,
};

export default AuthorSeminars;
