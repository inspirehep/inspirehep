import React, { useMemo } from 'react';
import { connect, RootStateOrAny } from 'react-redux';

import { isCataloger, isSuperUser } from '../../common/authorization';
import AuthorPublications from '../components/AuthorPublications';

function enableDifferentProfileView(state: RootStateOrAny) {
  if (state.user.getIn(['data', 'recid'])) {
    return true;
  }
  return false;
}

const stateToProps = (state: RootStateOrAny) => ({
  authorFacetName: state.authors.getIn([
    'data',
    'metadata',
    'facet_author_name',
  ]),
  assignView:
    isSuperUser(state.user.getIn(['data', 'roles'])) ||
    isCataloger(state.user.getIn(['data', 'roles'])),
  assignViewOwnProfile: state.authors.getIn(['data', 'metadata', 'can_edit']),
  assignViewDifferentProfile: enableDifferentProfileView(state),
  assignViewNoProfile: state.user.get('loggedIn'),
  assignViewNotLoggedIn: !state.user.get('loggedIn'),
  numberOfSelected: state.authors.get('publicationSelection').size,
});

export default connect(stateToProps)(AuthorPublications);
