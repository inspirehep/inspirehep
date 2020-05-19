import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_CITATIONS_NS } from '../../search/constants';

function AuthorCitations({ authorBai }) {
  const baseQuery = useMemo(
    () => ({
      q: `refersto a ${authorBai}`,
    }),
    [authorBai]
  );

  return (
    <LiteratureSearchContainer
      namespace={AUTHOR_CITATIONS_NS}
      baseQuery={baseQuery}
      noResultsTitle="0 Citations"
      embedded
      enableCitationSummary={false}
    />
  );
}

AuthorCitations.propTypes = {
  authorBai: PropTypes.string.isRequired,
};

const stateToProps = state => ({
  authorBai: state.authors.getIn(['data', 'metadata', 'bai']),
});

export default connect(stateToProps)(AuthorCitations);
