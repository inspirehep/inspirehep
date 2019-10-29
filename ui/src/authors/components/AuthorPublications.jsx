import React from 'react';
import PropTypes from 'prop-types';

import EmbeddedLiteratureSearchContainer from '../../common/containers/EmbeddedLiteratureSearchContainer';

function AuthorPublications({ authorFacetName }) {
  return (
    <EmbeddedLiteratureSearchContainer
      baseQuery={{ author: [authorFacetName] }}
      baseAggregationsQuery={{
        facet_name: 'hep-author-publication',
        exclude_author_value: authorFacetName,
      }}
    />
  );
}

AuthorPublications.propTypes = {
  authorFacetName: PropTypes.string.isRequired,
};

export default AuthorPublications;
