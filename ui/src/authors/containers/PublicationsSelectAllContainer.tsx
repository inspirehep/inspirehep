import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator, Dispatch } from 'redux';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../actions/authors';
import PublicationsSelectAll from '../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

const stateToProps = (state: RootStateOrAny) => ({
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),
  selection: state.authors.get('publicationSelection'),
});

const dispatchToProps = (dispatch: Dispatch | ActionCreator<Action>) => ({
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
