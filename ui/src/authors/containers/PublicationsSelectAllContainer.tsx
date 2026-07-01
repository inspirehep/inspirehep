import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../types';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../actions/authors';
import PublicationsSelectAll from '../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

const stateToProps = (state: RootState) => ({
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),
  selection: state.authors.get('publicationSelection'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onChange(
    publicationIds: number[],
    claimed: Map<number, boolean>,
    canClaim: Map<number, boolean>,
    selected: boolean
  ) {
    const claimedPaperIds = publicationIds.filter((item, i) => claimed.get(i));
    const unclaimedPaperIds = publicationIds.filter(
      (item, i) => !claimed.get(i) && canClaim.get(i)
    );
    dispatch(setPublicationSelection(publicationIds, selected));
    dispatch(setPublicationsUnclaimedSelection(unclaimedPaperIds, selected));
    dispatch(setPublicationsClaimedSelection(claimedPaperIds, selected));
  },
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelectAll);
