import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';
import { isCataloger, isSuperUser } from '../../common/authorization';
import AssignViewContext from '../AssignViewContext';
import AssignDrawerContainer from './AssignDrawerContainer';

export function AuthorPublications({ authorFacetName, assignView }) {
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
    <AssignViewContext.Provider value={assignView}>
      <LiteratureSearchContainer
        namespace={AUTHOR_PUBLICATIONS_NS}
        baseQuery={baseQuery}
        baseAggregationsQuery={baseAggregationsQuery}
        noResultsTitle="0 Research works"
        embedded
      />
      {assignView && <AssignDrawerContainer />}
    </AssignViewContext.Provider>
  );
}

AuthorPublications.propTypes = {
  authorFacetName: PropTypes.string.isRequired,
  assignView: PropTypes.bool,
};

const stateToProps = (state) => ({
  authorFacetName: state.authors.getIn([
    'data',
    'metadata',
    'facet_author_name',
  ]),
  assignView:
    isSuperUser(state.user.getIn(['data', 'roles'])) ||
    isCataloger(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(AuthorPublications);
