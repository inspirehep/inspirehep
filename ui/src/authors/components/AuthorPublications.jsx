import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import EmbeddedLiteratureSearchContainer from '../../common/containers/EmbeddedLiteratureSearchContainer';

function AuthorPublications({ authorFacetName }) {
  const baseQuery = useMemo(() => ({ author: [authorFacetName] }), [
    authorFacetName,
  ]);
  const baseAggregationsQuery = useMemo(
    () => ({
      facet_name: 'hep-author-publication',
      exclude_author_value: authorFacetName,
    }),
    [authorFacetName]
  );
  return (
    <EmbeddedLiteratureSearchContainer
      baseQuery={baseQuery}
      baseAggregationsQuery={baseAggregationsQuery}
    />
  );
}

AuthorPublications.propTypes = {
  authorFacetName: PropTypes.string.isRequired,
};

export default AuthorPublications;
