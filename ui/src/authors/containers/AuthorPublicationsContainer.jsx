import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../reducers/search';
import { isCataloger } from '../../common/authorization';

function AuthorPublications({ authorFacetName, isCatalogerLoggedIn }) {
  const baseQuery = useMemo(
    () => ({
      author: [authorFacetName],
      size: isCatalogerLoggedIn ? 100 : 10, // TODO: move sizes to constants file
    }),
    [authorFacetName, isCatalogerLoggedIn]
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
  isCatalogerLoggedIn: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  authorFacetName: state.authors.getIn([
    'data',
    'metadata',
    'facet_author_name',
  ]),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(AuthorPublications);
