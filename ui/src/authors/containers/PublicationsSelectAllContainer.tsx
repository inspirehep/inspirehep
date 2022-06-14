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

const stateToProps = (state: any) => ({
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),

  selection: state.authors.get('publicationSelection')
});

const dispatchToProps = (dispatch: any) => ({
  onChange(publicationIds: any, claimed: any, canClaim: any, selected: any) {
    const claimedPaperIds = publicationIds.filter((item: any, i: any) => claimed.get(i));
    const unclaimedPaperIds = publicationIds.filter(
      (item: any, i: any) => !claimed.get(i) && canClaim.get(i)
    );
    const canNotClaimPaperIds = publicationIds.filter(
      (item: any, i: any) => !canClaim.get(i)
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
