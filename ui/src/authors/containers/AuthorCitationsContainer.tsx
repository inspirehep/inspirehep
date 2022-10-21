import React, { useMemo } from 'react';
import { connect, RootStateOrAny } from 'react-redux';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_CITATIONS_NS } from '../../search/constants';

function AuthorCitations({ authorBai }: { authorBai: string }) {
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

const stateToProps = (state: RootStateOrAny) => ({
  authorBai: state.authors.getIn(['data', 'metadata', 'bai']),
});

export default connect(stateToProps)(AuthorCitations);
