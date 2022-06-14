/* eslint-disable no-case-declarations */
import { Map, Set } from 'immutable';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  CLEAR_STATE,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
  AUTHOR_PUBLICATION_CLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
  AUTHOR_PUBLICATION_UNCLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
} from '../actions/actionTypes';
import {
  onRequest,
  onSuccess,
  onError,
  initialState as initialRecordState,
} from './recordsFactory';

export const initialState = Map({
  publicationSelection: Set(),
  isAssignDrawerVisible: false,
  publicationSelectionClaimed: Set(),
  publicationSelectionUnclaimed: Set(),
  publicationSelectionCanNotClaim: Set(),
}).merge(initialRecordState);

const authorsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case AUTHOR_REQUEST:
      return onRequest(state);
    case AUTHOR_SUCCESS:
      return onSuccess(state, action);
    case AUTHOR_ERROR:
      return onError(state, action);
    case AUTHOR_PUBLICATION_SELECTION_SET:
      const { publicationIds, selected } = action.payload;
      const selectionUpdate = Set(publicationIds);
      const currentSelection = state.get('publicationSelection');
      const nextSelection = selected
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        ? currentSelection.union(selectionUpdate)
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        : currentSelection.subtract(selectionUpdate);
      return state.set('publicationSelection', nextSelection);
    case AUTHOR_PUBLICATION_SELECTION_CLEAR:
      return state.set('publicationSelection', Set());
    case AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY:
      return state.set('isAssignDrawerVisible', action.payload.visible);
    case AUTHOR_PUBLICATION_CLAIM_SELECTION:
      const claimedSelectionUpdate = Set(action.payload.papersIds);
      const currentClaimedSelection = state.get('publicationSelectionClaimed');
      const nextClaimedSelection = action.payload.selected
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        ? currentClaimedSelection.union(claimedSelectionUpdate)
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        : currentClaimedSelection.subtract(claimedSelectionUpdate);
      return state.set('publicationSelectionClaimed', nextClaimedSelection);
    case AUTHOR_PUBLICATIONS_CLAIM_CLEAR:
      return state.set('publicationSelectionClaimed', Set());
    case AUTHOR_PUBLICATION_UNCLAIM_SELECTION:
      const unclaimedSelectionUpdate = Set(action.payload.papersIds);
      const currentUnclaimedSelection = state.get(
        'publicationSelectionUnclaimed'
      );
      const nextUnclaimedSelection = action.payload.selected
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        ? currentUnclaimedSelection.union(unclaimedSelectionUpdate)
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        : currentUnclaimedSelection.subtract(unclaimedSelectionUpdate);
      return state.set('publicationSelectionUnclaimed', nextUnclaimedSelection);
    case AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR:
      return state.set('publicationSelectionUnclaimed', Set());
    case AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION:
      const canNotClaimPapersSelectionUpdate = Set(action.payload.papersIds);
      const currentcanNotClaimPapersSelection = state.get(
        'publicationSelectionCanNotClaim'
      );
      const nextcanNotClaimSelection = action.payload.selected
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        ? currentcanNotClaimPapersSelection.union(
            canNotClaimPapersSelectionUpdate
          )
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        : currentcanNotClaimPapersSelection.subtract(
            canNotClaimPapersSelectionUpdate
          );
      return state.set(
        'publicationSelectionCanNotClaim',
        nextcanNotClaimSelection
      );
    case AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR:
      return state.set('publicationSelectionCanNotClaim', Set());
    default:
      return state;
  }
};

export default authorsReducer;
