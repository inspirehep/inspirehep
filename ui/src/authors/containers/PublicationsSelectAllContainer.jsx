import { connect } from 'react-redux';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
} from '../../actions/authors';
import PublicationsSelectAll from '../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

const stateToProps = (state) => ({
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),
  selection: state.authors.get('publicationSelection'),
});

const dispatchToProps = (dispatch) => ({
  onChange(publicationIds, claimed, canClaim, selected) {
    const claimedPaperIds = publicationIds.filter((item, i) => claimed.get(i));
    const unclaimedPaperIds = publicationIds.filter(
      (item, i) => !claimed.get(i) && canClaim.get(i)
    );
    const canNotClaimPaperIds = publicationIds.filter(
      (item, i) => !canClaim.get(i)
    );
    dispatch(setPublicationSelection(publicationIds, selected));
    dispatch(setPublicationsUnclaimedSelection(unclaimedPaperIds, selected));
    dispatch(setPublicationsClaimedSelection(claimedPaperIds, selected));
    dispatch(
      setPublicationsCanNotClaimSelection(canNotClaimPaperIds, selected)
    );
  },
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelectAll);
