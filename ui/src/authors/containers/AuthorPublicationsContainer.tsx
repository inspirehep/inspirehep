import React, { useMemo } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';
import { isCataloger, isSuperUser } from '../../common/authorization';
import AssignViewContext from '../AssignViewContext';
import AssignViewOwnProfileContext from '../assignViewOwnProfileContext';
import AssignViewDifferentProfileContext from '../assignViewDifferentProfileContext';
import AssignViewNoProfileContext from '../assignViewNoProfileContext';
import AssignViewNotLoggedInContext from '../assignViewNotLoggedInContext';

import AssignDrawerContainer from './AssignDrawerContainer';
import { getConfigFor } from '../../common/config';

type AuthorPublicationsProps = {
    authorFacetName: string;
    assignView?: boolean;
    assignViewOwnProfile?: boolean;
    numberOfSelected: number;
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'assignViewDifferentProfile' does not exi... Remove this comment to see the full error message
export function AuthorPublications({ authorFacetName, assignView, assignViewOwnProfile, assignViewDifferentProfile, assignViewNoProfile, numberOfSelected, assignViewNotLoggedIn, }: AuthorPublicationsProps) {
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
    <AssignViewNotLoggedInContext.Provider value={assignViewNotLoggedIn}>
      <AssignViewNoProfileContext.Provider value={assignViewNoProfile}>
        <AssignViewDifferentProfileContext.Provider
          value={assignViewDifferentProfile}
        >
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean | undefined' is not assignable to ty... Remove this comment to see the full error message */}
          <AssignViewOwnProfileContext.Provider value={assignViewOwnProfile}>
            {/* @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean | undefined' is not assignable to ty... Remove this comment to see the full error message */}
            <AssignViewContext.Provider value={assignView}>
              <LiteratureSearchContainer
                namespace={AUTHOR_PUBLICATIONS_NS}
                baseQuery={baseQuery}
                baseAggregationsQuery={baseAggregationsQuery}
                noResultsTitle="0 Research works"
                embedded
                numberOfSelected={numberOfSelected}
              />
              {assignView && <AssignDrawerContainer />}
            </AssignViewContext.Provider>
          </AssignViewOwnProfileContext.Provider>
        </AssignViewDifferentProfileContext.Provider>
      </AssignViewNoProfileContext.Provider>
    </AssignViewNotLoggedInContext.Provider>
  );
}

function enableDifferentProfileView(state: $TSFixMe) {
  if (state.user.getIn(['data', 'recid'])) {
    return true;
  }
  return false;
}

const stateToProps = (state: $TSFixMe) => ({
  authorFacetName: state.authors.getIn([
    'data',
    'metadata',
    'facet_author_name',
  ]),

  assignView:
    isSuperUser(state.user.getIn(['data', 'roles'])) ||
    isCataloger(state.user.getIn(['data', 'roles'])),

  assignViewOwnProfile:
    state.authors.getIn(['data', 'metadata', 'can_edit']) &&
    getConfigFor('ASSIGN_OWN_PROFILE_UI_FEATURE_FLAG'),

  assignViewDifferentProfile:
    enableDifferentProfileView(state) &&
    getConfigFor('ASSIGN_DIFFERENT_PROFILE_UI_FEATURE_FLAG'),

  assignViewNoProfile:
    state.user.get('loggedIn') &&
    getConfigFor('ASSIGN_NO_PROFILE_UI_FEATURE_FLAG'),

  assignViewNotLoggedIn:
    !state.user.get('loggedIn') &&
    getConfigFor('ASSIGN_NOT_LOGGED_IN_FEATURE_FLAG'),

  numberOfSelected: state.authors.get('publicationSelection').size
});

export default connect(stateToProps)(AuthorPublications);
