// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
} from '../../actions/authors';
import PublicationsSelectAll from '../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

const stateToProps = (state: $TSFixMe) => ({
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),

  selection: state.authors.get('publicationSelection')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  onChange(publicationIds: $TSFixMe, claimed: $TSFixMe, canClaim: $TSFixMe, selected: $TSFixMe) {
    const claimedPaperIds = publicationIds.filter((item: $TSFixMe, i: $TSFixMe) => claimed.get(i));
    const unclaimedPaperIds = publicationIds.filter(
      (item: $TSFixMe, i: $TSFixMe) => !claimed.get(i) && canClaim.get(i)
    );
    const canNotClaimPaperIds = publicationIds.filter(
      (item: $TSFixMe, i: $TSFixMe) => !canClaim.get(i)
    );
    dispatch(setPublicationSelection(publicationIds, selected));
    dispatch(setPublicationsUnclaimedSelection(unclaimedPaperIds, selected));
    dispatch(setPublicationsClaimedSelection(claimedPaperIds, selected));
    dispatch(
      setPublicationsCanNotClaimSelection(canNotClaimPaperIds, selected)
    );
  }
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelectAll);
