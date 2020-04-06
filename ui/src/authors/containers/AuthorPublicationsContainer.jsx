import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../reducers/search';

function AuthorPublications({ authorFacetName }) {
  const baseQuery = useMemo(
    () => ({
      author: [authorFacetName],
    }),
    [authorFacetName]
  );
  const baseAggregationsQuery = useMemo(
    () => ({
      author_recid: authorFacetName,
    }),
    [authorFacetName]
  );

  return (
    <LiteratureSearchContainer
      namespace={AUTHOR_PUBLICATIONS_NS}
      baseQuery={baseQuery}
      baseAggregationsQuery={baseAggregationsQuery}
      noResultsTitle="0 Research works"
      embedded
    />
  );
}

AuthorPublications.propTypes = {
  authorFacetName: PropTypes.string.isRequired,
};

const stateToProps = state => ({
  authorFacetName: state.authors.getIn([
    'data',
    'metadata',
    'facet_author_name',
  ]),
});

export default connect(stateToProps)(AuthorPublications);
