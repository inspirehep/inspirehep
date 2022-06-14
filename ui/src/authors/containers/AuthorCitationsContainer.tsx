import React, { useMemo } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_CITATIONS_NS } from '../../search/constants';

function AuthorCitations({
  authorBai
}: any) {
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

const stateToProps = (state: any) => ({
  authorBai: state.authors.getIn(['data', 'metadata', 'bai'])
});

export default connect(stateToProps)(AuthorCitations);
